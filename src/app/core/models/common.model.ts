export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
}

export interface DashboardStats {
  totalTickets: number;
  newTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  myTickets?: number;
  avgResolutionTime?: number;
}

export interface MetricData {
  period: string;
  value: number;
  label?: string;
}

export interface ReportParams {
  startDate: string;
  endDate: string;
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: any;
}

export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  resourceType: string;
  resourceId?: number;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: any;
}

export interface ConfigItem {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  dataType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
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
