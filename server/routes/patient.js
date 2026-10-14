import { Router } from "express";
import { getSupabaseAdmin, supabase } from "../services/supabase.js";

const patientRouter = Router();

function accessToken(request) {
    return (request.get("authorization") || "").replace(/^Bearer\s+/i, "");
}

function formatProfile(profile) {
    return {
        id: profile.id,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
        subrole: null,
        utepId: profile.utep_id || null,
    };
}

async function requirePatient(request, response) {
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
    // const { data: profile, error: profileError } = await supabaseAdmin
    //     .from("profiles")
    //     .select("id, first_name, last_name, role_id, sub_role_id, roles(name), subroles(name)")
    //     .eq("id", authData.user.id)
    //     .single();

    // if (profileError || relationName(profile?.roles) !== "Patient") {
    //     response.status(403).json({ message: "Patient access is required." });
    //     return null;
    // } might not need actual profile if all deatails oare in auth user 

    return { supabaseAdmin: supabaseAdmin, user: authData.user };

}

patientRouter.get("/dashboard", async (request, response) => {
    try {
        const context = await requirePatient(request, response);
        if (!context) return;

        const { supabaseAdmin, user } = context
        const patientId = user.id;
        console.log("Patient Id", user.id)

        const [history, medications, appointments, careTeam, updates] = await Promise.all([
            supabaseAdmin.schema('patient_portal').from('medical_history').select('*').eq('profile_id', patientId),
            supabaseAdmin.schema('patient_portal').from('medications').select('*').eq('patient_id', patientId),
            supabaseAdmin.schema('patient_portal').from('appointments').select('*').eq('patient_id', patientId),
            supabaseAdmin.schema('patient_portal').from('care_team').select('*').eq('patient_id', patientId),
            supabaseAdmin.schema('patient_portal').from('clinical_updates').select('*').eq('patient_id', patientId)
        ]);

        console.log("History", history)

        return response.json({
            metrics: {
                activeMedications: (medications.data || []).filter(m => m.status === 'Active').length,
                upcomingAppointments: (appointments.data || []).filter(a => a.status === 'Scheduled').length,
                unreadUpdates: (updates.data || []).filter(u => !u.is_read).length
            },
            medicalHistory: history.data || [],
            medications: medications.data || [],
            appointments: appointments.data || [],
            careTeam: careTeam.data || [],
            clinicalUpdates: updates.data || []
        });
    } catch (error) {
        console.error("Unable to load patient overview:", error);
        return response.status(500).json({ message: "Unable to load patient dashboard." });
    }

});

export default patientRouter;
