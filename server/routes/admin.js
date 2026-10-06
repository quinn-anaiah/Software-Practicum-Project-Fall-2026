import { Router } from "express";
import { getSupabaseAdmin, supabase } from "../services/supabase.js";

const adminRouter = Router();

function getRelationName(relation) {
  return Array.isArray(relation) ? relation[0]?.name : relation?.name;
}

function getAccessToken(request) {
  return (request.get("authorization") || "").replace(/^Bearer\s+/i, "");
}

async function requireAdmin(request, response) {
  const accessToken = getAccessToken(request);
  if (!accessToken) {
    response.status(401).json({ message: "Missing access token." });
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(
    accessToken,
  );
  if (authError || !authData.user) {
    response.status(401).json({ message: "Your session has expired." });
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("roles(name)")
    .eq("id", authData.user.id)
    .single();

  if (profileError || getRelationName(profile?.roles) !== "Admin") {
    response.status(403).json({ message: "Administrator access is required." });
    return null;
  }

  return { supabaseAdmin, actor: authData.user };
}

function isAdminRole(roleName) {
  return String(roleName || "").toLowerCase() === "admin";
}

function getDisplayName(profile, fallbackUser) {
  const firstName = profile?.first_name || fallbackUser?.user_metadata?.first_name || "";
  const lastName = profile?.last_name || fallbackUser?.user_metadata?.last_name || "";
  return `${firstName} ${lastName}`.trim() || "Unnamed user";
}

async function writeAuditLog(supabaseAdmin, entry) {
  const { error } = await supabaseAdmin.from("admin_audit_log").insert(entry);
  if (error) {
    console.error("Unable to write admin audit log:", error.message);
    throw new Error(
      "Account management is not ready yet. Run the admin audit-log SQL setup first.",
    );
  }
}

async function ensureAuditLogReady(supabaseAdmin, response) {
  const { error } = await supabaseAdmin.from("admin_audit_log").select("id").limit(1);
  if (!error) return true;
  response.status(503).json({
    message: "Run the admin audit-log SQL setup before managing accounts.",
  });
  return false;
}

async function getRoleAndSubrole(supabaseAdmin, roleId, subroleId) {
  const [{ data: role, error: roleError }, subroleResult] = await Promise.all([
    supabaseAdmin.from("roles").select("id, name").eq("id", roleId).single(),
    subroleId
      ? supabaseAdmin.from("subroles").select("id, name").eq("id", subroleId).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (roleError || !role || subroleResult.error) return null;
  return { role, subrole: subroleResult.data };
}

function buildStats(users) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const roleCounts = users.reduce((counts, user) => {
    const role = user.role || "Unassigned";
    counts[role] = (counts[role] || 0) + 1;
    return counts;
  }, {});

  return {
    totalUsers: users.length,
    newThisWeek: users.filter(
      (user) => user.createdAt && new Date(user.createdAt).getTime() >= oneWeekAgo,
    ).length,
    usersWithSubrole: users.filter((user) => user.subrole).length,
    roleBreakdown: Object.entries(roleCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => second.count - first.count),
  };
}

adminRouter.get("/users", async (request, response) => {
  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin } = adminContext;

    const [{ data: profiles, error: profilesError }, authResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select(
            "id, first_name, last_name, utep_id, careflow_id, created_at, roles(name), subroles(name)",
          )
          .order("created_at", { ascending: false }),
        supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      ]);

    if (profilesError || authResult.error) {
      console.error(
        "Unable to load admin directory:",
        profilesError?.message || authResult.error?.message,
      );
      return response.status(500).json({ message: "Unable to load the user directory." });
    }

    const profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]));
    const directory = (authResult.data.users || []).map((authUser) => {
      const profile = profilesById.get(authUser.id);
      return {
        id: authUser.id,
        name: getDisplayName(profile, authUser),
        email: authUser.email || "",
        role: getRelationName(profile?.roles) || null,
        subrole: getRelationName(profile?.subroles) || null,
        utepId: profile?.utep_id || null,
        careflowId: profile?.careflow_id || null,
        createdAt: profile?.created_at || authUser.created_at || null,
        emailConfirmed: Boolean(authUser.email_confirmed_at),
        hasProfile: Boolean(profile),
        isActive: !authUser.banned_until || new Date(authUser.banned_until) <= new Date(),
      };
    });
    const search = String(request.query.query || "").trim().toLowerCase();
    const users = search
      ? directory.filter((user) =>
          [
            user.name,
            user.email,
            user.role,
            user.subrole,
            user.utepId,
            user.careflowId,
            user.id,
          ].some((value) => String(value || "").toLowerCase().includes(search)),
        )
      : directory;

    return response.json({ users, stats: buildStats(directory) });
  } catch (error) {
    console.error("Unable to load admin directory:", error);
    return response.status(500).json({ message: "Unable to load the user directory." });
  }
});

