import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginCredentials } from '../types';
import { APP_CONFIG } from '../config';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
    } catch (e) {
      console.error('Error clearing session from localStorage:', e);
    }
  }, []);

  // Initialize session from storage on app load & verify session timeout
  useEffect(() => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        const now = Date.now();
        const timeoutMs = APP_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000;

        if (parsed.loginTime && now - parsed.loginTime > timeoutMs) {
          console.warn('Session expired. Logging out.');
          logout();
        } else {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Error restoring session:', e);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Login handler
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await ApiService.login(credentials);

      if (response.success && response.data) {
        const authData = response.data;
        setUser(authData);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(authData));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Invalid credentials. Please try again.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Something went wrong. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
