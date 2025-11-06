/**
 * Authentication API
 * Client-side API for authentication operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

async function fetchAPI<T>(endpoint: string, method: string, body?: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ErrorResponse;
    throw new Error(errorData.error || 'An unknown error occurred');
  }

  return (data as ApiResponse<T>).data;
}

/**
 * Register new user
 */
export async function register(data: RegisterInput): Promise<{ id: number; email: string }> {
  return fetchAPI<{ id: number; email: string }>('/auth/register', 'POST', data);
}

/**
 * Login user
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorData = result as ErrorResponse;
    throw new Error(errorData.error || 'Login failed');
  }

  const authData = (result as ApiResponse<AuthResponse>).data;

  // Store token in localStorage as backup
  if (authData.token) {
    localStorage.setItem('auth_token', authData.token);
  }

  return authData;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await fetchAPI<void>('/auth/logout', 'POST');
  localStorage.removeItem('auth_token');
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    const errorData = result as ErrorResponse;
    throw new Error(errorData.error || 'Failed to get user');
  }

  return (result as ApiResponse<User>).data;
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  await fetchAPI<void>('/auth/forgot-password', 'POST', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await fetchAPI<void>('/auth/reset-password', 'POST', { token, newPassword });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  await fetchAPI<void>(`/auth/verify-email/${token}`, 'GET');
}