adminRouter.get("/patients", async (request, response) => {
  try {
    // Make sure the person requesting this page is actually an Admin.
    const adminContext = await requireAdmin(request, response);

    if (!adminContext) {
      return;
    }

    const { supabaseAdmin } = adminContext;

    // Get profile information from Supabase.
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, first_name, last_name, careflow_id, created_at, roles(name)",
      )
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error(
        "Unable to load patient profiles:",
        profilesError.message,
      );

      return response.status(500).json({
        message: "Unable to load patients.",
      });
    }

    // Keep only profiles whose role is Patient.
    const patientProfiles = (profiles || []).filter((profile) => {
      return getRelationName(profile.roles) === "Patient";
    });

    // Get the Supabase Auth users so we can also display email addresses.
    const authResult = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    // Check whether Supabase returned an error.
    if (authResult.error) {
      console.error(
        "Unable to load patient accounts:",
        authResult.error.message,
      );

      return response.status(500).json({
        message: "Unable to load patient accounts.",
      });
    }

    // Get the list of Auth users.
    // If Supabase does not return a users array, use an empty array.
    const authUsers = authResult.data?.users || [];

    // Create a Map so we can quickly match a profile to its Auth account.
    const authUsersById = new Map();

    for (const authUser of authUsers) {
      authUsersById.set(authUser.id, authUser);
    }

    // Build a simpler patient object for the React frontend.
    const patients = patientProfiles.map((profile) => {
      const authUser = authUsersById.get(profile.id);

      const firstName = profile.first_name || "";
      const lastName = profile.last_name || "";

      return {
        id: profile.id,
        careflowId: profile.careflow_id || null,
        name: `${firstName} ${lastName}`.trim(),
        email: authUser?.email || "",
        createdAt: profile.created_at || null,
      };
    });

    // Send the patient list back to React.
    return response.json(patients);
  } catch (error) {
    console.error("Unable to load patient directory:", error);

    return response.status(500).json({
      message: "Unable to load patients.",
    });
  }
});

adminRouter.get("/patients/:patientId", async (request, response) => {
  try {
    // Make sure the person requesting the patient is an Admin.
    const adminContext = await requireAdmin(request, response);

    if (!adminContext) {
      return;
    }

    const { supabaseAdmin } = adminContext;

    // Get the patient ID from the URL.
    const patientId = request.params.patientId;

    // Find the patient's profile in the profiles table.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, first_name, last_name, careflow_id, created_at, roles(name)",
      )
      .eq("id", patientId)
      .single();

    if (profileError || !profile) {
      return response.status(404).json({
        message: "Patient not found.",
      });
    }

    // Make sure this profile actually belongs to a Patient.
    if (getRelationName(profile.roles) !== "Patient") {
      return response.status(404).json({
        message: "Patient not found.",
      });
    }

    // Get the matching Supabase Auth account.
    const authResult =
      await supabaseAdmin.auth.admin.getUserById(patientId);

    if (authResult.error || !authResult.data?.user) {
      return response.status(500).json({
        message: "Unable to load the patient account.",
      });
    }

    const authUser = authResult.data.user;

    // Get the patient's information from patient_records.
    const { data: patientRecord, error: patientRecordError } =
      await supabaseAdmin
        .from("patient_records")
        .select(
          "date_of_birth, sex, phone, address, primary_provider, created_at, updated_at",
        )
        .eq("profile_id", patientId)
        .maybeSingle();

    if (patientRecordError) {
      console.error(
        "Unable to load patient information:",
        patientRecordError.message,
      );

      return response.status(500).json({
        message: "Unable to load patient information.",
      });
    }

    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";

    // Build the patient object that will be sent to React.
    const patient = {
      // Account information from profiles and Supabase Auth.
      id: profile.id,
      careflowId: profile.careflow_id || null,
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: authUser.email || "",
      createdAt: profile.created_at || authUser.created_at || null,
      emailConfirmed: Boolean(authUser.email_confirmed_at),

      isActive:
        !authUser.banned_until ||
        new Date(authUser.banned_until) <= new Date(),

      // Patient-specific information from patient_records.
      dateOfBirth: patientRecord?.date_of_birth || null,
      sex: patientRecord?.sex || null,
      phone: patientRecord?.phone || null,
      address: patientRecord?.address || null,
      primaryProvider: patientRecord?.primary_provider || null,
    };

    return response.json(patient);
  } catch (error) {
    console.error("Unable to load patient record:", error);

    return response.status(500).json({
      message: "Unable to load patient record.",
    });
  }
});

