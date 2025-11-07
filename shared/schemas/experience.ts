import { z } from 'zod';

/**
 * Base Experience Schema (without refinements for reusability)
 * All fields are optional to allow partial resumes
 */
const ExperienceBaseSchema = z.object({
  id: z.number().optional(),
  company: z.string().max(255).optional(),
  role: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^\d{4}-\d{2}(-\d{2})?$/.test(val),
      'Invalid date format (use YYYY-MM or YYYY-MM-DD)'
    ),
  endDate: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val === '' || val === null || /^\d{4}-\d{2}(-\d{2})?$/.test(val),
      'Invalid date format'
    ),
  isCurrent: z.boolean().default(false).optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).default(0).optional(),
});

/**
 * Work Experience Schema with validation
 * Details about employment history
 * All fields optional - only validates date logic if both dates provided and valid
 */
export const ExperienceSchema = ExperienceBaseSchema.refine(
  (data) => {
    // Only validate date logic if both dates are provided and not empty
    if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      // Check if dates are valid
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return end >= start;
      }
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// For creating new experience (no ID) - all fields optional
export const ExperienceCreateSchema = ExperienceBaseSchema.omit({ id: true }).refine(
  (data) => {
    // Only validate date logic if both dates are provided and not empty
    if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      // Check if dates are valid
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return end >= start;
      }
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

