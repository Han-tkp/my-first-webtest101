export const KNOWN_EQUIPMENT_TYPES = [
    "HUDSON X-PERT SPRAYER",
    "IK VECTOR CONTROL SUPER",
    "Micron CS-10",
    "SWING FOG SN 11 P",
    "SWING FOG SN 50",
    "IGEBA Port 123 ULV",
    "ULV 1800 E",
    "Twister XL by Dynafog",
    "Swingtec",
    "FONTAN PORTASTARs",
    "Misuko 3WF-3A",
    "Swingtac ULV",
] as const;

export function getEquipmentCategory(type: string) {
    if (/HUDSON|IK VECTOR|Micron/i.test(type)) {
        return "เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ";
    }

    if (/SWING FOG/i.test(type)) {
        return "เครื่องพ่นหมอกควัน";
    }

    if (/ULV|IGEBA|Dynafog|Swingtec|Swingtac|FONTAN|Misuko/i.test(type)) {
        return "เครื่องพ่นฝอยละอองและ ULV";
    }

    return "อุปกรณ์อื่น ๆ";
}

export function getEquipmentImageUrl(type: string, imageUrl?: string | null) {
    if (imageUrl) return imageUrl;

    if (/HUDSON|IK VECTOR|Micron/i.test(type)) {
        return "/equipment-backpack.svg";
    }

    if (/SWING FOG/i.test(type)) {
        return "/equipment-fogger.svg";
    }

    if (/ULV|IGEBA|Dynafog|Swingtec|Swingtac|FONTAN|Misuko/i.test(type)) {
        return "/equipment-ulv.svg";
    }

    return "/equipment-fogger.svg";
}

export function getEquipmentTypeDescription(type: string) {
    if (/HUDSON|IK VECTOR|Micron/i.test(type)) {
        return "อ้างอิงทะเบียนเครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ เหมาะกับงานพ่นเฉพาะจุดและงานภาคสนามระยะใกล้";
    }

    if (/SWING FOG/i.test(type)) {
        return "อ้างอิงทะเบียนเครื่องพ่นหมอกควันของหน่วยงาน ใช้กับภารกิจควบคุมโรคและงานพ่นในพื้นที่เปิด";
    }

    if (/ULV|IGEBA|Dynafog|Swingtec|Swingtac|FONTAN|Misuko/i.test(type)) {
        return "อ้างอิงทะเบียนเครื่องพ่นฝอยละเอียดและเครื่องพ่น ULV ของหน่วยงาน เหมาะกับงานที่ต้องการการกระจายละอองสม่ำเสมอ";
    }

    return "อ้างอิงข้อมูลครุภัณฑ์จากเอกสารหน่วยงาน และจัดกลุ่มตามรุ่นที่ใช้งานจริง";
}
