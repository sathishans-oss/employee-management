import React from 'react';
import { LoginForm } from '../components/LoginForm';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400 font-medium">
        Employee Profile Management System &bull; Secure Google Sheets &amp; Apps Script Backend
      </footer>
    </div>
  );
};
