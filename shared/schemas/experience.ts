import { z } from 'zod';

/**
 * Base Experience Schema (without refinements for reusability)
 */
const ExperienceBaseSchema = z.object({
  id: z.number().optional(),
  company: z.string().min(1, 'Company name is required').max(255),
  role: z.string().min(1, 'Job title is required').max(255),
  location: z.string().max(255).optional().or(z.literal('')),
  startDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}(-\d{2})?$/,
      'Invalid date format (use YYYY-MM or YYYY-MM-DD)'
    ),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Invalid date format')
    .nullable()
    .optional(),
  isCurrent: z.boolean().default(false),
  description: z
    .string()
    .min(10, 'Description should be at least 10 characters')
    .max(2000),
  order: z.number().int().min(0).default(0),
});

/**
 * Work Experience Schema with validation
 * Details about employment history
 */
export const ExperienceSchema = ExperienceBaseSchema.refine(
  (data) => {
    // If isCurrent is true, endDate should be null or undefined
    if (data.isCurrent) {
      return !data.endDate;
    }
    // If not current, endDate should be provided
    return data.endDate !== null && data.endDate !== undefined;
  },
  {
    message: 'End date is required for past positions',
    path: ['endDate'],
  }
).refine(
  (data) => {
    // Validate that end date is after start date
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// For creating new experience (no ID) - use base schema
export const ExperienceCreateSchema = ExperienceBaseSchema.omit({ id: true }).refine(
  (data) => {
    if (data.isCurrent) {
      return !data.endDate;
    }
    return data.endDate !== null && data.endDate !== undefined;
  },
  {
    message: 'End date is required for past positions',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// For updating (all fields optional, ID not in body - it's in URL params)
export const ExperienceUpdateSchema = ExperienceBaseSchema.omit({ id: true }).partial();

// TypeScript types
export type Experience = z.infer<typeof ExperienceSchema>;
export type ExperienceCreate = z.infer<typeof ExperienceCreateSchema>;
export type ExperienceUpdate = z.infer<typeof ExperienceUpdateSchema>;

// Example
export const experienceExample: ExperienceCreate = {
  company: 'Tech Corp',
  role: 'Senior Full-Stack Developer',
  location: 'San Francisco, CA',
  startDate: '2021-03-01',
  endDate: null,
  isCurrent: true,
  description:
    'Led development of microservices architecture serving 1M+ users. Built React dashboard reducing load times by 40%. Mentored team of 5 junior developers.',
  order: 0,
};

