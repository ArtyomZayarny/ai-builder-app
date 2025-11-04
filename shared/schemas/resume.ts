import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { PersonalInfoSchema } from './personalInfo.js';
import { SummarySchema } from './summary.js';
import { ExperienceSchema } from './experience.js';
import { EducationSchema } from './education.js';
import { ProjectSchema } from './project.js';
import { SkillSchema } from './skill.js';

extendZodWithOpenApi(z);

/**
 * Resume Metadata Schema
 * Basic resume settings
 */
export const ResumeMetadataSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  template: z.enum(['classic', 'modern', 'creative', 'technical']).default('classic'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#3B82F6'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Complete Resume Schema
 * Composition of all resume sections
 */
export const ResumeSchema = z.object({
  metadata: ResumeMetadataSchema,
  personalInfo: PersonalInfoSchema,
  summary: SummarySchema.optional(),
  experiences: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillSchema).default([]),
});

// For creating new resume
export const ResumeCreateSchema = z
  .object({
    title: z.string().min(1).max(255).openapi({
      description: 'Resume title',
      example: 'Software Engineer Resume',
    }),
    template: z
      .enum(['classic', 'modern', 'creative', 'technical'])
      .optional()
      .openapi({
        description: 'Template name',
        example: 'classic',
      }),
    accentColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional()
      .openapi({
        description: 'Hex color code for theme accent',
        example: '#3B82F6',
      }),
  })
  .openapi('ResumeCreate');

// For updating resume metadata
export const ResumeUpdateSchema = z
  .object({
    title: z.string().min(1).max(255).optional().openapi({
      description: 'Resume title',
      example: 'Updated Resume Title',
    }),
    template: z
      .enum(['classic', 'modern', 'creative', 'technical'])
      .optional()
      .openapi({
        description: 'Template name',
        example: 'modern',
      }),
    accentColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional()
      .openapi({
        description: 'Hex color code for theme accent',
        example: '#10B981',
      }),
  })
  .openapi('ResumeUpdate');

// TypeScript types
export type ResumeMetadata = z.infer<typeof ResumeMetadataSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
export type ResumeCreate = z.infer<typeof ResumeCreateSchema>;
export type ResumeUpdate = z.infer<typeof ResumeUpdateSchema>;

// Template types
export type ResumeTemplate = 'classic' | 'modern' | 'creative' | 'technical';

// Example
export const resumeExample: Resume = {
  metadata: {
    id: 1,
    title: 'Software Engineer Resume',
    template: 'classic',
    accentColor: '#3B82F6',
  },
  personalInfo: {
    name: 'John Doe',
    role: 'Senior Full-Stack Developer',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    portfolioUrl: 'https://johndoe.dev',
  },
  summary: {
    content:
      'Experienced Full-Stack Developer with 6+ years of expertise in building scalable web applications.',
  },
  experiences: [],
  education: [],
  projects: [],
  skills: [],
};

