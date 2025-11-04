import { z } from 'zod';

/**
 * Base Skill Schema
 */
const SkillBaseSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Skill name is required').max(100),
  category: z.string().max(100).optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

/**
 * Skill Schema
 * Technical and professional skills
 */
export const SkillSchema = SkillBaseSchema;

// For creating new skill (no ID)
export const SkillCreateSchema = SkillBaseSchema.omit({ id: true });

// For updating (all fields optional except ID)
export const SkillUpdateSchema = SkillBaseSchema.partial().required({ id: true });

// TypeScript types
export type Skill = z.infer<typeof SkillSchema>;
export type SkillCreate = z.infer<typeof SkillCreateSchema>;
export type SkillUpdate = z.infer<typeof SkillUpdateSchema>;

// Example
export const skillExample: SkillCreate = {
  name: 'React',
  category: 'Frontend',
  order: 0,
};

// Predefined categories for better UX
export const SKILL_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Tools',
  'Soft Skills',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

