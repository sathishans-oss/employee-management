import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldX, ArrowLeft } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  onNavigateToProfile?: () => void;
  onNavigateToLogin?: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  onNavigateToProfile,
  onNavigateToLogin,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldX className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Authentication Required</h2>
          <p className="text-sm text-slate-600">You must be logged in as an Administrator.</p>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-xl text-center max-w-md w-full space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldX className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are logged in as an <strong>EMPLOYEE</strong>. Employees are restricted to viewing only their own profile and cannot access the Admin portal.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToProfile}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
