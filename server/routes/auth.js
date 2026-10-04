import { Router } from "express";
import { getSupabaseAdmin, supabase } from "../services/supabase.js";

const authRouter = Router();

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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, last_name, roles(name)")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Unable to load user profile:", profileError?.message);
      return response.status(403).json({
        message: "Your account is missing its Careflow profile. Contact an administrator.",
      });
    }

    const role = Array.isArray(profile.roles)
      ? profile.roles[0]?.name
      : profile.roles?.name;
    const initials = `${profile.first_name[0] || ""}${profile.last_name[0] || ""}`.toUpperCase();

    return response.json({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: authData.user.email,
      role,
      initials,
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

  if (!firstName || !lastName || !email || password.length < 8) {
    return response.status(400).json({
      message:
        "Enter a first name, last name, valid email, and a password with at least 8 characters.",
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
        message: "Unable to create the user profile. Please try again.",
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
