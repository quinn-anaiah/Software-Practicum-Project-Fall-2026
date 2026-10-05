import { Router } from "express";
import { supabase, getSupabaseAdmin } from "../services/supabase.js";

const studentRouter = Router();

studentRouter.get("/cases", async (request, response) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Authentication required.",
    });
  }

  const accessToken = authorization.slice(7);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return response.status(401).json({
      message: "Invalid or expired session.",
    });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .schema("learning")
    .from("student_case_assignments")
    .select(`
      id,
      encounter_status,
      case:cases (
        id,
        title,
        patient_name,
        patient_age,
        patient_sex,
        chief_complaint,
        history,
        medications,
        allergies,
        results,
        starting_encounter_status
      )
    `)
    .eq("student_id", user.id)
    .order("id");

  if (error) {
    console.error("Unable to fetch cases:", error.message);

    return response.status(500).json({
      message: "Unable to load cases.",
    });
  }

  const cases = data.map((assignment) => ({
    ...assignment.case,
    assignment_id: assignment.id,
    encounter_status: assignment.encounter_status,
  }));

  return response.json(cases);
});

export default studentRouter;