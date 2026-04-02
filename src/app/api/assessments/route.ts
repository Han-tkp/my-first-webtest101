import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { validateAssessmentData } from "@/lib/assessments";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });
    }

    const { error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get("equipmentId");
    const assessorId = searchParams.get("assessorId");

    let query = supabase
        .from("assessments")
        .select(`
            *,
            equipment:equipment_id (
                id,
                name,
                type,
                serial,
                brand,
                model,
                purchase_year
            )
        `)
        .order("assessment_date", { ascending: false });

    // Filter by equipment ID if provided
    if (equipmentId) {
        query = query.eq("equipment_id", Number(equipmentId));
    }

    // Filter by assessor ID if provided
    if (assessorId) {
        query = query.eq("assessor_id", assessorId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });
    }

    const { profile, error: authError } = await checkApiRole("admin", "technician");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    // Enforce rate limiting per user
    const rateLimit = await consumeRateLimit({
        action: "assessments.create",
        scope: profile!.id,
        limit: 20,
        windowSeconds: 60 * 60, // 1 hour
    });

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: "สร้างแบบประเมินถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" },
            {
                status: 429,
                headers: { "Retry-After": String(rateLimit.retryAfter) },
            },
        );
    }

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });

    // Parse JSON body
    const body = await request.json();
    const assessmentData = buildAssessmentDataFromBody(body, profile);

    // Validate data
    const validation = validateAssessmentData(assessmentData);
    if (!validation.valid) {
        return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 });
    }

    // Verify equipment exists and is accessible
    const { data: equipment } = await supabase
        .from("equipment")
        .select("id, name, type, brand, model, purchase_year")
        .eq("id", assessmentData.equipment_id)
        .maybeSingle();

    if (!equipment) {
        return NextResponse.json({ error: "ไม่พบอุปกรณ์ในระบบ" }, { status: 404 });
    }

    // Populate equipment details from equipment table if not provided
    if (!assessmentData.equipment_type) {
        assessmentData.equipment_type = equipment.type;
    }
    if (!assessmentData.equipment_brand && equipment.brand) {
        assessmentData.equipment_brand = equipment.brand;
    }
    if (!assessmentData.equipment_model && equipment.model) {
        assessmentData.equipment_model = equipment.model;
    }
    if (!assessmentData.equipment_purchase_year && equipment.purchase_year) {
        assessmentData.equipment_purchase_year = equipment.purchase_year;
    }

    // Insert assessment
    const { data, error } = await supabase
        .from("assessments")
        .insert([assessmentData])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
}

/**
 * Builds assessment data from request body
 */
function buildAssessmentDataFromBody(
    body: Record<string, unknown>,
    profile: { id: string; full_name: string },
) {
    const getOptionalString = (key: string): string | null => {
        const value = body[key];
        if (value === null || value === undefined || value === "") {
            return null;
        }
        return String(value).trim();
    };

    const getOptionalNumber = (key: string): number | null => {
        const value = body[key];
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const getOptionalBoolean = (key: string): boolean | null => {
        const value = body[key];
        if (value === null || value === undefined) {
            return null;
        }
        return value === true || value === "true" || value === "on";
    };

    const assessmentDate: string = getOptionalString("assessment_date") ?? new Date().toISOString().split("T")[0]!;
    const reportDate: string = getOptionalString("report_date") ?? assessmentDate;

    return {
        equipment_id: Number(body.equipment_id) || 0,
        assessor_id: profile.id,
        assessment_date: assessmentDate,
        assessor_name: profile.full_name,
        report_date: reportDate,

        // Equipment details
        equipment_type: getOptionalString("equipment_type"),
        equipment_brand: getOptionalString("equipment_brand"),
        equipment_model: getOptionalString("equipment_model"),
        equipment_purchase_year: getOptionalNumber("equipment_purchase_year"),

        // Flow control
        flow_control_type: getOptionalString("flow_control_type"),
        flow_control_size: getOptionalString("flow_control_size"),

        // Spray distance
        spray_distance: getOptionalString("spray_distance"),

        // External condition
        exterior_condition_class: getOptionalString("exterior_condition_class"),
        clean_exterior: getOptionalString("clean_exterior"),
        clean_nozzle: getOptionalString("clean_nozzle"),

        // Engine start
        engine_start_quality: getOptionalString("engine_start_quality"),

        // Existing fields
        exterior_condition: getOptionalString("exterior_condition"),
        engine_start: getOptionalString("engine_start"),
        clean_pipe: getOptionalBoolean("clean_pipe"),
        clean_chem_line: getOptionalBoolean("clean_chem_line"),
        clean_gas_tank: getOptionalBoolean("clean_gas_tank"),
        clean_chem_tank: getOptionalBoolean("clean_chem_tank"),

        // Chemical testing
        chem_name: getOptionalString("chem_name"),
        chem_concentration: getOptionalString("chem_concentration"),
        chemical_substance: getOptionalString("chemical_substance"),
        chemical_concentration: getOptionalString("chemical_concentration"),
        chemical_volume: getOptionalString("chemical_volume"),
        chemical_mix_ratio: getOptionalString("chemical_mix_ratio"),

        // Test environment
        season: getOptionalString("season"),
        location: getOptionalString("location"),

        // Measurement results
        result_temp: getOptionalString("result_temp"),
        result_flow_rate: getOptionalString("result_flow_rate"),
        vmd_value: getOptionalString("vmd_value"),
        span_value: getOptionalString("span_value"),

        // Recommendations
        recommendations: getOptionalString("recommendations"),
        notes: getOptionalString("notes"),
    };
}
