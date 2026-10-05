import { Router } from "express";
import { supabase } from "../services/supabase.js";

const authRouter = Router();

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body;

  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  
  console.log("--- SUPABASE AUTH RESPONSE ---");
  console.log("Auth Error:", authError);
  console.log("Auth Data (Session/User):", authData);


  if (authError || !authData.user) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const userId = authData.user.id;
  console.log("User Id:", userId)


  // get user profile from profile tables
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

  
  console.log("--- SUPABASE PROFILE FETCH ---");
  console.log("Profile Error:", profileError);
  console.log("Profile Data:", profileData);

  if (profileError || !profileData) {
    return response.status(500).json({ message: "User authenticated, but profile not found." });
  }
  const firstName = profileData.first_name || "";
  const lastName = profileData.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  
  const formattedUser = {
    id: profileData.id,
    email: authData.user.email,
    firstName: firstName,
    lastName: lastName,
    role: profileData.roles?.name,
    name: fullName,        
    initials: initials,    
    subrole: profileData.subroles?.name,
  };

  console.log("--- FORMATTED USER SENT TO FRONTEND ---", formattedUser);

  return response.json({
    ...formattedUser,
    accessToken: authData.session.access_token,
  });
});

export default authRouter;
