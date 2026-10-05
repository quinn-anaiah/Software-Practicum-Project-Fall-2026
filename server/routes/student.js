import { Router } from "express";
import { supabase } from "../services/supabase.js";

const studentRouter = Router();

studentRouter.get("/cases", async (_request, response) => {
  const { data, error } = await supabase
    .schema("learning")
    .from("cases")
    .select(`
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
    `)
    .order("id");

  if (error) {
    console.error("Unable to fetch cases:", error.message);

    return response.status(500).json({
      message: "Unable to load cases.",
    });
  }

  return response.json(data);
});

export default studentRouter;