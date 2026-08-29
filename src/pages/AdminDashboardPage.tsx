import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Employee, EmployeeFormData } from '../types';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeProfileCard } from '../components/EmployeeProfileCard';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  ArrowRight,
  X,
  RefreshCw,
  Check,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateToEmployees: () => void;
  onNavigateToAddEmployee: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateToEmployees,
  onNavigateToAddEmployee,
}) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [passwordEmployee, setPasswordEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiService.getAllEmployees(user);
      if (res.success && res.data) {
        setEmployees(res.data);
      } else {
        setError(res.error || 'Unable to load employee list.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
  const inactiveEmployees = employees.filter((e) => e.status === 'INACTIVE').length;
  const recentEmployees = [...employees].slice(-5).reverse();

  const handleCreateEmployee = async (formData: EmployeeFormData) => {
    const res = await ApiService.addEmployee(formData, user);
    if (res.success) {
      setNotification('Employee added successfully.');
      setTimeout(() => setNotification(null), 4000);
      fetchEmployees();
    }
    return res;
  };

  const handleUpdateEmployee = async (formData: EmployeeFormData) => {
    if (!editEmployee) return { success: false, error: 'No employee selected' };
    const res = await ApiService.updateEmployee(editEmployee.employeeId, formData, user);
    if (res.success) {
      setNotification('Employee updated successfully.');
      setTimeout(() => setNotification(null), 4000);
      fetchEmployees();
      if (viewEmployee && viewEmployee.employeeId === editEmployee.employeeId && res.data) {
        setViewEmployee(res.data);
      }
    }
    return res;
  };

  const handleChangePassword = async (newPassword: string) => {
    if (!passwordEmployee) return { success: false, error: 'No employee selected' };
    const res = await ApiService.changePassword(passwordEmployee.employeeId, newPassword, user);
    if (res.success) {
      setNotification(`Password changed successfully for ${passwordEmployee.employeeId}.`);
      setTimeout(() => setNotification(null), 4000);
    }
    return res;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time personnel statistics and profile management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEmployees}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            id="dashboard-add-employee-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Employees */}
        <div
          id="stat-total-employees"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Employees
            </p>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : totalEmployees}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Employees */}
        <div
          id="stat-active-employees"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Employees
            </p>
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {isLoading ? '...' : activeEmployees}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive Employees */}
        <div
          id="stat-inactive-employees"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Inactive Employees
            </p>
            <p className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {isLoading ? '...' : inactiveEmployees}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Employees Table Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Employee Profiles</h2>
            <p className="text-xs text-slate-500">Quick list of registered employees</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToEmployees}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <LoadingSpinner message="Fetching employee records..." />
          </div>
        ) : (
          <EmployeeTable
            employees={recentEmployees}
            onView={(emp) => setViewEmployee(emp)}
            onEdit={(emp) => setEditEmployee(emp)}
            onChangePassword={(emp) => setPasswordEmployee(emp)}
          />
        )}
      </div>

      {/* View Employee Detail Modal */}
      {viewEmployee && (
        <div
          id="view-employee-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-2xl relative my-8">
            <button
              type="button"
              onClick={() => setViewEmployee(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <EmployeeProfileCard
              employee={viewEmployee}
              onRefresh={fetchEmployees}
              onChangePasswordClick={() => {
                setPasswordEmployee(viewEmployee);
              }}
            />
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <EmployeeFormModal
        isOpen={isAddModalOpen}
        isEditMode={false}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      {/* Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={!!editEmployee}
        isEditMode={true}
        initialData={editEmployee}
        onClose={() => setEditEmployee(null)}
        onSubmit={handleUpdateEmployee}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={!!passwordEmployee}
        employee={passwordEmployee}
        onClose={() => setPasswordEmployee(null)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};
