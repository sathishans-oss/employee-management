import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  LogIn,
  KeyRound,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import { ApiService } from '../services/api';
import { validateDateOfBirth, validatePassword } from '../utils/validation';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

type AuthMode = 'LOGIN' | 'FORGOT_VERIFY' | 'FORGOT_RESET';

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, isLoading: isAuthLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('LOGIN');

  // Login form state
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password - Step 1 (DOB Verification) state
  const [forgotEmpId, setForgotEmpId] = useState('');
  const [forgotDob, setForgotDob] = useState('');
  const [isVerifyingDob, setIsVerifyingDob] = useState(false);

  // Forgot Password - Step 2 (Reset Password) state
  const [resetToken, setResetToken] = useState('');
  const [verifiedEmpId, setVerifiedEmpId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Status banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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

  // Switch to Forgot Password view
  const handleOpenForgotPassword = () => {
    setMode('FORGOT_VERIFY');
    setForgotEmpId(employeeId.trim());
    setForgotDob('');
    setResetToken('');
    setVerifiedEmpId('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Switch back to Login view
  const handleBackToLogin = () => {
    setMode('LOGIN');
    setErrorMessage(null);
  };

  // Step 1: Handle DOB Verification submission
  const handleVerifyDobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = forgotEmpId.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your Employee ID.');
      return;
    }

    if (!forgotDob) {
      setErrorMessage('Please select or enter your Date of Birth.');
      return;
    }

    const dobValidation = validateDateOfBirth(forgotDob);
    if (!dobValidation.isValid) {
      setErrorMessage(dobValidation.error || 'Please enter a valid Date of Birth.');
      return;
    }

    setIsVerifyingDob(true);
    try {
      const res = await ApiService.verifyDob(cleanId, forgotDob);
      if (res.success && res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setVerifiedEmpId(res.data.employeeId || cleanId);
        setMode('FORGOT_RESET');
        setErrorMessage(null);
      } else {
        // Strict security requirement: generic error message
        setErrorMessage(res.error || 'Employee ID or Date of Birth is incorrect.');
      }
    } catch {
      setErrorMessage('Employee ID or Date of Birth is incorrect.');
    } finally {
      setIsVerifyingDob(false);
    }
  };

  // Step 2: Handle Set New Password submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    const pwdValidation = validatePassword(newPassword);
    if (!pwdValidation.isValid) {
      setErrorMessage(pwdValidation.error || 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    if (!resetToken) {
      setErrorMessage('Verification expired. Please verify your Date of Birth again.');
      setMode('FORGOT_VERIFY');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await ApiService.resetPassword(resetToken, newPassword);
      if (res.success) {
        // Success: transition back to login with prefilled Employee ID
        setEmployeeId(verifiedEmpId || forgotEmpId);
        setPassword('');
        setMode('LOGIN');
        setResetToken('');
        setVerifiedEmpId('');
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage(null);
        setSuccessMessage('Password changed successfully. Please login with your new password.');
      } else {
        setErrorMessage(res.error || 'Failed to update password. Please verify your details again.');
      }
    } catch {
      setErrorMessage('Something went wrong updating password. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Container Card */}
      <div
        id="login-card"
        className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6"
      >
        {/* ========================================================================= */}
        {/* MODE 1: STANDARD LOGIN VIEW                                               */}
        {/* ========================================================================= */}
        {mode === 'LOGIN' && (
          <>
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

            {/* Success Alert Banner (e.g. after password reset) */}
            {successMessage && (
              <div
                id="login-success-banner"
                className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">{successMessage}</div>
              </div>
            )}

            {/* Error Alert */}
            <ErrorMessage
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    disabled={isAuthLoading}
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
                  <button
                    type="button"
                    id="forgot-password-link-btn"
                    onClick={handleOpenForgotPassword}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-hidden"
                  >
                    Forgot Password?
                  </button>
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
                    disabled={isAuthLoading}
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
                disabled={isAuthLoading}
                className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAuthLoading ? (
                  <LoadingSpinner size="sm" message="Authenticating..." />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: FORGOT PASSWORD - STEP 1 (VERIFY EMPLOYEE ID + DATE OF BIRTH)     */}
        {/* ========================================================================= */}
        {mode === 'FORGOT_VERIFY' && (
          <>
            {/* Header Title */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-xs mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reset Password
              </h2>
              <p className="text-sm text-slate-500">
                Enter your Employee ID and Date of Birth to verify your identity.
              </p>
            </div>

            {/* Error Alert */}
            <ErrorMessage
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />

            {/* Verify DOB Form */}
            <form onSubmit={handleVerifyDobSubmit} className="space-y-4">
              {/* Employee ID */}
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-employee-id"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Employee ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-employee-id"
                    name="forgotEmployeeId"
                    type="text"
                    value={forgotEmpId}
                    onChange={(e) => setForgotEmpId(e.target.value)}
                    placeholder="e.g. EMP001"
                    disabled={isVerifyingDob}
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Date of Birth Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-dob"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-dob"
                    name="forgotDob"
                    type="date"
                    value={forgotDob}
                    onChange={(e) => setForgotDob(e.target.value)}
                    disabled={isVerifyingDob}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Select your exact Date of Birth registered in the employee record.
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                id="verify-dob-submit-btn"
                disabled={isVerifyingDob}
                className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifyingDob ? (
                  <LoadingSpinner size="sm" message="Verifying..." />
                ) : (
                  <span>Verify</span>
                )}
              </button>

              {/* Back to Login Link */}
              <button
                type="button"
                id="back-to-login-btn"
                onClick={handleBackToLogin}
                disabled={isVerifyingDob}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 rounded-xl hover:bg-slate-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </form>
          </>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: FORGOT PASSWORD - STEP 2 (SET NEW PASSWORD AFTER VERIFICATION)     */}
        {/* ========================================================================= */}
        {mode === 'FORGOT_RESET' && (
          <>
            {/* Header Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Identity Verified ✓</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reset Password
              </h2>
              <p className="text-sm text-slate-500">
                You can now set a new password for employee{' '}
                <span className="font-mono font-bold text-slate-800">{verifiedEmpId}</span>.
              </p>
            </div>

            {/* Error Alert */}
            <ErrorMessage
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />

            {/* Set New Password Form */}
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={isResettingPassword}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    id="toggle-new-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    disabled={isResettingPassword}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    id="toggle-confirm-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                id="reset-password-submit-btn"
                disabled={isResettingPassword}
                className="w-full mt-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isResettingPassword ? (
                  <LoadingSpinner size="sm" message="Updating password..." />
                ) : (
                  <span>Change Password</span>
                )}
              </button>

              {/* Cancel Link */}
              <button
                type="button"
                id="cancel-reset-btn"
                onClick={handleBackToLogin}
                disabled={isResettingPassword}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 rounded-xl hover:bg-slate-50"
              >
                <span>Cancel</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

