/**
 * API Service Layer (Phase 2 & Phase 3 Production Integration)
 * 
 * Communicates with the Google Apps Script Web App attached to Google Sheets.
 * When GOOGLE_APPS_SCRIPT_URL is configured, the live backend is authoritative.
 * Network/server errors are returned directly to the user; live requests NEVER silently fall back to mock data.
 */

import { APP_CONFIG, GOOGLE_APPS_SCRIPT_URL } from '../config';
import { ApiResponse, AuthUser, Employee, EmployeeFormData, LoginCredentials } from '../types';

/**
 * Returns whether live backend mode is active.
 * Authoritative: If GOOGLE_APPS_SCRIPT_URL is set or USE_MOCK_API is false, live mode is strictly enforced.
 */
function isLiveBackendConfigured(): boolean {
  const url = APP_CONFIG.GOOGLE_APPS_SCRIPT_WEBAPP_URL || GOOGLE_APPS_SCRIPT_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('YOUR_DEPLOYED_URL_HERE'));
}

function getBackendUrl(): string {
  return (APP_CONFIG.GOOGLE_APPS_SCRIPT_WEBAPP_URL || GOOGLE_APPS_SCRIPT_URL || '').trim();
}

/**
 * Helper to make POST requests to Google Apps Script Web App
 * NOTE: Passwords and session tokens are strictly transmitted over HTTPS and never logged to console.
 */
async function callGoogleAppsScript<T = any>(payload: Record<string, any>): Promise<ApiResponse<T>> {
  const url = getBackendUrl();

  if (!url) {
    return {
      success: false,
      error: 'Google Apps Script Web App URL is not configured. Please verify src/config.ts.',
    };
  }

  try {
    // Send as text/plain to prevent CORS preflight OPTIONS failure in Google Apps Script Web Apps
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Unable to connect to Google Sheets server. Please try again.',
      };
    }

    const jsonResult: ApiResponse<T> = await response.json();
    return jsonResult;
  } catch (_err: unknown) {
    // Return clean user-facing error without leaking technical stack traces or internal secrets
    return {
      success: false,
      error: 'Unable to connect to Google Sheets server. Please verify your Web App URL and internet connection.',
    };
  }
}

// =========================================================================
// DEVELOPMENT-ONLY MOCK DATABASE (USED ONLY IF NO BACKEND URL IS CONFIGURED)
// =========================================================================

const INITIAL_DEV_MOCK_EMPLOYEES: (Employee & { passwordHash?: string })[] = [
  {
    employeeId: 'DEV_ADMIN',
    employeeName: 'Development Admin [DEV ONLY]',
    dateOfBirth: '1990-01-01',
    hobby: 'Development',
    phoneNumber: '9876500000',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    passwordHash: 'DEV_ONLY_INSECURE_MOCK_PASS',
  },
  {
    employeeId: 'DEV_EMP01',
    employeeName: 'Development Employee [DEV ONLY]',
    dateOfBirth: '1995-05-05',
    hobby: 'Testing',
    phoneNumber: '9876543210',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    passwordHash: 'DEV_ONLY_INSECURE_MOCK_PASS',
  },
];

function getMockDatabase(): (Employee & { passwordHash?: string })[] {
  try {
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.MOCK_EMPLOYEES_DB);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore local storage parsing error
  }
  saveMockDatabase(INITIAL_DEV_MOCK_EMPLOYEES);
  return INITIAL_DEV_MOCK_EMPLOYEES;
}

function saveMockDatabase(data: (Employee & { passwordHash?: string })[]) {
  try {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.MOCK_EMPLOYEES_DB, JSON.stringify(data));
  } catch {
    // Ignore local storage write error
  }
}

function sanitizeEmployee(emp: Employee & { passwordHash?: string }): Employee {
  const { passwordHash, ...safeData } = emp;
  return safeData;
}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// API SERVICE EXPORTS
// ==========================================

