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

studentRouter.patch(
  "/cases/:assignmentId/status",
  async (request, response) => {
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
    const { encounterStatus } = request.body;

    const validStatuses = [
      "Scheduled",
      "Checked in",
      "Roomed",
      "In progress",
      "Checked out",
    ];

    if (!validStatuses.includes(encounterStatus)) {
      return response.status(400).json({
        message: "Invalid encounter status.",
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .schema("learning")
      .from("student_case_assignments")
      .update({
        encounter_status: encounterStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId)
      .eq("student_id", user.id)
      .select("id, case_id, encounter_status, updated_at")
      .maybeSingle();

    if (error) {
      console.error(
        "Unable to update encounter status:",
        error.message,
      );

      return response.status(500).json({
        message: "Unable to update encounter status.",
      });
    }

    if (!data) {
      return response.status(404).json({
        message: "Case assignment not found.",
      });
    }

    return response.json(data);
  },
);

studentRouter.post("/orders", async (request, response) => {
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

  const { assignmentId, orders } = request.body;

  if (!assignmentId || !Array.isArray(orders)) {
    return response.status(400).json({
      message: "Assignment and orders are required.",
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

  const existingOrders = orders.filter(
    (order) => typeof order.id === "number" && order.id < 1000000000000,
  );

  const newOrders = orders.filter(
    (order) => typeof order.id !== "number" || order.id >= 1000000000000,
  );

  for (const order of existingOrders) {
  const { error: updateError } = await supabaseAdmin
    .schema("learning")
    .from("orders")
    .update({
      order_type: order.type,
      order_name: order.name,
      status: "Draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("assignment_id", assignmentId);

  if (updateError) {
    console.error(
      "Unable to update order:",
      updateError.message,
    );

    return response.status(500).json({
      message: "Unable to save orders.",
    });
  }
}

  const existingOrderIds = existingOrders.map(
    (order) => order.id,
  );

  let deleteQuery = supabaseAdmin
    .schema("learning")
    .from("orders")
    .delete()
    .eq("assignment_id", assignmentId)
    .eq("status", "Draft");

  if (existingOrderIds.length > 0) {
    deleteQuery = deleteQuery.not(
      "id",
      "in",
      `(${existingOrderIds.join(",")})`,
    );
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    console.error(
      "Unable to remove deleted orders:",
      deleteError.message,
    );

    return response.status(500).json({
      message: "Unable to save orders.",
    });
  }

  let newSavedOrders = [];

  if (newOrders.length > 0) {
    const newOrdersToSave = newOrders.map((order) => ({
      assignment_id: assignmentId,
      order_type: order.type,
      order_name: order.name,
      status: "Draft",
    }));

    const { data, error } = await supabaseAdmin
      .schema("learning")
      .from("orders")
      .insert(newOrdersToSave)
      .select();

    if (error) {
      console.error(
        "Unable to save new orders:",
        error.message,
      );

      return response.status(500).json({
        message: "Unable to save orders.",
      });
    }

    newSavedOrders = data;
  }

  return response.status(200).json({
    message: "Orders saved successfully.",
  });
});

studentRouter.get(
  "/orders/:assignmentId",
  async (request, response) => {
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
      .from("orders")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("id");

    if (error) {
      console.error(
        "Unable to load orders:",
        error.message,
      );

      return response.status(500).json({
        message: "Unable to load orders.",
      });
    }

    return response.json(data);
  },
);

studentRouter.get("/classes", async (request, response) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication required." });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authorization.slice(7));

  if (authError || !user) {
    return response.status(401).json({ message: "Invalid or expired session." });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
    .schema("school")
    .from("classroom_enrollments")
    .select("classroom_id, status, enrolled_at")
    .eq("student_id", user.id);

  if (enrollmentsError) {
    console.error("Unable to load enrollments:", enrollmentsError.message);
    return response.status(500).json({ message: "Unable to load your classes." });
  }

  if (!enrollments.length) return response.json([]);

  const classroomIds = enrollments.map((row) => row.classroom_id);

  const [classroomsResult, membershipsResult] = await Promise.all([
    supabaseAdmin
      .schema("school")
      .from("classrooms")
      .select("id, crn, full_name, short_name, room, term, status")
      .in("id", classroomIds),
    supabaseAdmin
      .schema("school")
      .from("classroom_group_members")
      .select("group_id, classroom_id")
      .eq("student_id", user.id)
      .in("classroom_id", classroomIds),
  ]);

  if (classroomsResult.error || membershipsResult.error) {
    console.error(
      "Unable to load classes:",
      classroomsResult.error?.message || membershipsResult.error?.message,
    );
    return response.status(500).json({ message: "Unable to load your classes." });
  }

  const memberships = membershipsResult.data;
  let groups = [];

  if (memberships.length) {
    const { data, error } = await supabaseAdmin
      .schema("school")
      .from("classroom_groups")
      .select("id, name")
      .in("id", memberships.map((row) => row.group_id));

    if (error) {
      console.error("Unable to load groups:", error.message);
      return response.status(500).json({ message: "Unable to load your classes." });
    }
    groups = data;
  }

  const groupNameById = new Map(groups.map((group) => [group.id, group.name]));
  const groupByClassroom = new Map(
    memberships.map((row) => [row.classroom_id, groupNameById.get(row.group_id) || null]),
  );
  const enrollmentByClassroom = new Map(
    enrollments.map((row) => [row.classroom_id, row]),
  );

  return response.json(
    classroomsResult.data.map((classroom) => ({
      ...classroom,
      enrollmentStatus: enrollmentByClassroom.get(classroom.id)?.status ?? null,
      group: groupByClassroom.get(classroom.id) || null,
    })),
  );
});

export default studentRouter;