import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Employee } from '../types';
import { EmployeeProfileCard } from '../components/EmployeeProfileCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { UserCheck, RefreshCw } from 'lucide-react';

export const EmployeeProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiService.getEmployee(user.employeeId, user);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setError(res.error || 'Unable to retrieve your employee profile.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.employeeId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Employee Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your official personnel profile record.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProfile}
          disabled={isLoading}
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="Refresh profile"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16">
          <LoadingSpinner message="Retrieving your profile information..." />
        </div>
      ) : profile ? (
        <EmployeeProfileCard employee={profile} onRefresh={fetchProfile} />
      ) : (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <p className="text-slate-600">No profile data could be loaded.</p>
        </div>
      )}
    </div>
  );
};
