import { Router } from "express";
import crypto from "crypto";
import { supabaseAdmin } from "../services/supabase.js";

const authRouter = Router();

const ROLE_ID_MAP = {
  Student: 1,
  Instructor: 2,
  Patient: 3,
};

authRouter.post("/register", async (request, response) => {
  const { firstName, lastName, email, password, role, utepID } = request.body;

  if (!firstName || !lastName || !email || !password) {
    return response.status(400).json({ 
      success: false, 
      message: "First name, last name, email, and password are required." 
    });
  }

  if (!supabaseAdmin) {
    return response.status(500).json({ 
      success: false, 
      message: "Backend admin client is not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env" 
    });
  }

  const emailTrimmed = email.trim().toLowerCase();

  // 1. Create user via Supabase Admin API 
  // (Bypasses email rate limits completely and auto-confirms the account for instant login)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: emailTrimmed,
    password: password,
    email_confirm: true, 
  });

  if (authError) {
    console.error("Supabase admin auth error:", authError.message);
    return response.status(400).json({ success: false, message: authError.message });
  }

  const userId = authData.user?.id;
  if (!userId) {
    return response.status(500).json({ 
      success: false, 
      message: "Failed to generate user ID from Supabase Auth." 
    });
  }

  // 2. Insert the corresponding record into your `profiles` table using the Admin client
  const roleId = ROLE_ID_MAP[role] || 1;
  const careflowId = crypto.randomUUID();

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: userId, // Links 1:1 with Supabase Auth user ID
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        utep_id: role === "Student" ? utepID || null : null,
        careflow_id: careflowId,
        role_id: roleId,
        sub_role_id: null,
      },
    ]);

  if (profileError) {
    console.error("Unable to create user profile:", profileError.message);
    return response.status(500).json({ 
      success: false, 
      message: "Auth user created, but profile insertion failed: " + profileError.message 
    });
  }

  return response.status(201).json({
    success: true,
    message: "Registration successful!",
    user: {
      id: userId,
      name: `${firstName} ${lastName}`,
      email: emailTrimmed,
      role: role || "Student",
      initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase(),
    },
  });
});

export default authRouter;