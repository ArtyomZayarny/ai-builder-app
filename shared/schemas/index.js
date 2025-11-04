/**
 * @resume-builder/shared
 * Shared validation schemas and types
 * 
 * This is the single source of truth for data validation
 * between frontend and backend.
 */

// Personal Info
export {
  PersonalInfoSchema,
  PersonalInfoUpdateSchema,
  personalInfoExample,
} from './personalInfo.js';

// Summary
export { SummarySchema, SummaryUpdateSchema, summaryExample } from './summary.js';

// Experience
export {
  ExperienceSchema,
  ExperienceCreateSchema,
  ExperienceUpdateSchema,
  experienceExample,
} from './experience.js';

// Education
export {
  EducationSchema,
  EducationCreateSchema,
  EducationUpdateSchema,
  educationExample,
} from './education.js';

// Project
export {
  ProjectSchema,
  ProjectCreateSchema,
  ProjectUpdateSchema,
  projectExample,
} from './project.js';

// Skill
export {
  SkillSchema,
  SkillCreateSchema,
  SkillUpdateSchema,
  skillExample,
  SKILL_CATEGORIES,
} from './skill.js';

// Resume (complete)
export {
  ResumeSchema,
  ResumeMetadataSchema,
  ResumeCreateSchema,
  ResumeUpdateSchema,
  resumeExample,
} from './resume.js';

// Re-export zod for convenience
export { z } from 'zod';

