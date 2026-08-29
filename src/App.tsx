import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminEmployeesPage } from './pages/AdminEmployeesPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AppRoute } from './types';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync route based on authentication status and user role
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setCurrentRoute('/login');
      } else {
        // If currently on login, route to role-appropriate home
        if (currentRoute === '/login') {
          if (isAdmin) {
            setCurrentRoute('/admin');
          } else {
            setCurrentRoute('/profile');
          }
        }
      }
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  const handleNavigate = (route: AppRoute) => {
    // If regular employee attempts to visit admin route, guard against it
    if (!isAdmin && route.startsWith('/admin')) {
      setCurrentRoute('/profile');
      return;
    }
    setCurrentRoute(route);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading application..." />;
  }

  // Not logged in -> Show Login Page
  if (!isAuthenticated || currentRoute === '/login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          // Handled by useEffect
        }}
      />
    );
  }

  // Main Application Shell
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Admin Sidebar */}
        {isAdmin && (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Route: Admin Dashboard */}
          {currentRoute === '/admin' && (
            <AdminRoute
              onNavigateToProfile={() => handleNavigate('/profile')}
              onNavigateToLogin={() => setCurrentRoute('/login')}
            >
              <AdminDashboardPage
                onNavigateToEmployees={() => handleNavigate('/admin/employees')}
                onNavigateToAddEmployee={() => handleNavigate('/admin/employees/add')}
              />
            </AdminRoute>
          )}

          {/* Route: Admin Employees List */}
          {currentRoute === '/admin/employees' && (
            <AdminRoute
              onNavigateToProfile={() => handleNavigate('/profile')}
              onNavigateToLogin={() => setCurrentRoute('/login')}
            >
              <AdminEmployeesPage initialOpenAdd={false} />
            </AdminRoute>
          )}

          {/* Route: Admin Add Employee */}
          {currentRoute === '/admin/employees/add' && (
            <AdminRoute
              onNavigateToProfile={() => handleNavigate('/profile')}
              onNavigateToLogin={() => setCurrentRoute('/login')}
            >
              <AdminEmployeesPage initialOpenAdd={true} />
            </AdminRoute>
          )}

          {/* Route: Profile (for both Employee and Admin) */}
          {currentRoute === '/profile' && (
            <ProtectedRoute onRedirectToLogin={() => setCurrentRoute('/login')}>
              <EmployeeProfilePage />
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
