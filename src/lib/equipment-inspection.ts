export interface InspectionOption {
    value: string;
    label: string;
}

export interface InspectionItem {
    key: string;
    label: string;
    options: InspectionOption[];
}

const conditionOptions: InspectionOption[] = [
    { value: "ready", label: "พร้อมใช้งาน" },
    { value: "damaged", label: "ชำรุด" },
    { value: "lost", label: "สูญหาย" },
];

const batteryOptions: InspectionOption[] = [
    { value: "present", label: "มี" },
    { value: "missing", label: "ไม่มี" },
    { value: "damaged", label: "ชำรุด" },
    { value: "lost", label: "สูญหาย" },
];

export const inspectionItems: InspectionItem[] = [
    { key: "general", label: "สภาพทั่วไป", options: conditionOptions },
    { key: "hose", label: "ท่อพ่น", options: conditionOptions },
    { key: "nozzle", label: "ท่อน้ำยา", options: conditionOptions },
    { key: "handle", label: "หัวเทียน", options: conditionOptions },
    { key: "chemical_tank", label: "ถังน้ำยา / ฝาปิดโอริง", options: conditionOptions },
    { key: "oil_tank", label: "ถังน้ำมัน / ฝาปิดโอริง", options: conditionOptions },
    { key: "battery", label: "แบตเตอรี่", options: batteryOptions },
];

export const repairRecommendationOptions: InspectionOption[] = [
    { value: "repair_and_return", label: "บันทึกซ่อมและนำกลับใช้งานตามหน่วยงาน" },
    { value: "request_budget", label: "ไม่มีงบประมาณในการซ่อม รับเครื่องกลับไป" },
    { value: "dispose", label: "ให้จำหน่าย เนื่องจากค่าใช้จ่ายไม่คุ้มค่าการซ่อม" },
];

export function buildInspectionChecklist(formData: FormData, prefix = "") {
    const items = inspectionItems.map((item) => ({
        key: item.key,
        label: item.label,
        status: String(formData.get(`${prefix}${item.key}`) || ""),
    }));

    return {
        items,
        notes: String(formData.get(`${prefix}notes`) || "").trim(),
        inspected_at: new Date().toISOString(),
    };
}

export function buildRepairItems(formData: FormData, maxRows = 5) {
    const items: Array<{
        description: string;
        parts_cost: number;
        labor_cost: number;
    }> = [];

    for (let index = 1; index <= maxRows; index += 1) {
        const description = String(formData.get(`repair_item_${index}`) || "").trim();
        const partsCostRaw = Number(formData.get(`parts_cost_${index}`) || 0);
        const laborCostRaw = Number(formData.get(`labor_cost_${index}`) || 0);

        if (!description && !partsCostRaw && !laborCostRaw) {
            continue;
        }

        items.push({
            description,
            parts_cost: Number.isFinite(partsCostRaw) && partsCostRaw >= 0 ? partsCostRaw : 0,
            labor_cost: Number.isFinite(laborCostRaw) && laborCostRaw >= 0 ? laborCostRaw : 0,
        });
    }

    return items;
}
