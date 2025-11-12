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
      // Check authentication via HttpOnly cookie (secure)
      // If cookie exists and is valid, getCurrentUser will succeed
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      // Not authenticated or token expired
      // Cookie is cleared by server or doesn't exist
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
