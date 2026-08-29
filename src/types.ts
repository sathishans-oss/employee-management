export type UserRole = 'ADMIN' | 'EMPLOYEE';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  employeeId: string;
  employeeName: string;
  dateOfBirth: string; // YYYY-MM-DD or DD/MM/YYYY formatted
  hobby?: string;
  phoneNumber?: string;
  role: UserRole;
  status: EmployeeStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  employeeId: string;
  employeeName: string;
  role: UserRole;
  token?: string;
  loginTime: number; // timestamp for session timeout management
}

export interface LoginCredentials {
  employeeId: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface EmployeeFormData {
  employeeId: string;
  employeeName: string;
  dateOfBirth: string;
  hobby?: string;
  phoneNumber?: string;
  password?: string; // used when adding or changing password
  role?: UserRole;
  status?: EmployeeStatus;
}

export type AppRoute = 
  | '/login'
  | '/admin'
  | '/admin/employees'
  | '/admin/employees/add'
  | '/admin/employees/edit'
  | '/profile';
