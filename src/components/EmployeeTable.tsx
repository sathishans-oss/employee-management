import React from 'react';
import { Employee } from '../types';
import { formatDateDisplay } from '../utils/validation';
import { Eye, Edit3, User, KeyRound } from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onChangePassword?: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onView,
  onEdit,
  onChangePassword,
}) => {
  if (employees.length === 0) {
    return (
      <div
        id="empty-employees-state"
        className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No employees found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          No records match your search or filter criteria. Try adjusting your search query.
        </p>
      </div>
    );
  }

  return (
    <div
      id="employee-table-container"
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-5">Employee ID</th>
              <th className="py-3.5 px-4 sm:px-5">Employee Name</th>
              <th className="py-3.5 px-4 sm:px-5">Date of Birth</th>
              <th className="py-3.5 px-4 sm:px-5">Hobby</th>
              <th className="py-3.5 px-4 sm:px-5">Phone Number</th>
              <th className="py-3.5 px-4 sm:px-5">Status</th>
              <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {employees.map((emp) => (
              <tr
                key={emp.employeeId}
                id={`employee-row-${emp.employeeId}`}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {/* Employee ID */}
                <td className="py-3.5 px-4 sm:px-5 font-mono font-bold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs">
                      {emp.employeeId}
                    </span>
                    {emp.role === 'ADMIN' && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                </td>

                {/* Employee Name */}
                <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-900">
                  {emp.employeeName}
                </td>

                {/* Date of Birth */}
                <td className="py-3.5 px-4 sm:px-5 text-slate-600">
                  {formatDateDisplay(emp.dateOfBirth)}
                </td>

                {/* Hobby */}
                <td className="py-3.5 px-4 sm:px-5 text-slate-600 max-w-[160px] truncate">
                  {emp.hobby || <span className="text-slate-400 italic">None</span>}
                </td>

                {/* Phone Number */}
                <td className="py-3.5 px-4 sm:px-5 text-slate-600 font-mono text-xs">
                  {emp.phoneNumber || <span className="text-slate-400 italic font-sans">N/A</span>}
                </td>

                {/* Status Column */}
                <td className="py-3.5 px-4 sm:px-5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase border ${
                      emp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      id={`view-emp-btn-${emp.employeeId}`}
                      onClick={() => onView(emp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      title="View Profile Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      id={`edit-emp-btn-${emp.employeeId}`}
                      onClick={() => onEdit(emp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {onChangePassword && (
                      <button
                        type="button"
                        id={`change-pass-btn-${emp.employeeId}`}
                        onClick={() => onChangePassword(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                        title="Change Employee Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Password</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
