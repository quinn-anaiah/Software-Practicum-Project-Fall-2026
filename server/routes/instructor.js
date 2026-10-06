import { Router } from "express";
import { getSupabaseAdmin, supabase } from "../services/supabase.js";

const instructorRouter = Router();

function relationName(relation) {
  return Array.isArray(relation) ? relation[0]?.name : relation?.name;
}

function accessToken(request) {
  return (request.get("authorization") || "").replace(/^Bearer\s+/i, "");
}

function formatProfile(profile) {
  return {
    id: profile.id,
    name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
    subrole: relationName(profile.subroles) || null,
  };
}

async function requireInstructor(request, response) {
  const token = accessToken(request);
  if (!token) {
    response.status(401).json({ message: "Missing access token." });
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    response.status(401).json({ message: "Your session has expired." });
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, role_id, sub_role_id, roles(name), subroles(name)")
    .eq("id", authData.user.id)
    .single();

  if (profileError || relationName(profile?.roles) !== "Instructor") {
    response.status(403).json({ message: "Instructor access is required." });
    return null;
  }
  if (!profile.sub_role_id) {
    response.status(403).json({
      message: "Your Instructor profile needs a subrole before you can manage classrooms.",
    });
    return null;
  }

  return { supabaseAdmin, profile };
}

async function getInstructorClassrooms(supabaseAdmin, instructorId) {
  const school = supabaseAdmin.schema("school");
  const { data: memberships, error: membershipError } = await school
    .from("classroom_instructors")
    .select("classroom_id, access_level")
    .eq("instructor_id", instructorId);
  if (membershipError) throw membershipError;

  const classroomIds = (memberships || []).map((membership) => membership.classroom_id);
  if (!classroomIds.length) return [];

  const { data: classrooms, error: classroomError } = await school
    .from("classrooms")
    .select("id, crn, full_name, short_name, room, term, discipline_subrole_id, status, created_at")
    .in("id", classroomIds)
    .order("created_at", { ascending: false });
  if (classroomError) throw classroomError;

  const disciplineIds = [...new Set(classrooms.map((classroom) => classroom.discipline_subrole_id))];
  const { data: subroles, error: subroleError } = await supabaseAdmin
    .from("subroles")
    .select("id, name")
    .in("id", disciplineIds);
  if (subroleError) throw subroleError;

  const disciplineNames = new Map((subroles || []).map((subrole) => [subrole.id, subrole.name]));
  const accessLevels = new Map((memberships || []).map((membership) => [membership.classroom_id, membership.access_level]));
  return (classrooms || []).map((classroom) => ({
    ...classroom,
    discipline: disciplineNames.get(classroom.discipline_subrole_id) || "Unassigned discipline",
    accessLevel: accessLevels.get(classroom.id) || "co_instructor",
  }));
}

async function verifyClassroomAccess(supabaseAdmin, profile, classroomId) {
  const school = supabaseAdmin.schema("school");
  const { data: membership, error: membershipError } = await school
    .from("classroom_instructors")
    .select("access_level")
    .eq("classroom_id", classroomId)
    .eq("instructor_id", profile.id)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: classroom, error: classroomError } = await school
    .from("classrooms")
    .select("id, crn, full_name, short_name, room, term, discipline_subrole_id, status")
    .eq("id", classroomId)
    .single();
  if (classroomError) throw classroomError;
  if (classroom.discipline_subrole_id !== profile.sub_role_id) return null;

  return { classroom, accessLevel: membership.access_level };
}