export const ApiService = {
  /**
   * 1. Authenticate user credentials
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> {
    const empId = credentials.employeeId.trim().toUpperCase();
    const pwd = credentials.password;

    if (!empId || !pwd) {
      return {
        success: false,
        error: 'Employee ID and password are required.',
      };
    }

    // Direct Google Apps Script integration (Strict production authoritative mode)
    if (isLiveBackendConfigured()) {
      return await callGoogleAppsScript<AuthUser>({
        action: 'login',
        employeeId: empId,
        password: pwd,
      });
    }

    // If no backend is configured, block mock authentication in production or report missing setup
    if (!APP_CONFIG.USE_MOCK_API) {
      return {
        success: false,
        error: 'Google Apps Script Web App URL is not configured. Please set GOOGLE_APPS_SCRIPT_URL in src/config.ts.',
      };
    }

    // Development-only mock mode
    await delay();
    const db = getMockDatabase();
    const user = db.find((u) => u.employeeId.toUpperCase() === empId);

    if (!user || user.passwordHash !== pwd) {
      return {
        success: false,
        error: 'Invalid Employee ID or password.',
      };
    }

    if (user.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Your account is inactive. Please contact the administrator.',
      };
    }

    const authUser: AuthUser = {
      employeeId: user.employeeId,
      employeeName: user.employeeName,
      role: user.role,
      token: `dev-mock-token-${btoa(user.employeeId + ':' + user.role)}`,
      loginTime: Date.now(),
    };

    return {
      success: true,
      data: authUser,
      message: 'Login successful',
    };
  },

  /**
   * 2. Get Employee Profile by ID
   */
  async getEmployee(employeeId: string, currentAuth: AuthUser | null): Promise<ApiResponse<Employee>> {
    if (!currentAuth) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    const targetId = employeeId.trim().toUpperCase();
    const currentId = currentAuth.employeeId.trim().toUpperCase();

    // Client-side guard: Employee trying to view another employee's profile is denied
    if (currentAuth.role === 'EMPLOYEE' && targetId !== currentId) {
      return {
        success: false,
        error: 'You are not authorized to access this information.',
      };
    }

    // Direct Google Apps Script integration (Strict production authoritative mode)
    if (isLiveBackendConfigured()) {
      return await callGoogleAppsScript<Employee>({
        action: 'getEmployee',
        employeeId: targetId,
        sessionToken: currentAuth.token || '',
      });
    }

    if (!APP_CONFIG.USE_MOCK_API) {
      return {
        success: false,
        error: 'Google Apps Script Web App URL is not configured. Please set GOOGLE_APPS_SCRIPT_URL in src/config.ts.',
      };
    }

    // Development-only mock mode
    await delay();
    const db = getMockDatabase();
    const emp = db.find((u) => u.employeeId.toUpperCase() === targetId);

    if (!emp) {
      return { success: false, error: 'Employee not found.' };
    }

    return {
      success: true,
      data: sanitizeEmployee(emp),
    };
  },

  /**
   * 3. Get All Employees (ADMIN ONLY)
   */
  async getAllEmployees(currentAuth: AuthUser | null): Promise<ApiResponse<Employee[]>> {
    if (!currentAuth || currentAuth.role !== 'ADMIN') {
      return {
        success: false,
        error: 'You are not authorized to access the complete employee database.',
      };
    }

    // Direct Google Apps Script integration (Strict production authoritative mode)
    if (isLiveBackendConfigured()) {
      return await callGoogleAppsScript<Employee[]>({
        action: 'getAllEmployees',
        sessionToken: currentAuth.token || '',
      });
    }

    if (!APP_CONFIG.USE_MOCK_API) {
      return {
        success: false,
        error: 'Google Apps Script Web App URL is not configured. Please set GOOGLE_APPS_SCRIPT_URL in src/config.ts.',
      };
    }

    // Development-only mock mode
    await delay();
    const db = getMockDatabase();
    const activeEmployees = db.map(sanitizeEmployee);

    return {
      success: true,
      data: activeEmployees,
    };
  },

  /**
   * 4. Add Employee (ADMIN ONLY)
   */
  async addEmployee(data: EmployeeFormData, currentAuth: AuthUser | null): Promise<ApiResponse<Employee>> {
    if (!currentAuth || currentAuth.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const cleanId = data.employeeId.trim().toUpperCase();
    const cleanName = data.employeeName.trim();
    const dob = data.dateOfBirth.trim();
    const pwd = data.password || '';

    if (!cleanId || !cleanName || !dob || !pwd) {
      return {
        success: false,
        error: 'Employee ID, Name, Date of Birth, and Password are required.',
      };
    }

    // Direct Google Apps Script integration (Strict production authoritative mode)
    if (isLiveBackendConfigured()) {
      return await callGoogleAppsScript<Employee>({
        action: 'addEmployee',
        employeeId: cleanId,
        employeeName: cleanName,
        dateOfBirth: dob,
        hobby: data.hobby?.trim() || '',
        phoneNumber: data.phoneNumber?.trim() || '',
        password: pwd,
        role: data.role || 'EMPLOYEE',
        status: data.status || 'ACTIVE',
        sessionToken: currentAuth.token || '',
      });
    }

    if (!APP_CONFIG.USE_MOCK_API) {
      return {
        success: false,
        error: 'Google Apps Script Web App URL is not configured. Please set GOOGLE_APPS_SCRIPT_URL in src/config.ts.',
      };
    }

    // Development-only mock mode
    await delay();
    const db = getMockDatabase();
    const existing = db.find((e) => e.employeeId.toUpperCase() === cleanId);
    if (existing) {
      return {
        success: false,
        error: `Employee ID "${cleanId}" already exists. Please choose a unique ID.`,
      };
    }

    const newRecord: Employee & { passwordHash?: string } = {
      employeeId: cleanId,
      employeeName: cleanName,
      dateOfBirth: dob,
      hobby: data.hobby?.trim() || '',
      phoneNumber: data.phoneNumber?.trim() || '',
      role: data.role || 'EMPLOYEE',
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      passwordHash: pwd,
    };

    db.push(newRecord);
    saveMockDatabase(db);

    return {
      success: true,
      message: 'Employee added successfully.',
      data: sanitizeEmployee(newRecord),
    };
  },

  /**
   * 5. Update Employee (ADMIN ONLY)
   */
  async updateEmployee(
    employeeId: string,
    data: Partial<EmployeeFormData>,
    currentAuth: AuthUser | null
  ): Promise<ApiResponse<Employee>> {
    if (!currentAuth || currentAuth.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const targetId = employeeId.trim().toUpperCase();

    // Direct Google Apps Script integration (Strict production authoritative mode)
    if (isLiveBackendConfigured()) {
      return await callGoogleAppsScript<Employee>({
        action: 'updateEmployee',
        employeeId: targetId,
        employeeName: data.employeeName?.trim(),
        dateOfBirth: data.dateOfBirth?.trim(),
        hobby: data.hobby?.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        role: data.role,
        status: data.status,
        sessionToken: currentAuth.token || '',
      });
    }

    if (!APP_CONFIG.USE_MOCK_API) {
      return {
        success: false,
        error: 'Google Apps Script Web App URL is not configured. Please set GOOGLE_APPS_SCRIPT_URL in src/config.ts.',
      };
    }

    // Development-only mock mode
    await delay();
    const db = getMockDatabase();
    const index = db.findIndex((e) => e.employeeId.toUpperCase() === targetId);

    if (index === -1) {
      return { success: false, error: 'Employee not found.' };
    }

    if (data.employeeName) db[index].employeeName = data.employeeName.trim();
    if (data.dateOfBirth) db[index].dateOfBirth = data.dateOfBirth;
    if (data.hobby !== undefined) db[index].hobby = data.hobby.trim();
    if (data.phoneNumber !== undefined) db[index].phoneNumber = data.phoneNumber.trim();
    if (data.role) db[index].role = data.role;
    if (data.status) db[index].status = data.status;

    db[index].updatedAt = new Date().toISOString().split('T')[0];
    saveMockDatabase(db);

    return {
      success: true,
      message: 'Employee updated successfully.',
      data: sanitizeEmployee(db[index]),
    };
  },

  /**
   * 6. Change Password (ADMIN or own user)
   */
  async changePassword(
    employeeId: string,
    newPassword: string,
    currentAuth: AuthUser | null
  ): Promise<ApiResponse<void>> {
    if (!currentAuth) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    const targetId = employeeId.trim().toUpperCase();
    const currentId = currentAuth.employeeId.trim().toUpperCase();

    if (currentAuth.role !== 'ADMIN' && targetId !== currentId) {
      return { success: false, error: 'You cannot change the password for other accounts.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Direct Google Apps Script integration (Strict production authoritative mode)
    if (isLiveBackendConfigured()) {
      return await callGoogleAppsScript<void>({
        action: 'changePassword',
        employeeId: targetId,
        newPassword: newPassword,
        sessionToken: currentAuth.token || '',
      });
    }

    if (!APP_CONFIG.USE_MOCK_API) {
      return {
        success: false,
        error: 'Google Apps Script Web App URL is not configured. Please set GOOGLE_APPS_SCRIPT_URL in src/config.ts.',
      };
    }

    // Development-only mock mode
    await delay();
    const db = getMockDatabase();
    const index = db.findIndex((e) => e.employeeId.toUpperCase() === targetId);
    if (index === -1) {
      return { success: false, error: 'Employee not found.' };
    }

    db[index].passwordHash = newPassword;
    db[index].updatedAt = new Date().toISOString().split('T')[0];
    saveMockDatabase(db);

    return { success: true, message: 'Password changed successfully.' };
  },

  /**
   * Reset mock database to initial state (Dev only)
   */
  resetMockDatabase() {
    saveMockDatabase(INITIAL_DEV_MOCK_EMPLOYEES);
  }
};
