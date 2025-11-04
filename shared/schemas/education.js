import { z } from 'zod';

/**
 * Base Education Schema
 */
const EducationBaseSchema = z.object({
  id: z.number().optional(),
  institution: z.string().min(1, 'Institution name is required').max(255),
  degree: z.string().min(1, 'Degree/certification is required').max(255),
  field: z.string().max(255).optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
  graduationDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Invalid date format').optional().or(z.literal('')),
  gpa: z.string().max(10).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

/**
 * Education Schema
 * Academic credentials and certifications
 */
export const EducationSchema = EducationBaseSchema;

// For creating new education (no ID)
export const EducationCreateSchema = EducationBaseSchema.omit({ id: true });

// For updating (all fields optional except ID)
export const EducationUpdateSchema = EducationBaseSchema.partial().required({ id: true });

export const educationExample = {
  institution: 'University of California, Berkeley',
  degree: 'Bachelor of Science',
  field: 'Computer Science',
  location: 'Berkeley, CA',
  graduationDate: '2017-05',
  gpa: '3.8',
  description: 'Relevant coursework: Data Structures, Algorithms, Web Development, Machine Learning',
  order: 0,
};