async function eligibleStudents(supabaseAdmin, subroleId) {
  const { data: studentRole, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", "Student")
    .single();
  if (roleError || !studentRole) throw roleError || new Error("Student role is not configured.");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, subroles(name)")
    .eq("role_id", studentRole.id)
    .eq("sub_role_id", subroleId)
    .order("last_name");
  if (error) throw error;
  return (data || []).map(formatProfile);
}

instructorRouter.get("/dashboard", async (request, response) => {
  try {
    const context = await requireInstructor(request, response);
    if (!context) return;
    const classrooms = await getInstructorClassrooms(context.supabaseAdmin, context.profile.id);
    const school = context.supabaseAdmin.schema("school");
    const classroomIds = classrooms.map((classroom) => classroom.id);
    const [{ data: enrollments, error: enrollmentError }, { data: groups, error: groupError }] =
      classroomIds.length
        ? await Promise.all([
            school.from("classroom_enrollments").select("classroom_id").in("classroom_id", classroomIds).eq("status", "active"),
            school.from("classroom_groups").select("classroom_id").in("classroom_id", classroomIds),
          ])
        : [{ data: [], error: null }, { data: [], error: null }];
    if (enrollmentError || groupError) throw enrollmentError || groupError;

    const enrollmentCounts = (enrollments || []).reduce((counts, enrollment) => {
      counts[enrollment.classroom_id] = (counts[enrollment.classroom_id] || 0) + 1;
      return counts;
    }, {});
    const groupCounts = (groups || []).reduce((counts, group) => {
      counts[group.classroom_id] = (counts[group.classroom_id] || 0) + 1;
      return counts;
    }, {});

    return response.json({
      discipline: relationName(context.profile.subroles),
      metrics: {
        learners: (enrollments || []).length,
        activeClassrooms: classrooms.filter((classroom) => classroom.status === "active").length,
        draftClassrooms: classrooms.filter((classroom) => classroom.status === "draft").length,
      },
      classrooms: classrooms.map((classroom) => ({
        ...classroom,
        learnerCount: enrollmentCounts[classroom.id] || 0,
        groupCount: groupCounts[classroom.id] || 0,
      })),
    });
  } catch (error) {
    console.error("Unable to load instructor dashboard:", error);
    return response.status(500).json({ message: "Unable to load your instructor dashboard." });
  }
});

instructorRouter.get("/classrooms", async (request, response) => {
  try {
    const context = await requireInstructor(request, response);
    if (!context) return;
    const classrooms = await getInstructorClassrooms(context.supabaseAdmin, context.profile.id);
    return response.json({ classrooms, discipline: relationName(context.profile.subroles) });
  } catch (error) {
    console.error("Unable to load classrooms:", error);
    return response.status(500).json({ message: "Unable to load your classrooms." });
  }
});

instructorRouter.get("/eligible-students", async (request, response) => {
  try {
    const context = await requireInstructor(request, response);
    if (!context) return;
    const students = await eligibleStudents(context.supabaseAdmin, context.profile.sub_role_id);
    return response.json({
      discipline: relationName(context.profile.subroles),
      students,
    });
  } catch (error) {
    console.error("Unable to load eligible students:", error);
    return response.status(500).json({ message: "Unable to load eligible students." });
  }
});

instructorRouter.get("/classrooms/:classroomId", async (request, response) => {
  try {
    const context = await requireInstructor(request, response);
    if (!context) return;
    const access = await verifyClassroomAccess(
      context.supabaseAdmin,
      context.profile,
      request.params.classroomId,
    );
    if (!access) return response.status(404).json({ message: "Classroom not found." });

    const school = context.supabaseAdmin.schema("school");
    const [{ data: enrollments, error: enrollmentError }, { data: groups, error: groupError }, eligible] =
      await Promise.all([
        school.from("classroom_enrollments").select("student_id, status").eq("classroom_id", access.classroom.id).eq("status", "active"),
        school.from("classroom_groups").select("id, name").eq("classroom_id", access.classroom.id).order("name"),
        eligibleStudents(context.supabaseAdmin, access.classroom.discipline_subrole_id),
      ]);
    if (enrollmentError || groupError) throw enrollmentError || groupError;

    const enrolledIds = (enrollments || []).map((enrollment) => enrollment.student_id);
    const enrolled = eligible.filter((student) => enrolledIds.includes(student.id));
    const availableStudents = eligible.filter((student) => !enrolledIds.includes(student.id));
    return response.json({
      classroom: { ...access.classroom, discipline: relationName(context.profile.subroles) },
      accessLevel: access.accessLevel,
      students: enrolled,
      availableStudents,
      groups: groups || [],
    });
  } catch (error) {
    console.error("Unable to load classroom:", error);
    return response.status(500).json({ message: "Unable to load this classroom." });
  }
});

instructorRouter.post("/classrooms", async (request, response) => {
  const crn = String(request.body.crn || "").trim();
  const fullName = String(request.body.fullName || "").trim();
  const shortName = String(request.body.shortName || "").trim();
  const room = String(request.body.room || "").trim() || null;
  const term = String(request.body.term || "").trim();
  const studentIds = [...new Set(Array.isArray(request.body.studentIds) ? request.body.studentIds : [])];

  if (!crn || !fullName || !shortName || !term) {
    return response.status(400).json({ message: "Enter a CRN, full name, short name, and term." });
  }

  try {
    const context = await requireInstructor(request, response);
    if (!context) return;
    const eligible = await eligibleStudents(context.supabaseAdmin, context.profile.sub_role_id);
    const eligibleIds = new Set(eligible.map((student) => student.id));
    if (!studentIds.every((studentId) => eligibleIds.has(studentId))) {
      return response.status(400).json({
        message: "Students must have the Student role and the same discipline as this classroom.",
      });
    }

    const school = context.supabaseAdmin.schema("school");
    const { data: classroom, error: classroomError } = await school
      .from("classrooms")
      .insert({
        crn,
        full_name: fullName,
        short_name: shortName,
        room,
        term,
        discipline_subrole_id: context.profile.sub_role_id,
        created_by: context.profile.id,
        status: "active",
      })
      .select("id, crn, full_name, short_name, room, term, discipline_subrole_id, status")
      .single();
    if (classroomError) return response.status(400).json({ message: classroomError.message });

    const { error: instructorError } = await school.from("classroom_instructors").insert({
      classroom_id: classroom.id,
      instructor_id: context.profile.id,
      access_level: "owner",
    });
    if (instructorError) {
      await school.from("classrooms").delete().eq("id", classroom.id);
      throw instructorError;
    }

    if (studentIds.length) {
      const { error: enrollmentError } = await school.from("classroom_enrollments").insert(
        studentIds.map((studentId) => ({ classroom_id: classroom.id, student_id: studentId })),
      );
      if (enrollmentError) {
        await school.from("classrooms").delete().eq("id", classroom.id);
        throw enrollmentError;
      }
    }

    return response.status(201).json({
      classroom: { ...classroom, discipline: relationName(context.profile.subroles) },
      message: `${shortName} has been created.`,
    });
  } catch (error) {
    console.error("Unable to create classroom:", error);
    return response.status(500).json({ message: "Unable to create this classroom." });
  }
});

export default instructorRouter;
