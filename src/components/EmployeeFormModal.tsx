import React, { useState, useEffect } from 'react';
import { Employee, EmployeeFormData, UserRole, EmployeeStatus } from '../types';
import {
  validateEmployeeId,
  validateEmployeeName,
  validateDateOfBirth,
  validatePhoneNumber,
  validatePassword,
  normalizeDob,
} from '../utils/validation';
import { User, Hash, Calendar, Heart, Phone, Lock, X, Check, AlertCircle } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';

interface EmployeeFormModalProps {
  isOpen: boolean;
  isEditMode?: boolean;
  initialData?: Employee | null;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<{ success: boolean; error?: string }>;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  isEditMode = false,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    employeeName: '',
    dateOfBirth: '',
    hobby: '',
    phoneNumber: '',
    password: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData({
        employeeId: initialData.employeeId,
        employeeName: initialData.employeeName,
        dateOfBirth: normalizeDob(initialData.dateOfBirth) || initialData.dateOfBirth || '',
        hobby: initialData.hobby || '',
        phoneNumber: initialData.phoneNumber || '',
        role: initialData.role,
        status: initialData.status,
      });
    } else {
      setFormData({
        employeeId: '',
        employeeName: '',
        dateOfBirth: '',
        hobby: '',
        phoneNumber: '',
        password: '',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      });
    }
    setFormErrors({});
    setApiError(null);
  }, [initialData, isEditMode, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate ID
    const idVal = validateEmployeeId(formData.employeeId);
    if (!idVal.isValid) errors.employeeId = idVal.error!;

    // Validate Name
    const nameVal = validateEmployeeName(formData.employeeName);
    if (!nameVal.isValid) errors.employeeName = nameVal.error!;

    // Validate DOB
    const dobVal = validateDateOfBirth(formData.dateOfBirth);
    if (!dobVal.isValid) errors.dateOfBirth = dobVal.error!;

    // Validate Phone (optional)
    const phoneVal = validatePhoneNumber(formData.phoneNumber);
    if (!phoneVal.isValid) errors.phoneNumber = phoneVal.error!;

    // Validate Password (only on add)
    if (!isEditMode) {
      const passVal = validatePassword(formData.password || '');
      if (!passVal.isValid) errors.password = passVal.error!;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit(formData);
      if (res.success) {
        onClose();
      } else {
        setApiError(res.error || 'Failed to save employee record.');
      }
    } catch (err: any) {
      setApiError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="employee-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="employee-form-modal"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEditMode ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? 'Update employee profile details in the system.'
                : 'Fill in the information below to create a new employee profile.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        <ErrorMessage message={apiError} onDismiss={() => setApiError(null)} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="form-employee-id"
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value.toUpperCase() });
                    if (formErrors.employeeId) setFormErrors({ ...formErrors, employeeId: '' });
                  }}
                  placeholder="e.g. EMP005"
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    formErrors.employeeId
                      ? 'border-rose-300 focus:ring-rose-500 text-rose-900 bg-rose-50/50'
                      : 'border-slate-200 focus:ring-blue-500 text-slate-900'
                  }`}
                />
              </div>
              {formErrors.employeeId && (
                <p className="text-[11px] font-medium text-rose-600">{formErrors.employeeId}</p>
              )}
            </div>

            {/* Employee Name */}
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="form-employee-name"
                value={formData.employeeName}
                onChange={(e) => {
                  setFormData({ ...formData, employeeName: e.target.value });
                  if (formErrors.employeeName) setFormErrors({ ...formErrors, employeeName: '' });
                }}
                placeholder="e.g. Jane Smith"
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  formErrors.employeeName
                    ? 'border-rose-300 focus:ring-rose-500 text-rose-900 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-blue-500 text-slate-900'
                }`}
              />
              {formErrors.employeeName && (
                <p className="text-[11px] font-medium text-rose-600">{formErrors.employeeName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="form-employee-dob"
                value={formData.dateOfBirth}
                onChange={(e) => {
                  setFormData({ ...formData, dateOfBirth: e.target.value });
                  if (formErrors.dateOfBirth) setFormErrors({ ...formErrors, dateOfBirth: '' });
                }}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  formErrors.dateOfBirth
                    ? 'border-rose-300 focus:ring-rose-500 text-rose-900 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-blue-500 text-slate-900'
                }`}
              />
              {formErrors.dateOfBirth && (
                <p className="text-[11px] font-medium text-rose-600">{formErrors.dateOfBirth}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                id="form-employee-phone"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: '' });
                }}
                placeholder="e.g. 9876543210"
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  formErrors.phoneNumber
                    ? 'border-rose-300 focus:ring-rose-500 text-rose-900 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-blue-500 text-slate-900'
                }`}
              />
              {formErrors.phoneNumber && (
                <p className="text-[11px] font-medium text-rose-600">{formErrors.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Hobby */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hobby / Interests <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="form-employee-hobby"
              value={formData.hobby}
              onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
              placeholder="e.g. Reading, Hiking, Cooking"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Initial Password (only on Add Employee) */}
          {!isEditMode && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Initial Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="form-employee-password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                placeholder="Minimum 6 characters"
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  formErrors.password
                    ? 'border-rose-300 focus:ring-rose-500 text-rose-900 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-blue-500 text-slate-900'
                }`}
              />
              {formErrors.password ? (
                <p className="text-[11px] font-medium text-rose-600">{formErrors.password}</p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Password will be hashed in Google Apps Script and never saved in plain text.
                </p>
              )}
            </div>
          )}

          {/* Role & Status Controls */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Role
              </label>
              {isEditMode ? (
                <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{formData.role}</span>
                  <span className="text-[10px] font-normal text-slate-400">Fixed</span>
                </div>
              ) : (
                <select
                  id="form-employee-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status
              </label>
              <select
                id="form-employee-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as EmployeeStatus })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="form-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="form-save-btn"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
