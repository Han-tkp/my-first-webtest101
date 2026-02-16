// Error codes for consistent error handling
export const ErrorCodes = {
    // Authentication
    AUTH_INVALID_CREDENTIALS: 'AUTH_001',
    AUTH_USER_NOT_FOUND: 'AUTH_002',
    AUTH_UNAUTHORIZED: 'AUTH_003',
    AUTH_SESSION_EXPIRED: 'AUTH_004',

    // Validation
    VALIDATION_REQUIRED_FIELD: 'VAL_001',
    VALIDATION_INVALID_FORMAT: 'VAL_002',
    VALIDATION_DATE_RANGE: 'VAL_003',

    // Business Logic
    EQUIPMENT_NOT_AVAILABLE: 'EQP_001',
    EQUIPMENT_ALREADY_BORROWED: 'EQP_002',
    BORROW_LIMIT_EXCEEDED: 'BOR_001',

    // System
    SYSTEM_ERROR: 'SYS_001',
    DATABASE_ERROR: 'SYS_002',
    NETWORK_ERROR: 'SYS_003',
} as const;

// Error messages (Thai)
export const ErrorMessages: Record<string, string> = {
    [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    [ErrorCodes.AUTH_USER_NOT_FOUND]: 'ไม่พบผู้ใช้นี้ในระบบ',
    [ErrorCodes.AUTH_UNAUTHORIZED]: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
    [ErrorCodes.AUTH_SESSION_EXPIRED]: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',

    [ErrorCodes.VALIDATION_REQUIRED_FIELD]: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    [ErrorCodes.VALIDATION_INVALID_FORMAT]: 'รูปแบบข้อมูลไม่ถูกต้อง',
    [ErrorCodes.VALIDATION_DATE_RANGE]: 'วันที่ไม่ถูกต้อง',

    [ErrorCodes.EQUIPMENT_NOT_AVAILABLE]: 'อุปกรณ์ไม่พร้อมใช้งาน',
    [ErrorCodes.EQUIPMENT_ALREADY_BORROWED]: 'อุปกรณ์ถูกยืมแล้ว',
    [ErrorCodes.BORROW_LIMIT_EXCEEDED]: 'เกินจำนวนครั้งที่อนุญาตให้ยืม',

    [ErrorCodes.SYSTEM_ERROR]: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
    [ErrorCodes.DATABASE_ERROR]: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
    [ErrorCodes.NETWORK_ERROR]: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย',
};

// Role labels
export const RoleLabels: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    approver: 'ผู้อนุมัติ',
    technician: 'ช่างเทคนิค',
    user: 'ผู้ใช้ทั่วไป',
};

// Status labels
export const StatusLabels = {
    equipment: {
        available: 'ว่าง',
        borrowed: 'ถูกยืม',
        repairing: 'อยู่ระหว่างซ่อม',
        broken: 'เสียหาย',
    },
    borrow: {
        pending: 'รอการอนุมัติ',
        approved: 'อนุมัติแล้ว',
        rejected: 'ปฏิเสธ',
        returned: 'คืนแล้ว',
        overdue: 'เลยกำหนด',
    },
    repair: {
        pending: 'รอการอนุมัติ',
        approved: 'อนุมัติแล้ว',
        in_progress: 'กำลังซ่อม',
        completed: 'เสร็จสิ้น',
        rejected: 'ปฏิเสธ',
    },
};

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
    TIMEOUT: 30000, // 30 seconds
    RETRY_COUNT: 3,
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
};
