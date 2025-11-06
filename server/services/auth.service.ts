/**
 * Authentication Service
 * Handles user authentication, registration, and password management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/connection.js';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
  failed_login_attempts: number;
  account_locked_until: Date | null;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: number, email: string): string {
  const payload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: number; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Generate random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Register new user
 */
export async function registerUser(data: RegisterInput): Promise<{ id: number; email: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new ValidationError('Invalid email format');
  }

  // Validate password strength
  if (data.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // Check if user already exists
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existingUser.rows.length > 0) {
    throw new ValidationError('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Generate email verification token
  const emailVerificationToken = generateRandomToken();

  // Insert user
  const result = await pool.query<{ id: number; email: string }>(
    `INSERT INTO users (email, password_hash, first_name, last_name, email_verification_token)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email`,
    [data.email, passwordHash, data.firstName || null, data.lastName || null, emailVerificationToken]
  );

  // TODO: Send verification email (optional for MVP)

  return result.rows[0];
}

/**
 * Login user
 */
export async function loginUser(data: LoginInput): Promise<{ token: string; user: { id: number; email: string; firstName?: string; lastName?: string } }> {
  // Find user
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, first_name, last_name, email_verified, 
            failed_login_attempts, account_locked_until
     FROM users WHERE email = $1`,
    [data.email]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const user = result.rows[0];

  // Check if account is locked
  if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
    throw new UnauthorizedError('Account is temporarily locked due to too many failed login attempts');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password_hash);

  if (!isPasswordValid) {
    // Increment failed login attempts
    const newFailedAttempts = user.failed_login_attempts + 1;
    const lockoutUntil = newFailedAttempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION)
      : null;

    await pool.query(
      `UPDATE users 
       SET failed_login_attempts = $1, 
           account_locked_until = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [newFailedAttempts, lockoutUntil, user.id]
    );

    throw new UnauthorizedError('Invalid email or password');
  }

  // Reset failed login attempts on successful login
  if (user.failed_login_attempts > 0) {
    await pool.query(
      `UPDATE users 
       SET failed_login_attempts = 0, 
           account_locked_until = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name || undefined,
      lastName: user.last_name || undefined,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<{ id: number; email: string; firstName?: string; lastName?: string; emailVerified: boolean }> {
  const result = await pool.query<{ id: number; email: string; first_name: string | null; last_name: string | null; email_verified: boolean }>(
    `SELECT id, email, first_name, last_name, email_verified
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User');
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name || undefined,
    lastName: user.last_name || undefined,
    emailVerified: user.email_verified,
  };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (user.rows.length === 0) {
    // Don't reveal if email exists (security best practice)
    return;
  }

  const resetToken = generateRandomToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    `UPDATE users 
     SET password_reset_token = $1, 
         password_reset_expires = $2,
         updated_at = NOW()
     WHERE email = $3`,
    [resetToken, resetExpires, email]
  );

  // TODO: Send password reset email
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  const user = await pool.query<{ id: number }>(
    `SELECT id FROM users 
     WHERE password_reset_token = $1 
       AND password_reset_expires > NOW()`,
    [token]
  );

  if (user.rows.length === 0) {
    throw new ValidationError('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);

  await pool.query(
    `UPDATE users 
     SET password_hash = $1,
         password_reset_token = NULL,
         password_reset_expires = NULL,
         failed_login_attempts = 0,
         account_locked_until = NULL,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, user.rows[0].id]
  );
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  const result = await pool.query<{ id: number }>(
    `SELECT id FROM users 
     WHERE email_verification_token = $1 
       AND email_verified = FALSE`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new ValidationError('Invalid or already verified token');
  }

  await pool.query(
    `UPDATE users 
     SET email_verified = TRUE,
         email_verification_token = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [result.rows[0].id]
  );
}

