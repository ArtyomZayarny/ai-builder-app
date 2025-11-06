/**
 * Authentication Context
 * Manages user authentication state
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  type User,
  type LoginInput,
  type RegisterInput,
} from '../services/authApi';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch {
      // Not authenticated or token expired
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginInput) => {
    const result = await loginApi(data);
    setUser(result.user);
  };

  const register = async (data: RegisterInput) => {
    await registerApi(data);
    // After registration, automatically log in
    await login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
