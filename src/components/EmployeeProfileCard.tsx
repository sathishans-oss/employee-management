import React, { useState } from 'react';
import { Employee } from '../types';
import { formatDateDisplay } from '../utils/validation';
import {
  User,
  Hash,
  Calendar,
  Heart,
  Phone,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ApiService } from '../services/api';

interface EmployeeProfileCardProps {
  employee: Employee;
  onRefresh?: () => void;
  onChangePasswordClick?: () => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({
  employee,
  onRefresh,
  onChangePasswordClick,
}) => {
  const { user, isAdmin } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChangePasswordSubmit = async (newPassword: string) => {
    const res = await ApiService.changePassword(employee.employeeId, newPassword, user);
    if (res.success && onRefresh) {
      onRefresh();
    }
    return res;
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div
        id="employee-profile-card"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        {/* Profile Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-blue-500/20 shrink-0">
              {employee.employeeName ? employee.employeeName.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {employee.employeeName}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  <Hash className="w-3 h-3 text-slate-400" />
                  {employee.employeeId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    employee.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {employee.role}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                    employee.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password button available for Admins */}
          {isAdmin && (
            <button
              type="button"
              id="change-password-modal-btn"
              onClick={onChangePasswordClick || (() => setShowPasswordModal(true))}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors shrink-0"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Employee Name */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Name</span>
            </div>
            <p className="text-base font-semibold text-slate-900">{employee.employeeName}</p>
          </div>

          {/* Employee ID */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              <span>Employee ID</span>
            </div>
            <p className="text-base font-mono font-semibold text-slate-900">{employee.employeeId}</p>
          </div>

          {/* Date of Birth */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Date of Birth</span>
            </div>
            <p className="text-base font-semibold text-slate-900">
              {formatDateDisplay(employee.dateOfBirth)}
            </p>
          </div>

          {/* Phone Number */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Phone Number</span>
            </div>
            <p className="text-base font-semibold text-slate-900">
              {employee.phoneNumber || 'Not provided'}
            </p>
          </div>

          {/* Hobby */}
          <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Hobby / Interests</span>
            </div>
            <p className="text-base font-semibold text-slate-900">
              {employee.hobby || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Internal Change Password Modal if clicked directly */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        employee={employee}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePasswordSubmit}
      />
    </div>
  );
};
