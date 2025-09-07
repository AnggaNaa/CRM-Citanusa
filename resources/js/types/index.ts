export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    roles?: string[]; // Changed from Role[] to string[]
    // Hierarchy fields
    manager_id?: number;
    spv_id?: number;
    manager?: User;
    spv?: User;
    profile_picture?: string | null;
    subordinates?: User[];
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface Lead {
    id: number;
    title: string;
    description?: string;
    priority: 'cold' | 'warm' | 'hot' | 'booking' | 'closing';
    status: string;
    notes?: string;

    // Project information
    project?: string;
    unit_type?: string;
    unit_no?: string;
    estimated_value?: number;
    expected_closing_date?: string;
    source?: string;

    // Contact information
    contact_name: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    contact_company?: string;
    contact_position?: string;

    // Assignment and hierarchy
    assigned_to?: User;
    created_by: User;
    manager_id?: number;
    spv_id?: number;
    manager?: User;
    spv?: User;

    created_at: string;
    updated_at: string;
    histories?: LeadHistory[];
    attachments?: LeadAttachment[];

    creator?: User;
    assigned_user?: User;
}

export interface LeadHistory {
    id: number;
    lead_id: number;
    old_priority?: string;
    new_priority: string;
    description: string;
    created_by: User;
    created_at: string;
    creator?: User;
    assigned_user?: User;
}

export interface LeadAttachment {
    id: number;
    lead_id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_by: User;
    created_at: string;
}

export interface ProjectUnit {
    id: number;
    project: string;
    unit_type: string;
    unit_no: string;
    status: 'available' | 'reserved' | 'sold' | 'blocked';
    price?: number;
    size?: number;
    description?: string;
    specifications?: Record<string, any>;
    created_at: string;
    updated_at: string;
    leads?: Lead[];
}

export interface DashboardStats {
    totalLeads: number;
    coldLeads: number;
    warmLeads: number;
    hotLeads: number;
    bookingLeads: number;
    closingLeads: number;
    totalValue: number;
    monthlyGrowth: number;
}

export interface LeadFormData {
    description?: string;
    priority: 'cold' | 'warm' | 'hot' | 'booking' | 'closing';
    status: string;
    notes?: string;
    project?: string;
    unit_type?: string;
    unit_no?: string;
    estimated_value?: number;
    expected_closing_date?: string;
    source?: string;
    contact_name: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    contact_company?: string;
    contact_position?: string;
    assigned_to?: number;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        message?: string;
        error?: string;
    };
};
