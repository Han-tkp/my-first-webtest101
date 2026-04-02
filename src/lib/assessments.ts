/**
 * Assessment utilities and validators for equipment standard assessment form
 * แบบรายงานผลการประเมินมาตรฐานเครื่องพ่นเคมี
 */

export interface AssessmentData {
    equipment_id: number;
    assessor_id: string;
    assessment_date: string;
    
    // Equipment details (ข้อมูลเครื่อง)
    equipment_type?: string | null;
    equipment_brand?: string | null;
    equipment_model?: string | null;
    equipment_purchase_year?: number | null;
    
    // Flow control (ตัวควบคุมการไหล)
    flow_control_type?: string | null;
    flow_control_size?: string | null;
    
    // Spray distance (ระยะห่าง)
    spray_distance?: string | null;
    
    // External condition (สภาพภายนอก)
    exterior_condition_class?: string | null;
    clean_exterior?: string | null;
    clean_nozzle?: string | null;
    
    // Engine start (การติดเครื่องยนต์)
    engine_start_quality?: string | null;
    
    // Existing fields from initial schema
    exterior_condition?: string | null;
    engine_start?: string | null;
    clean_pipe?: boolean | null;
    clean_chem_line?: boolean | null;
    clean_gas_tank?: boolean | null;
    clean_chem_tank?: boolean | null;
    
    // Chemical testing (ข้อมูลการทดสอบสารเคมี)
    chem_name?: string | null;
    chem_concentration?: string | null;
    chemical_substance?: string | null;
    chemical_concentration?: string | null;
    chemical_volume?: string | null;
    chemical_mix_ratio?: string | null;
    
    // Test environment (สภาพแวดล้อมการทดสอบ)
    season?: string | null;
    location?: string | null;
    
    // Measurement results (ผลการวัด)
    result_temp?: string | null;
    result_flow_rate?: string | null;
    vmd_value?: string | null;
    span_value?: string | null;
    
    // Recommendations (ข้อเสนอแนะ)
    recommendations?: string | null;
    notes?: string | null;
    
    // Assessor info (ข้อมูลผู้ประเมิน)
    assessor_name?: string | null;
    report_date?: string | null;
}

// Option types for dropdowns
export interface SelectOption {
    value: string;
    label: string;
}

// ตัวควบคุมการไหล options
export const flowControlTypeOptions: SelectOption[] = [
    { value: "valve", label: "วาล์ว" },
    { value: "nozzle", label: "หัวพ่น" },
    { value: "size", label: "ขนาด" },
];

// สภาพภายนอก options
export const exteriorConditionClassOptions: SelectOption[] = [
    { value: "old", label: "เก่า" },
    { value: "medium", label: "ปานกลาง" },
    { value: "new", label: "ใหม่" },
];

// ความสะอาดภายนอก options
export const cleanExteriorOptions: SelectOption[] = [
    { value: "clean", label: "สะอาด" },
    { value: "dirty", label: "ไม่สะอาด" },
];

// หัวพ่น options
export const cleanNozzleOptions: SelectOption[] = [
    { value: "no_soot", label: "ไม่มีเขม่า" },
    { value: "has_soot", label: "มีเขม่า" },
];

// การติดเครื่องยนต์ options
export const engineStartQualityOptions: SelectOption[] = [
    { value: "easy", label: "ติดง่าย" },
    { value: "hard", label: "ติดยาก" },
];

// ฤดูกาล options
export const seasonOptions: SelectOption[] = [
    { value: "summer", label: "ฤดูร้อน" },
    { value: "rainy", label: "ฤดูฝน" },
    { value: "winter", label: "ฤดูหนาว" },
];

/**
 * Validates VMD value (must be ≤ 30 microns)
 */
export function validateVMD(value: string | null): { valid: boolean; error?: string } {
    if (!value) {
        return { valid: true }; // Optional field
    }
    
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) {
        return { valid: false, error: "ค่า VMD ต้องเป็นตัวเลข" };
    }
    
    if (numValue > 30) {
        return { valid: false, error: "ค่า VMD ต้องไม่เกิน 30 ไมครอน" };
    }
    
    return { valid: true };
}

/**
 * Validates SPAN value (must be ≤ 2)
 */
export function validateSPAN(value: string | null): { valid: boolean; error?: string } {
    if (!value) {
        return { valid: true }; // Optional field
    }
    
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) {
        return { valid: false, error: "ค่า SPAN ต้องเป็นตัวเลข" };
    }
    
    if (numValue > 2) {
        return { valid: false, error: "ค่า SPAN ต้องไม่เกิน 2" };
    }
    
    return { valid: true };
}

/**
 * Validates the entire assessment form data
 */
export function validateAssessmentData(data: AssessmentData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!data.equipment_id) {
        errors.push("กรุณาเลือกอุปกรณ์");
    }
    
    if (!data.assessment_date) {
        errors.push("กรุณาระบุวันที่ประเมิน");
    }
    
    // Validate VMD if provided
    const vmdValidation = validateVMD(data.vmd_value || null);
    if (!vmdValidation.valid) {
        errors.push(vmdValidation.error!);
    }
    
    // Validate SPAN if provided
    const spanValidation = validateSPAN(data.span_value || null);
    if (!spanValidation.valid) {
        errors.push(spanValidation.error!);
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Builds assessment data from FormData
 */
export function buildAssessmentData(formData: FormData): AssessmentData {
    const getOptionalString = (key: string): string | null => {
        const value = formData.get(key);
        if (value === null || value === undefined || value === "") {
            return null;
        }
        return String(value).trim();
    };
    
    const getOptionalNumber = (key: string): number | null => {
        const value = formData.get(key);
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };
    
    const getOptionalBoolean = (key: string): boolean | null => {
        const value = formData.get(key);
        if (value === null || value === undefined) {
            return null;
        }
        return value === "true" || value === "on";
    };
    
    return {
        equipment_id: Number(formData.get("equipment_id")),
        assessor_id: String(formData.get("assessor_id") || ""),
        assessment_date: String(formData.get("assessment_date") || new Date().toISOString().split("T")[0]),
        
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
        
        // Assessor info
        assessor_name: getOptionalString("assessor_name"),
        report_date: getOptionalString("report_date"),
    };
}

/**
 * Formats assessment date for display
 */
export function formatAssessmentDate(dateString: string | null): string {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
}

/**
 * Gets Thai label for flow control type
 */
export function getFlowControlTypeLabel(value: string | null): string {
    if (!value) return "-";
    const option = flowControlTypeOptions.find((opt) => opt.value === value);
    return option?.label || value;
}

/**
 * Gets Thai label for exterior condition class
 */
export function getExteriorConditionClassLabel(value: string | null): string {
    if (!value) return "-";
    const option = exteriorConditionClassOptions.find((opt) => opt.value === value);
    return option?.label || value;
}

/**
 * Gets Thai label for engine start quality
 */
export function getEngineStartQualityLabel(value: string | null): string {
    if (!value) return "-";
    const option = engineStartQualityOptions.find((opt) => opt.value === value);
    return option?.label || value;
}

/**
 * Gets Thai label for season
 */
export function getSeasonLabel(value: string | null): string {
    if (!value) return "-";
    const option = seasonOptions.find((opt) => opt.value === value);
    return option?.label || value;
}
