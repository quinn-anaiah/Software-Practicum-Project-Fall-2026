import { Router } from "express";
import { supabase } from "../services/supabase.js";

const authRouter = Router();

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body;

  // 1. Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 🔍 CONSOLE LOG: Check the Supabase Auth response
  console.log("--- SUPABASE AUTH RESPONSE ---");
  console.log("Auth Error:", authError);
  console.log("Auth Data (Session/User):", authData);

  if (authError || !authData.user) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const userId = authData.user.id;
  console.log("User Id:", userId)


  // 2. Fetch their full profile using your join query
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      role_id,
      sub_role_id,
      roles:role_id(name),
      subroles:sub_role_id(name)
    `)
    .eq("id", userId)
    .single();

  // 🔍 CONSOLE LOG: Check the fetched profile data and any errors
  console.log("--- SUPABASE PROFILE FETCH ---");
  console.log("Profile Error:", profileError);
  console.log("Profile Data:", profileData);

  if (profileError || !profileData) {
    return response.status(500).json({ message: "User authenticated, but profile not found." });
  }

  // Flatten it neatly for your frontend user state
  const formattedUser = {
    id: profileData.id,
    email: authData.user.email,
    firstName: profileData.first_name,
    lastName: profileData.last_name,
    role: profileData.roles?.name,
    subrole: profileData.subroles?.name,
  };

  console.log("--- FORMATTED USER SENT TO FRONTEND ---", formattedUser);

  return response.json(formattedUser);
});

export default authRouter;