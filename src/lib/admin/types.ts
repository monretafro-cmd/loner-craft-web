export type AdminStatus = 'approved' | 'pending' | 'blocked' | 'rejected';
export type AdminRole = 'super_admin' | 'admin';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: AdminStatus;
  role: AdminRole;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface AdminAccessRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
