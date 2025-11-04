import { z } from 'zod';
import { PersonalInfoSchema } from './personalInfo.js';
import { SummarySchema } from './summary.js';
import { ExperienceSchema } from './experience.js';
import { EducationSchema } from './education.js';
import { ProjectSchema } from './project.js';
import { SkillSchema } from './skill.js';

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
export const ResumeCreateSchema = z.object({
  title: z.string().min(1).max(255),
  template: z.enum(['classic', 'modern', 'creative', 'technical']).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// For updating resume metadata
export const ResumeUpdateSchema = ResumeMetadataSchema.partial().required({ id: true });

export const resumeExample = {
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

