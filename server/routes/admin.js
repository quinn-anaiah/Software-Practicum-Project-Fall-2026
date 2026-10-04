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

  return supabaseAdmin;
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
    const supabaseAdmin = await requireAdmin(request, response);
    if (!supabaseAdmin) return;

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
      const firstName = profile?.first_name || authUser.user_metadata?.first_name || "";
      const lastName = profile?.last_name || authUser.user_metadata?.last_name || "";

      return {
        id: authUser.id,
        name: `${firstName} ${lastName}`.trim() || "Unnamed user",
        email: authUser.email || "",
        role: getRelationName(profile?.roles) || null,
        subrole: getRelationName(profile?.subroles) || null,
        utepId: profile?.utep_id || null,
        careflowId: profile?.careflow_id || null,
        createdAt: profile?.created_at || authUser.created_at || null,
        emailConfirmed: Boolean(authUser.email_confirmed_at),
        hasProfile: Boolean(profile),
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

export default adminRouter;
