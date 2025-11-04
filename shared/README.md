# @resume-builder/shared

Shared validation schemas and types for AI Resume Builder.

## Purpose

This package provides a **single source of truth** for data validation between frontend and backend using Zod schemas.

## Usage

### In Backend (server/)

```javascript
import { PersonalInfoSchema, ExperienceSchema } from '@resume-builder/shared';

// Validate request data
const validData = PersonalInfoSchema.parse(req.body);
```

### In Frontend (client/)

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInfoSchema } from '@resume-builder/shared';

const { register, handleSubmit } = useForm({
  resolver: zodResolver(PersonalInfoSchema)
});
```

## Available Schemas

- `PersonalInfoSchema` - Personal contact information
- `SummarySchema` - Professional summary
- `ExperienceSchema` - Work experience entry
- `EducationSchema` - Education entry
- `ProjectSchema` - Project entry
- `SkillSchema` - Skill entry
- `ResumeSchema` - Complete resume (composition of all above)

