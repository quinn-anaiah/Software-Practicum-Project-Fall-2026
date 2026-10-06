import { Router } from "express";
import { createSupabaseUserSessionClient } from "../services/supabase.js";

const casesRouter = Router();

casesRouter.get("/", async (request, response) => {
  try {
    const authorization = request.headers.authorization;
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!accessToken) {
      return response.status(401).json({
        message: "Login required.",
      });
    }

    const supabase = createSupabaseUserSessionClient(accessToken);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return response.status(401).json({
        message: "Invalid or expired session. Please sign in again.",
      });
    }

    const { data, error } = await supabase
      .schema("learning")
      .from("cases")
      .select(
        "id, title, patient_name, patient_age, patient_sex, " +
          "chief_complaint, history, medications, allergies, " +
          "results, starting_encounter_status",
      )
      .order("id");

    if (error) throw error;

    return response.json(data ?? []);
  } catch (error) {
    console.error("Unable to fetch cases:", error.message);

    return response.status(500).json({
      message: "Unable to load cases.",
    });
  }
});

export default casesRouter;