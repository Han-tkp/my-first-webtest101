// Database types
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    department?: string;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}

export interface Equipment {
    id: string;
    code: string;
    name: string;
    category: string;
    brand?: string;
    model?: string;
    status: EquipmentStatus;
    condition: EquipmentCondition;
    description?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface BorrowRequest {
    id: string;
    user_id: string;
    equipment_ids: string[];
    start_date: string;
    end_date: string;
    purpose: string;
    status: BorrowStatus;
    approved_by?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

export interface RepairRequest {
    id: string;
    equipment_id: string;
    reported_by: string;
    issue_description: string;
    status: RepairStatus;
    assigned_to?: string;
    cost?: number;
    completed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Enums
export type UserRole = 'admin' | 'approver' | 'technician' | 'user';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type EquipmentStatus = 'available' | 'borrowed' | 'repairing' | 'broken';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type BorrowStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';
export type RepairStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Form types
export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    department?: string;
}
