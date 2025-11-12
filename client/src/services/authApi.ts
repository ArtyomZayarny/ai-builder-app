/**
 * Authentication API
 * Client-side API for authentication operations
 */

import { BACKEND_URL } from '../config';

const API_BASE_URL = `${BACKEND_URL}/api`;

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

  // Token is stored in HttpOnly cookie by server (secure, not accessible to JavaScript)
  // No need to store in localStorage (XSS vulnerability)

  return authData;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await fetchAPI<void>('/auth/logout', 'POST');
  // Cookie is cleared by server on logout
}

/**
 * Get current user
 * Uses HttpOnly cookie for authentication (secure, not accessible to JavaScript)
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // HttpOnly cookie is sent automatically
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
