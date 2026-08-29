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
  Search,
  UserPlus,
  RefreshCw,
  X,
  Check,
  Hash,
} from 'lucide-react';

interface AdminEmployeesPageProps {
  initialOpenAdd?: boolean;
}

export const AdminEmployeesPage: React.FC<AdminEmployeesPageProps> = ({
  initialOpenAdd = false,
}) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [idFilter, setIdFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EMPLOYEE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [passwordEmployee, setPasswordEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAdd);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiService.getAllEmployees(user);
      if (res.success && res.data) {
        setEmployees(res.data);
      } else {
        setError(res.error || 'Failed to fetch employee list.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter & Search computation (case-insensitive on ID and Name)
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    const idQ = idFilter.toLowerCase().trim();

    // Specific Employee ID filter
    const matchesIdFilter = !idQ || emp.employeeId.toLowerCase().includes(idQ);

    // General Search by Name, ID, Phone, or Hobby
    const matchesSearch =
      !q ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.employeeName.toLowerCase().includes(q) ||
      (emp.hobby && emp.hobby.toLowerCase().includes(q)) ||
      (emp.phoneNumber && emp.phoneNumber.includes(q));

    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesIdFilter && matchesSearch && matchesRole && matchesStatus;
  });

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter, and manage all employee records in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEmployees}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            id="employees-page-add-btn"
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

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* General Search Input (Name or keyword) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="employee-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Employee Name, ID, or Phone..."
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dedicated Employee ID Filter */}
          <div className="lg:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="employee-id-filter-input"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              placeholder="Filter by ID (e.g. EMP001)"
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {idFilter && (
              <button
                type="button"
                onClick={() => setIdFilter('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="lg:col-span-2">
            <select
              id="employee-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">Employees Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              id="employee-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Filter Feedback */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
          </span>
          {(searchQuery || idFilter || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIdFilter('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Employees Table List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <LoadingSpinner message="Loading employee directory..." />
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onView={(emp) => setViewEmployee(emp)}
          onEdit={(emp) => setEditEmployee(emp)}
          onChangePassword={(emp) => setPasswordEmployee(emp)}
        />
      )}

      {/* View Modal */}
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

      {/* Add Modal */}
      <EmployeeFormModal
        isOpen={isAddModalOpen}
        isEditMode={false}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      {/* Edit Modal */}
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
