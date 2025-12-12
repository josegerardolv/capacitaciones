export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_prev: boolean;
    has_next: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_prev: boolean;
    has_next: boolean;
  };
}

export interface DashboardStats {
  total_tickets: number;
  new_tickets: number;
  assigned_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  overdue_tickets: number;
  my_tickets?: number;
  avg_resolution_time?: number;
}

export interface MetricData {
  period: string;
  value: number;
  label?: string;
}

export interface ReportParams {
  start_date: string;
  end_date: string;
  report_type: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: any;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  details: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: any;
}

export interface ConfigItem {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  data_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'ticket';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  read?: boolean;
  actionUrl?: string;
}
