export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'customer';
  branch_id: number | null;
  branch?: {
    id: number;
    name: string;
    code: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  errors?: Record<string, string[]>;
  trace_id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}