adminRouter.get("/access-options", async (request, response) => {
  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin } = adminContext;
    const [{ data: roles, error: rolesError }, { data: subroles, error: subrolesError }] =
      await Promise.all([
        supabaseAdmin.from("roles").select("id, name").order("name"),
        supabaseAdmin.from("subroles").select("id, name").order("name"),
      ]);

    if (rolesError || subrolesError) {
      return response.status(500).json({ message: "Unable to load access options." });
    }

    return response.json({
      roles: (roles || []).filter((role) => !isAdminRole(role.name)),
      subroles: subroles || [],
    });
  } catch (error) {
    console.error("Unable to load access options:", error);
    return response.status(500).json({ message: "Unable to load access options." });
  }
});

adminRouter.post("/users/invite", async (request, response) => {
  const firstName = String(request.body.firstName || "").trim();
  const lastName = String(request.body.lastName || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const utepId = String(request.body.utepId || "").trim() || null;
  const roleId = Number(request.body.roleId);
  const subroleId = request.body.subroleId ? Number(request.body.subroleId) : null;

  if (!firstName || !lastName || !/^[^\s@]+@careflow\.test$/i.test(email) || !roleId) {
    return response.status(400).json({
      message: "Enter a name, a valid @careflow.test email, and an account role.",
    });
  }

  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin, actor } = adminContext;
    const access = await getRoleAndSubrole(supabaseAdmin, roleId, subroleId);
    if (!access || isAdminRole(access.role.name)) {
      return response.status(400).json({
        message: "Administrators cannot create or assign Admin accounts here.",
      });
    }

    // Validate prerequisites before creating an Auth identity, so a missing audit table
    // cannot leave behind a partially provisioned account.
    if (!(await ensureAuditLogReady(supabaseAdmin, response))) return;

    const { data: invitation, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          display_name: `${firstName} ${lastName}`,
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
        },
        redirectTo: process.env.APP_URL || "http://localhost:5173/set-password",
      });

    if (inviteError || !invitation.user) {
      return response.status(400).json({
        message: inviteError?.message || "Unable to send this invitation.",
      });
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: invitation.user.id,
      first_name: firstName,
      last_name: lastName,
      utep_id: utepId,
      role_id: access.role.id,
      sub_role_id: access.subrole?.id || null,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(invitation.user.id);
      return response.status(500).json({
        message: `Unable to create the Careflow profile: ${profileError.message}`,
      });
    }

    try {
      await writeAuditLog(supabaseAdmin, {
        actor_id: actor.id,
        target_user_id: invitation.user.id,
        action: "account.invited",
        details: { email, role: access.role.name, subrole: access.subrole?.name || null },
      });
    } catch (auditError) {
      console.error(auditError);
    }

    return response.status(201).json({
      message: `Invitation sent to ${email}.`,
    });
  } catch (error) {
    console.error("Unable to invite account:", error);
    return response.status(500).json({ message: "Unable to invite this account." });
  }
});

