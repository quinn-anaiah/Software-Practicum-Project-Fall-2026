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

studentRouter.post("/notes", async (request, response) => {
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

  const { assignmentId, content } = request.body;

  if (!assignmentId || !content) {
    return response.status(400).json({
      message: "Assignment and note content are required.",
    });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Make sure this assignment belongs to the logged-in student.
  const { data: assignment, error: assignmentError } =
    await supabaseAdmin
      .schema("learning")
      .from("student_case_assignments")
      .select("id")
      .eq("id", assignmentId)
      .eq("student_id", user.id)
      .maybeSingle();

  if (assignmentError || !assignment) {
    return response.status(403).json({
      message: "You do not have access to this case.",
    });
  }

  // Check whether this assignment already has a SOAP note.
  const { data: existingNote, error: existingNoteError } =
    await supabaseAdmin
      .schema("learning")
      .from("notes")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("note_type", "soap")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (existingNoteError) {
    console.error(
      "Unable to check existing note:",
      existingNoteError.message,
    );

    return response.status(500).json({
      message: "Unable to save note.",
    });
  }

  let result;

  if (existingNote) {
    // Update the existing draft.
    result = await supabaseAdmin
      .schema("learning")
      .from("notes")
      .update({
        content,
        status: "Draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingNote.id)
      .select()
      .single();
  } else {
    // First save for this assignment.
    result = await supabaseAdmin
      .schema("learning")
      .from("notes")
      .insert({
        assignment_id: assignmentId,
        note_type: "soap",
        status: "Draft",
        content,
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error(
      "Unable to save note:",
      result.error.message,
    );

    return response.status(500).json({
      message: "Unable to save note.",
    });
  }

  return response.json(result.data);
});

studentRouter.get("/notes/:assignmentId", async (request, response) => {
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

  const { assignmentId } = request.params;

  const supabaseAdmin = getSupabaseAdmin();

  const { data: assignment, error: assignmentError } =
    await supabaseAdmin
      .schema("learning")
      .from("student_case_assignments")
      .select("id")
      .eq("id", assignmentId)
      .eq("student_id", user.id)
      .maybeSingle();

  if (assignmentError || !assignment) {
    return response.status(403).json({
      message: "You do not have access to this case.",
    });
  }

  const { data, error } = await supabaseAdmin
    .schema("learning")
    .from("notes")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("note_type", "soap")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Unable to load note:", error.message);

    return response.status(500).json({
      message: "Unable to load note.",
    });
  }

  return response.json(data);
});

export default studentRouter;