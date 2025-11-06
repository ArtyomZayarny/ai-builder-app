import { z } from 'zod';

/**
 * Personal Information Schema
 * Basic contact details and professional identity
 */
export const PersonalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  role: z.string().min(1, 'Professional title is required').max(255, 'Title is too long'),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
  linkedinUrl: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url('Invalid portfolio URL')
    .optional()
    .or(z.literal('')),
  photoUrl: z.string().url('Invalid photo URL').optional().or(z.literal('')),
});

// For database updates (all fields optional)
export const PersonalInfoUpdateSchema = PersonalInfoSchema.partial();

// TypeScript types
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type PersonalInfoUpdate = z.infer<typeof PersonalInfoUpdateSchema>;

// Example
export const personalInfoExample: PersonalInfo = {
  name: 'John Doe',
  role: 'Senior Full-Stack Developer',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  portfolioUrl: 'https://johndoe.dev',
};

