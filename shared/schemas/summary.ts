import { z } from 'zod';

/**
 * Professional Summary Schema
 * Brief description of professional background
 */
export const SummarySchema = z.object({
  content: z
    .string()
    .max(1000, 'Summary is too long (max 1000 characters)')
    .optional(),
});

// For database updates
export const SummaryUpdateSchema = SummarySchema.partial();

// TypeScript types
export type Summary = z.infer<typeof SummarySchema>;
export type SummaryUpdate = z.infer<typeof SummaryUpdateSchema>;

// Example
export const summaryExample: Summary = {
  content:
    'Experienced Full-Stack Developer with 6+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Proven track record of delivering high-quality software solutions and leading technical teams.',
};