adminRouter.patch("/users/:userId/access", async (request, response) => {
  const roleId = Number(request.body.roleId);
  const subroleId = request.body.subroleId ? Number(request.body.subroleId) : null;

  if (!roleId) return response.status(400).json({ message: "Choose an account role." });

  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin, actor } = adminContext;
    if (!(await ensureAuditLogReady(supabaseAdmin, response))) return;
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from("profiles")
      .select("id, role_id, sub_role_id, roles(name), subroles(name)")
      .eq("id", request.params.userId)
      .single();
    const access = await getRoleAndSubrole(supabaseAdmin, roleId, subroleId);

    if (targetError || !targetProfile || !access) {
      return response.status(404).json({ message: "The requested account was not found." });
    }
    if (isAdminRole(getRelationName(targetProfile.roles)) || isAdminRole(access.role.name)) {
      return response.status(403).json({
        message: "Admin role assignments are restricted to a separate Super Admin process.",
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role_id: access.role.id, sub_role_id: access.subrole?.id || null })
      .eq("id", targetProfile.id);
    if (updateError) return response.status(500).json({ message: "Unable to update access." });

    await writeAuditLog(supabaseAdmin, {
      actor_id: actor.id,
      target_user_id: targetProfile.id,
      action: "account.access_updated",
      details: {
        previousRole: getRelationName(targetProfile.roles),
        previousSubrole: getRelationName(targetProfile.subroles) || null,
        role: access.role.name,
        subrole: access.subrole?.name || null,
      },
    });
    return response.json({ message: "Account access updated." });
  } catch (error) {
    console.error("Unable to update account access:", error);
    return response.status(500).json({ message: error.message || "Unable to update access." });
  }
});

adminRouter.post("/users/:userId/password-reset", async (request, response) => {
  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin, actor } = adminContext;
    if (!(await ensureAuditLogReady(supabaseAdmin, response))) return;
    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(
      request.params.userId,
    );
    if (targetError || !target.user) return response.status(404).json({ message: "Account not found." });
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("roles(name)")
      .eq("id", target.user.id)
      .single();
    if (isAdminRole(getRelationName(targetProfile?.roles))) {
      return response.status(403).json({ message: "Admin accounts cannot be changed here." });
    }

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(target.user.email, {
      redirectTo: process.env.APP_URL || "http://localhost:5173/set-password",
    });
    if (resetError) return response.status(400).json({ message: resetError.message });

    await writeAuditLog(supabaseAdmin, {
      actor_id: actor.id,
      target_user_id: target.user.id,
      action: "account.password_reset_requested",
      details: { email: target.user.email },
    });
    return response.json({ message: `A password-reset email was sent to ${target.user.email}.` });
  } catch (error) {
    console.error("Unable to request password reset:", error);
    return response.status(500).json({ message: error.message || "Unable to request a password reset." });
  }
});

adminRouter.patch("/users/:userId/status", async (request, response) => {
  const isActive = Boolean(request.body.isActive);
  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin, actor } = adminContext;
    if (!(await ensureAuditLogReady(supabaseAdmin, response))) return;
    if (actor.id === request.params.userId) {
      return response.status(400).json({ message: "You cannot deactivate your own account." });
    }
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("roles(name)")
      .eq("id", request.params.userId)
      .single();
    if (isAdminRole(getRelationName(targetProfile?.roles))) {
      return response.status(403).json({ message: "Admin accounts cannot be changed here." });
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(request.params.userId, {
      ban_duration: isActive ? "none" : "876000h",
    });
    if (error) return response.status(400).json({ message: error.message });
    await writeAuditLog(supabaseAdmin, {
      actor_id: actor.id,
      target_user_id: request.params.userId,
      action: isActive ? "account.activated" : "account.deactivated",
      details: { isActive },
    });
    return response.json({ message: isActive ? "Account reactivated." : "Account deactivated." });
  } catch (error) {
    console.error("Unable to change account status:", error);
    return response.status(500).json({ message: error.message || "Unable to change account status." });
  }
});

adminRouter.get("/audit-log", async (request, response) => {
  try {
    const adminContext = await requireAdmin(request, response);
    if (!adminContext) return;
    const { supabaseAdmin } = adminContext;
    const { data, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("id, actor_id, target_user_id, action, details, created_at")
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) return response.status(503).json({ message: "Run the admin audit-log SQL setup first." });
    return response.json(data || []);
  } catch (error) {
    console.error("Unable to load audit log:", error);
    return response.status(500).json({ message: "Unable to load the audit log." });
  }
});

export default adminRouter;
