import { Router } from "express";
import { getSupabaseAdmin, supabase } from "../services/supabase.js";

const authRouter = Router();

function getRelationName(relation) {
  return Array.isArray(relation) ? relation[0]?.name : relation?.name;
}

function serializeUser(profile, email) {
  const firstName = profile.first_name || "";
  const lastName = profile.last_name || "";

  return {
    id: profile.id,
    name: `${firstName} ${lastName}`.trim(),
    email: email || "",
    role: getRelationName(profile.roles),
    subrole: getRelationName(profile.subroles) || null,
    initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase(),
  };
}

async function getProfileForUser(supabaseAdmin, userId) {
  return supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, roles(name), subroles(name)")
    .eq("id", userId)
    .single();
}

authRouter.get("/me", async (request, response) => {
  const authorization = request.get("authorization") || "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return response.status(401).json({ message: "Missing access token." });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(
      accessToken,
    );

    if (authError || !authData.user) {
      return response.status(401).json({ message: "Your session has expired." });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await getProfileForUser(
      supabaseAdmin,
      authData.user.id,
    );

    if (profileError || !profile) {
      console.error("Unable to load current user profile:", profileError?.message);
      return response.status(403).json({
        message: "Your account is missing its Careflow profile. Contact an administrator.",
      });
    }

    return response.json(serializeUser(profile, authData.user.email));
  } catch (error) {
    console.error("Unable to restore session:", error);
    return response.status(500).json({ message: "Unable to restore your session." });
  }
});

authRouter.post("/login", async (request, response) => {
  const email = String(request.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(request.body.password || "");

  if (!email || !password) {
    return response
      .status(400)
      .json({ message: "Enter your email address and password." });
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      return response.status(401).json({
        message: "That email or password is incorrect.",
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await getProfileForUser(
      supabaseAdmin,
      authData.user.id,
    );

    if (profileError || !profile) {
      console.error("Unable to load user profile:", profileError?.message);
      return response.status(403).json({
        message: "Your account is missing its Careflow profile. Contact an administrator.",
      });
    }

    if (!authData.session?.access_token) {
      return response.status(500).json({ message: "Unable to start a session." });
    }

    return response.json({
      ...serializeUser(profile, authData.user.email),
      accessToken: authData.session.access_token,
    });
  } catch (error) {
    console.error("Login failed:", error);
    return response.status(500).json({
      message: "Sign in is not configured yet. Contact the application administrator.",
    });
  }
});

authRouter.post("/register", async (request, response) => {
  const firstName = String(request.body.firstName || "").trim();
  const lastName = String(request.body.lastName || "").trim();
  const email = String(request.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(request.body.password || "");
  const utepId = String(request.body.utepId || "").trim() || null;
  const accountType = String(request.body.accountType || "Student");
  const allowedAccountTypes = ["Student", "Patient"];
  const isCareflowEmail = /^[^\s@]+@careflow\.test$/i.test(email);

  if (!firstName || !lastName || !email || password.length < 8) {
    return response.status(400).json({
      message:
        "Enter a first name, last name, valid email, and a password with at least 8 characters.",
    });
  }

  if (!isCareflowEmail) {
    return response.status(400).json({
      message: "Use a Careflow email address ending in @careflow.test.",
    });
  }

  if (!allowedAccountTypes.includes(accountType)) {
    return response.status(400).json({
      message: "Choose either a Student or Patient account type.",
    });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: accountRole, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", accountType)
      .single();

    if (roleError || !accountRole) {
      console.error("Unable to find the selected role:", roleError?.message);
      return response
        .status(500)
        .json({ message: `The ${accountType} role is not configured.` });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: `${firstName} ${lastName}`,
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (authError || !authData.user) {
      return response.status(400).json({
        message: authError?.message || "Unable to create the account.",
      });
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      utep_id: utepId,
      role_id: accountRole.id,
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error("Unable to create profile:", profileError.message);
      return response.status(500).json({
        message: `Unable to create the user profile: ${profileError.code || "database error"} — ${profileError.message}`,
      });
    }

    return response.status(201).json({
      message: `Your ${accountType} account has been created. You can now sign in.`,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return response.status(500).json({
      message: "Registration is not configured yet. Contact the application administrator.",
    });
  }
});

export default authRouter;
