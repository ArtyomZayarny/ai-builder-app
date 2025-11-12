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
  photoUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        // If empty string or undefined, it's valid (will be handled by service)
        if (!val || val === '') return true;
        // If URL contains ImageKit domain, it's valid
        if (typeof val === 'string' && val.includes('ik.imagekit.io')) return true;
        // Otherwise, try to validate as URL
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Invalid photo URL. Must be a valid URL or ImageKit URL.',
      }
    ),
});

// For database updates (all fields optional)
// Use passthrough to preserve fields that don't pass validation (like photoUrl)
export const PersonalInfoUpdateSchema = PersonalInfoSchema.partial().passthrough();

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

