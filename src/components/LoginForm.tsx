import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, LogIn, KeyRound, Sparkles } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, isLoading } = useAuth();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = employeeId.trim();
    if (!trimmedId || !password) {
      setErrorMessage('Please enter both Employee ID and password.');
      return;
    }

    const result = await login({
      employeeId: trimmedId,
      password: password,
    });

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setErrorMessage(result.error || 'Invalid Employee ID or password.');
    }
  };

  // Quick fill helper for Phase 1 testing
  const handleQuickFill = (id: string, pass: string) => {
    setEmployeeId(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Login Card */}
      <div
        id="login-card"
        className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6"
      >
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Profile Management System
          </h2>
          <p className="text-sm text-slate-500">
            Sign in with your Employee ID and password to access your portal.
          </p>
        </div>

        {/* Error Alert */}
        <ErrorMessage
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee ID Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="employeeId"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Employee ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP001 or ADM001"
                disabled={isLoading}
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" message="Authenticating..." />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Phase 1 Demo Credentials Pillbox */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phase 1 Quick Test Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              id="quick-fill-admin-btn"
              onClick={() => handleQuickFill('ADM001', 'admin123')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-left text-purple-900 transition-colors"
            >
              <div className="font-bold text-[11px] uppercase tracking-wider text-purple-700">
                Admin
              </div>
              <div className="font-mono text-slate-700 font-medium">ADM001</div>
              <div className="text-[10px] text-slate-500">pass: admin123</div>
            </button>
            <button
              type="button"
              id="quick-fill-employee-btn"
              onClick={() => handleQuickFill('EMP001', 'password123')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left text-emerald-900 transition-colors"
            >
              <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-700">
                Employee
              </div>
              <div className="font-mono text-slate-700 font-medium">EMP001</div>
              <div className="text-[10px] text-slate-500">pass: password123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
