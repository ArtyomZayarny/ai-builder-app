import { z } from 'zod';

/**
 * Base Project Schema
 */
const ProjectBaseSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().min(10, 'Description should be at least 10 characters').max(2000),
  technologies: z.array(z.string().max(50)).default([]),
  url: z.string().url('Invalid project URL').optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Invalid date format').optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

/**
 * Project Schema
 * Portfolio projects and work samples
 */
export const ProjectSchema = ProjectBaseSchema;

// For creating new project (no ID)
export const ProjectCreateSchema = ProjectBaseSchema.omit({ id: true });

// For updating (all fields optional except ID)
export const ProjectUpdateSchema = ProjectBaseSchema.partial().required({ id: true });

// TypeScript types
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

// Example
export const projectExample: ProjectCreate = {
  name: 'E-commerce Platform',
  description:
    'Built full-stack marketplace with Next.js, Stripe payments, and real-time inventory management. Deployed on Vercel with PostgreSQL database.',
  technologies: ['Next.js', 'React', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
  url: 'https://github.com/johndoe/ecommerce',
  date: '2023-06',
  order: 0,
};

