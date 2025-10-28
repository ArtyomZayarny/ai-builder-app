# Product Requirements Document: AI Resume Builder

## Document Control

- **Version**: 1.0
- **Last Updated**: October 28, 2025
- **Status**: Draft for Review

---

## 1. Product Overview

### Executive Summary

AI Resume Builder is a full-stack web application that enables users to create, edit, enhance, and share professional resumes online. The platform leverages AI technology (Google Gemini via OpenAI-compatible interface) to provide intelligent content enhancement while offering a seamless user experience through multiple templates, customization options, and PDF generation capabilities.

### Problem Statement

Job seekers struggle with:

- Creating professional-looking resumes from scratch
- Writing compelling professional summaries and experience descriptions
- Maintaining consistent formatting across resume versions
- Sharing resumes in multiple formats (PDF, web link)
- Digitizing existing paper/PDF resumes for editing

### Value Proposition

- **Time Efficiency**: Upload existing PDF resume and auto-populate fields, saving manual data entry
- **AI-Powered Enhancement**: Intelligent rewriting of summaries and experience descriptions for professional impact
- **Professional Design**: Multiple templates with customizable color themes and live preview
- **Flexibility**: Download as PDF or share via public web link
- **Ease of Use**: Intuitive interface with profile photo management and background removal

---

## 2. Target Users & Use Cases

### Primary User Personas

#### Persona 1: Recent Graduate

- **Demographics**: 22-25 years old, limited work experience
- **Needs**: Professional resume template, AI help with wording, easy editing
- **Pain Points**: Unsure how to describe internships and projects professionally
- **Use Case**: Create first professional resume with AI assistance for summary and experience descriptions

#### Persona 2: Career Switcher

- **Demographics**: 30-40 years old, transitioning between industries
- **Needs**: Update existing resume, reframe experience for new field
- **Pain Points**: Difficulty articulating transferable skills
- **Use Case**: Upload existing PDF, use AI to rewrite experience descriptions to highlight relevant skills

#### Persona 3: Active Job Seeker

- **Demographics**: 25-45 years old, applying to multiple positions
- **Needs**: Multiple resume versions, quick customization, shareable links
- **Pain Points**: Managing different resume versions, quick formatting changes
- **Use Case**: Create multiple resume variations with different templates and share specific versions via link

### Use Cases

#### UC-1: Create Resume from Scratch

1. User signs up and logs into dashboard
2. User creates new resume
3. User fills in personal information, adds profile photo
4. User adds sections (summary, experience, education, projects, skills)
5. User applies AI enhancement to summary and experience descriptions
6. User selects template and color theme
7. User downloads PDF or enables public sharing

#### UC-2: Import and Edit Existing Resume

1. User uploads PDF resume
2. System extracts and auto-populates resume fields
3. User reviews and corrects any extraction errors
4. User enhances content with AI
5. User customizes design and exports

#### UC-3: Share Resume Publicly

1. User toggles resume visibility to "public"
2. System generates shareable link
3. User copies link to share with employers/recruiters
4. Public viewers access read-only resume at `/public/:resumeId`

---

## 3. Feature Specifications

### 3.1 Authentication & User Management

#### F-001: Email/Password Authentication

- **Priority**: P0 (Critical)
- **Description**: Secure user registration and login
- **Requirements**:
  - Email validation
  - Password strength requirements (min 8 characters, mix of letters/numbers)
  - Password hashing and salting (bcrypt or similar)
  - Secure session management with HttpOnly cookies
  - Password reset functionality
- **Security Considerations**:
  - Rate limiting on login attempts (max 5 attempts per 15 minutes)
  - CSRF protection on all authentication endpoints
  - Account lockout after 10 failed attempts
  - Email verification for new accounts

### 3.2 Dashboard

#### F-002: Resume Dashboard

- **Priority**: P0 (Critical)
- **Description**: Central hub for managing multiple resumes
- **Requirements**:
  - Display list of user's resumes with thumbnails
  - Show resume metadata (title, last modified, visibility status)
  - Actions: Create new, edit, duplicate, delete
  - Visual indicators for public/private status
  - Responsive grid layout

### 3.3 Resume Builder

#### F-003: Personal Information Section

- **Priority**: P0 (Critical)
- **Description**: Basic contact details and professional identity
- **Fields**:
  - Full name (required)
  - Professional title/headline (required)
  - Email (required, validated)
  - Phone number (optional, validated format)
  - Location (optional)
  - LinkedIn URL (optional, validated URL format)
  - Portfolio/Website URL (optional, validated URL format)
  - Profile photo (optional, see F-004)

#### F-004: Profile Photo Upload

- **Priority**: P1 (High)
- **Description**: Upload and manage profile picture with background removal option
- **Requirements**:
  - File upload (JPEG, PNG, max 5MB)
  - Integration with ImageKit for image hosting
  - Optional background removal toggle using ImageKit transformations
  - Image cropping/positioning preview
  - Responsive image optimization
- **Technical**:
  - Use ImageKit upload widget or API
  - Store ImageKit URL in database
  - Apply background removal transformation: `tr:bg-transparent`
- **Security**:
  - Validate file type and size on both frontend and backend
  - Scan uploaded files for malicious content
  - Store in secure, access-controlled location

#### F-005: Professional Summary Section

- **Priority**: P0 (Critical)
- **Description**: Brief professional introduction with AI enhancement
- **Requirements**:
  - Textarea input (250-500 characters recommended)
  - Character count indicator
  - "AI Enhance" button to rewrite content
  - Loading state during AI processing
  - Ability to accept/reject AI suggestions
  - Manual editing after AI enhancement

#### F-006: Work Experience Section

- **Priority**: P0 (Critical)
- **Description**: Employment history with individual AI enhancement per role
- **Requirements**:
  - Add multiple work experience entries
  - Fields per entry:
    - Company name (required)
    - Job title (required)
    - Location (optional)
    - Start date (required, date picker)
    - End date (optional, "Present" checkbox)
    - Description (required, bullet points or paragraph)
  - "AI Enhance" button per entry
  - Reorder entries via drag-and-drop
  - Delete individual entries

#### F-007: Education Section

- **Priority**: P0 (Critical)
- **Description**: Academic background
- **Requirements**:
  - Add multiple education entries
  - Fields per entry:
    - Institution name (required)
    - Degree/Certification (required)
    - Field of study (optional)
    - Location (optional)
    - Graduation date (optional)
    - GPA (optional)
    - Description/Achievements (optional)
  - Reorder entries
  - Delete individual entries

#### F-008: Projects Section

- **Priority**: P1 (High)
- **Description**: Portfolio projects and notable work
- **Requirements**:
  - Add multiple project entries
  - Fields per entry:
    - Project name (required)
    - Description (required)
    - Technologies used (optional, tags)
    - URL/Demo link (optional)
    - Date/Duration (optional)
  - Reorder entries
  - Delete individual entries

#### F-009: Skills Section

- **Priority**: P0 (Critical)
- **Description**: Technical and soft skills listing
- **Requirements**:
  - Add multiple skills
  - Skills organized by category (optional grouping)
  - Visual representation options (list, tags, bars)
  - Proficiency level (optional)
  - Reorder and delete skills

### 3.4 AI Enhancement

#### F-010: AI-Powered Content Enhancement

- **Priority**: P0 (Critical)
- **Description**: Intelligent rewriting of summary and experience descriptions using Google Gemini
- **Requirements**:
  - Integration with Google Gemini via OpenAI-compatible interface
  - Separate enhancement endpoints for:
    - Professional summary
    - Individual work experience descriptions
  - Request/response handling:
    - Send original text as context
    - Receive enhanced version
    - Display side-by-side comparison
  - User controls:
    - Accept enhancement (replace original)
    - Reject enhancement (keep original)
    - Try again (generate alternative)
  - Loading states and error handling
- **Technical Implementation**:
  - Backend service (`aiService.js`) handles API calls
  - API key stored securely in environment variables (never exposed to frontend)
  - Rate limiting on AI endpoints (max 10 requests per user per minute)
  - Timeout handling (30-second max wait)
  - Graceful degradation if AI service unavailable
- **AI Behavior Expectations**:
  - **Tone**: Professional, confident, achievement-oriented
  - **Style**: Active voice, quantifiable results when possible, industry-appropriate terminology
  - **Length**: Summary ~150-250 words; Experience descriptions 50-150 words per role
  - **Consistency**: Maintain factual accuracy while improving presentation
  - **Personalization**: Adapt to user's industry and seniority level based on context

### 3.5 PDF Upload & Auto-Fill

#### F-011: PDF Resume Upload

- **Priority**: P1 (High)
- **Description**: Upload existing PDF resume to automatically populate resume fields
- **Requirements**:
  - File upload interface (PDF only, max 10MB)
  - PDF parsing and text extraction
  - Intelligent field mapping to resume sections
  - Confidence scoring for extracted data
  - Review and edit interface for user to correct extraction errors
  - Support for common resume formats
- **Technical Implementation**:
  - Use PDF parsing library (pdf-parse or similar)
  - NLP or pattern matching for field identification
  - Store original PDF temporarily (delete after successful import)
- **Limitations**:
  - May not extract all formatting
  - Complex layouts may require manual correction
  - Image-based PDFs may have lower accuracy

### 3.6 Template & Customization

#### F-012: Resume Templates

- **Priority**: P0 (Critical)
- **Description**: Multiple professional resume templates
- **Requirements**:
  - Minimum 3-5 distinct templates:
    - Classic (traditional, ATS-friendly)
    - Modern (clean, minimalist)
    - Creative (design-forward, for creative roles)
    - Technical (emphasizes skills and projects)
  - Live preview when switching templates
  - Template selection persists with resume
  - Responsive design (optimized for PDF export)

#### F-013: Color Theme Customization

- **Priority**: P1 (High)
- **Description**: Accent color selection for personalization
- **Requirements**:
  - Color picker or preset palette (8-12 professional colors)
  - Preview color changes in real-time
  - Apply to headers, accents, and section dividers
  - Maintain readability and contrast (WCAG AA compliance)
  - Color selection persists with resume

### 3.7 Export & Sharing

#### F-014: PDF Download

- **Priority**: P0 (Critical)
- **Description**: Generate and download resume as PDF
- **Requirements**:
  - High-quality PDF generation matching preview
  - Proper page breaks
  - Embedded fonts for consistent rendering
  - Metadata (title, author)
  - Filename: `[FirstName]_[LastName]_Resume.pdf`
- **Technical Implementation**:
  - Use PDF generation library (Puppeteer, PDFKit, or html2pdf)
  - Server-side rendering for consistent output
  - Optimize for ATS (Applicant Tracking Systems) compatibility

#### F-015: Public/Private Visibility Toggle

- **Priority**: P1 (High)
- **Description**: Control resume visibility and generate shareable links
- **Requirements**:
  - Toggle switch for public/private status
  - Generate unique, unguessable URL for public resumes
  - URL format: `/public/:resumeId` (resumeId should be UUID or similar)
  - Copy link button with confirmation
  - SEO-friendly public page with meta tags
  - Public page is read-only (no editing)
  - Option to disable public link (revert to private)

#### F-016: Public Resume View

- **Priority**: P1 (High)
- **Description**: Clean, read-only view for public resume links
- **Requirements**:
  - Render resume with selected template and colors
  - No authentication required
  - No UI elements for editing
  - Option to download PDF from public view
  - Basic analytics (optional): view count
  - 404 error for invalid or private resume IDs

---

## 4. Non-Functional Requirements

### 4.1 User Experience

#### UX-001: Responsiveness

- Mobile-responsive design (breakpoints: 320px, 768px, 1024px, 1440px)
- Touch-friendly interface for mobile devices
- Optimized layouts for tablet and desktop

#### UX-002: Performance

- Initial page load < 3 seconds on 3G connection
- Resume builder interactions < 200ms response time
- AI enhancement response < 10 seconds (with loading indicator)
- PDF generation < 5 seconds
- Image uploads with progress indicator

#### UX-003: Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation for all features
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Alt text for images
- Form labels and ARIA attributes

#### UX-004: Usability

- Auto-save functionality (save draft every 30 seconds)
- Undo/redo for text changes
- Confirmation dialogs for destructive actions (delete resume)
- Inline validation with helpful error messages
- Contextual help tooltips
- Progress indicators for multi-step processes

### 4.2 Security

#### SEC-001: Authentication & Authorization

- Secure password hashing (bcrypt, min 10 rounds)
- JWT or session-based authentication
- HttpOnly, Secure, SameSite cookies for session management
- CSRF protection on all state-changing operations
- Authorization checks on every API endpoint
- Users can only access their own resumes (except public links)

#### SEC-002: Data Protection

- HTTPS everywhere (TLS 1.2+)
- API keys stored in environment variables (never in code or frontend)
- Input validation and sanitization on all user inputs (XSS prevention)
- Parameterized queries or ORM to prevent SQL injection
- Rate limiting on all API endpoints:
  - Authentication: 5 requests per 15 minutes
  - AI endpoints: 10 requests per minute
  - General API: 100 requests per minute per user
- File upload validation (type, size, malicious content)

#### SEC-003: Security Headers

Implement the following headers:

- `Content-Security-Policy`: Restrict resource loading
- `X-Frame-Options`: `DENY` (prevent clickjacking)
- `X-Content-Type-Options`: `nosniff`
- `Strict-Transport-Security`: HSTS with max-age=31536000
- `Referrer-Policy`: `strict-origin-when-cross-origin`

#### SEC-004: API Security

- CORS configuration: whitelist allowed origins
- API authentication for all protected endpoints
- No sensitive data in error messages (log detailed errors server-side only)
- Secure handling of user-uploaded files (isolated storage, access controls)

### 4.3 Performance & Scalability

#### PERF-001: Optimization

- Image optimization and lazy loading
- Code splitting for faster initial load
- Caching strategy for static assets (CDN)
- Database query optimization (indexes, query analysis)
- Minimize API calls (batching where appropriate)

#### PERF-002: Scalability Considerations

- Stateless backend architecture for horizontal scaling
- Database connection pooling
- Async processing for long-running tasks (PDF generation, AI calls)
- CDN for static assets and public resume pages
- Monitoring and alerting for performance degradation

### 4.4 Reliability & Availability

#### REL-001: Error Handling

- Graceful degradation when AI service unavailable
- Retry logic with exponential backoff for transient failures
- User-friendly error messages
- Comprehensive logging for debugging (without sensitive data)

#### REL-002: Data Integrity

- Regular database backups (daily, retained for 30 days)
- Data validation at all layers (frontend, backend, database)
- Transactional operations where appropriate
- Soft delete for resumes (recoverable for 30 days)

---

## 5. Technical Architecture

### 5.1 System Architecture Overview

**Architecture Pattern**: Client-Server REST API model

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                         │
├─────────────────────────────────────────────────────────────┤
│  React + Vite SPA                                          │
│  - UI Components (TailwindCSS + Lucide Icons)              │
│  - Routing (React Router DOM)                              │
│  - State Management (Redux Toolkit / Context API)          │
│  - API Client (Axios / Fetch)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                        HTTPS (REST API)
                            │
┌─────────────────────────────────────────────────────────────┐
│                        SERVER TIER                          │
├─────────────────────────────────────────────────────────────┤
│  Node.js + Express                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ROUTES LAYER                                          │ │
│  │  - /api/auth         - /api/users                     │ │
│  │  - /api/resumes      - /api/ai                        │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ CONTROLLERS LAYER                                     │ │
│  │  - authController    - userController                 │ │
│  │  - resumeController  - aiController                   │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ SERVICES LAYER                                        │ │
│  │  - authService       - resumeService                  │ │
│  │  - aiService         - pdfService                     │ │
│  │  - imageService                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ DATA ACCESS LAYER                                     │ │
│  │  - Models (ORM): User, Resume, Experience, Education, │ │
│  │    Project, Skill                                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼────────┐ ┌─────▼──────┐ ┌────────▼────────┐
│   DATABASE       │ │  IMAGEKIT  │ │  GOOGLE GEMINI  │
│   (PostgreSQL/   │ │   API      │ │  (via OpenAI-   │
│    MySQL/        │ │  (Images)  │ │   compatible)   │
│    MongoDB)      │ │            │ │                 │
└──────────────────┘ └────────────┘ └─────────────────┘
```

### 5.2 Technology Stack

#### Frontend

- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS 3+
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **State Management**: Redux Toolkit or React Context API
- **HTTP Client**: Axios
- **Form Management**: React Hook Form + Zod validation
- **PDF Preview**: react-pdf or similar

#### Backend

- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js
- **Language**: JavaScript (ES6+) or TypeScript
- **Authentication**: Passport.js or custom JWT
- **Validation**: Joi or Zod
- **PDF Generation**: Puppeteer or PDFKit
- **PDF Parsing**: pdf-parse

#### Database

- **Primary Options**:
  - PostgreSQL (recommended for relational data, strong type support)
  - MySQL (alternative relational option)
  - MongoDB (if document-based approach preferred)
- **ORM**: Sequelize (SQL) or Mongoose (MongoDB)
- **Migration Management**: Sequelize migrations or Prisma

#### External Services

- **Image Hosting**: ImageKit (with background removal API)
- **AI Service**: Google Gemini via OpenAI-compatible interface
- **Email**: SendGrid or similar (for verification, password reset)

#### DevOps & Infrastructure

- **Version Control**: Git + GitHub/GitLab
- **CI/CD**: GitHub Actions or GitLab CI
- **Hosting Options**:
  - Frontend: Vercel, Netlify, or AWS S3 + CloudFront
  - Backend: AWS EC2, Heroku, or DigitalOcean
  - Alternative: Next.js on Vercel (full-stack)
- **Environment Management**: dotenv
- **Logging**: Winston or Pino
- **Monitoring**: Sentry (error tracking), LogRocket (session replay)

### 5.3 Alternative Architecture: Next.js + Supabase

**Note**: The technical documentation provided references Next.js and Supabase extensively. This represents an alternative, modern architecture:

#### Next.js Full-Stack Approach

- **Framework**: Next.js 14+ with App Router
- **Rendering**: Server-side rendering (SSR) and static generation
- **API Routes**: Next.js API routes replace Express backend
- **Benefits**: Simplified deployment, better SEO, integrated frontend/backend

#### Supabase Backend-as-a-Service

- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth (email/password, social logins)
- **Storage**: Supabase Storage (for images and generated PDFs)
- **Edge Functions**: Supabase Edge Functions (Deno runtime) for AI integration
- **Benefits**: Reduced backend code, built-in security, real-time capabilities

#### Decision Point

**Recommendation**: Evaluate both architectures:

- **React + Express**: More flexibility, explicit control, suitable for complex custom logic
- **Next.js + Supabase**: Faster development, less infrastructure management, modern DX

### 5.4 Folder Structure (Express Backend)

```
/project-root
├── /client                      # React frontend
│   ├── /src
│   │   ├── /components          # Reusable UI components
│   │   ├── /pages               # Page components
│   │   ├── /features            # Feature-specific logic
│   │   ├── /services            # API client services
│   │   ├── /store               # Redux store (if using Redux)
│   │   ├── /utils               # Helper functions
│   │   ├── /assets              # Static assets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── /server                      # Node.js backend
│   ├── /routes                  # API route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── resumes.js
│   │   └── ai.js
│   ├── /controllers             # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── resumeController.js
│   │   └── aiController.js
│   ├── /services                # Business logic
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   ├── aiService.js
│   │   ├── pdfService.js
│   │   └── imageService.js
│   ├── /db                      # Database layer
│   │   ├── /models              # ORM models
│   │   │   ├── User.js
│   │   │   ├── Resume.js
│   │   │   ├── Experience.js
│   │   │   ├── Education.js
│   │   │   ├── Project.js
│   │   │   └── Skill.js
│   │   ├── /migrations          # DB migrations
│   │   └── index.js             # DB connection
│   ├── /middleware              # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── /utils                   # Helper functions
│   ├── /config                  # Configuration files
│   ├── server.js                # Entry point
│   └── package.json
├── .env.example                 # Environment variables template
├── .gitignore
└── README.md
```

### 5.5 Data Models

#### User Model

```javascript
{
  id: UUID (Primary Key),
  email: String (unique, required),
  passwordHash: String (required),
  firstName: String,
  lastName: String,
  createdAt: DateTime,
  updatedAt: DateTime,
  lastLoginAt: DateTime,
  emailVerified: Boolean,
  // Relationships
  resumes: [Resume]
}
```

#### Resume Model

```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key),
  title: String,
  templateId: String,
  accentColor: String (#hex),
  isPublic: Boolean (default: false),
  publicId: String (unique, for public URL),
  viewCount: Integer (default: 0),
  createdAt: DateTime,
  updatedAt: DateTime,
  // Embedded/Related Data
  personalInfo: PersonalInfo,
  summary: String,
  experiences: [Experience],
  education: [Education],
  projects: [Project],
  skills: [Skill]
}
```

#### PersonalInfo (Embedded in Resume)

```javascript
{
  fullName: String (required),
  professionalTitle: String,
  email: String (required),
  phone: String,
  location: String,
  linkedinUrl: String,
  portfolioUrl: String,
  photoUrl: String (ImageKit URL)
}
```

#### Experience Model

```javascript
{
  id: UUID (Primary Key),
  resumeId: UUID (Foreign Key),
  company: String (required),
  position: String (required),
  location: String,
  startDate: Date (required),
  endDate: Date (null if current),
  isCurrent: Boolean,
  description: Text (required),
  order: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Education Model

```javascript
{
  id: UUID (Primary Key),
  resumeId: UUID (Foreign Key),
  institution: String (required),
  degree: String (required),
  fieldOfStudy: String,
  location: String,
  graduationDate: Date,
  gpa: String,
  description: Text,
  order: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Project Model

```javascript
{
  id: UUID (Primary Key),
  resumeId: UUID (Foreign Key),
  name: String (required),
  description: Text (required),
  technologies: [String],
  url: String,
  date: String,
  order: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Skill Model

```javascript
{
  id: UUID (Primary Key),
  resumeId: UUID (Foreign Key),
  name: String (required),
  category: String,
  proficiencyLevel: Integer (1-5),
  order: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### 5.6 API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register          # Create new account
POST   /api/auth/login             # Authenticate user
POST   /api/auth/logout            # End session
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with token
GET    /api/auth/verify-email      # Verify email with token
```

#### User Endpoints

```
GET    /api/users/me               # Get current user profile
PUT    /api/users/me               # Update user profile
DELETE /api/users/me               # Delete account
```

#### Resume Endpoints

```
GET    /api/resumes                # List user's resumes
POST   /api/resumes                # Create new resume
GET    /api/resumes/:id            # Get resume by ID
PUT    /api/resumes/:id            # Update resume
DELETE /api/resumes/:id            # Delete resume
POST   /api/resumes/:id/duplicate  # Duplicate resume
PUT    /api/resumes/:id/visibility # Toggle public/private
POST   /api/resumes/upload-pdf     # Upload PDF for auto-fill
GET    /api/resumes/:id/download   # Download resume as PDF
```

#### Resume Section Endpoints

```
POST   /api/resumes/:id/experiences    # Add experience
PUT    /api/resumes/:id/experiences/:expId  # Update experience
DELETE /api/resumes/:id/experiences/:expId  # Delete experience

POST   /api/resumes/:id/education      # Add education
PUT    /api/resumes/:id/education/:eduId    # Update education
DELETE /api/resumes/:id/education/:eduId    # Delete education

POST   /api/resumes/:id/projects       # Add project
PUT    /api/resumes/:id/projects/:projId   # Update project
DELETE /api/resumes/:id/projects/:projId   # Delete project

POST   /api/resumes/:id/skills         # Add skill
PUT    /api/resumes/:id/skills/:skillId    # Update skill
DELETE /api/resumes/:id/skills/:skillId    # Delete skill
```

#### AI Enhancement Endpoints

```
POST   /api/ai/enhance-summary         # Enhance professional summary
POST   /api/ai/enhance-experience      # Enhance experience description
```

#### Public Endpoints (No Auth Required)

```
GET    /api/public/resumes/:publicId   # View public resume
```

#### Image Upload Endpoints

```
POST   /api/images/upload              # Upload profile photo to ImageKit
DELETE /api/images/:imageId            # Delete image from ImageKit
```

### 5.7 Third-Party Integrations

#### ImageKit Integration

- **Purpose**: Image hosting, optimization, and background removal
- **Implementation**:
  - Use ImageKit Upload API or SDK
  - Store API keys in environment variables
  - Apply transformations via URL parameters
  - Background removal: `tr=bg-transparent`
- **Security**: Signed URLs for authenticated uploads

#### Google Gemini AI Integration

- **Purpose**: Content enhancement (summary and experience descriptions)
- **Implementation**:
  - Use OpenAI-compatible interface for Gemini API
  - Create `aiService.js` in services layer
  - Handle requests with streaming option disabled initially
  - Include retry logic for failures
- **Configuration**:
  - API endpoint: Configured in environment
  - Model: `gemini-pro` or equivalent
  - Max tokens: 500-1000 per request
  - Temperature: 0.7 (balanced creativity/consistency)
- **Security**: API key server-side only, rate limiting

#### Email Service Integration (Optional for MVP)

- **Purpose**: Email verification, password reset, notifications
- **Options**: SendGrid, AWS SES, Mailgun
- **Templates**: Transactional email templates for auth flows

---

## 6. Core User Flows

### Flow 1: New User Registration & First Resume Creation

```
1. User visits landing page
2. User clicks "Sign Up"
3. User enters email and password
4. System validates input and creates account
5. System sends verification email (optional)
6. User logs in automatically or manually
7. User lands on empty dashboard with "Create Resume" CTA
8. User clicks "Create New Resume"
9. System creates blank resume and opens builder
10. User fills in personal information
11. User adds work experience
12. User clicks "AI Enhance" on experience description
13. System sends request to AI service
14. AI returns enhanced version
15. User reviews and accepts enhancement
16. User adds education and skills
17. User selects template and color theme
18. User previews resume
19. User clicks "Download PDF"
20. System generates PDF and initiates download
```

### Flow 2: Upload PDF Resume

```
1. Authenticated user on dashboard
2. User clicks "Upload Resume" or "Import from PDF"
3. User selects PDF file from computer
4. System uploads and validates file (size, type)
5. System displays progress indicator
6. Backend extracts text from PDF
7. Backend parses and maps fields to resume structure
8. System creates new resume with extracted data
9. User sees pre-filled resume in builder
10. User reviews data for accuracy
11. User corrects any extraction errors
12. User enhances content with AI
13. User customizes design
14. User saves or downloads
```

### Flow 3: Share Resume Publicly

```
1. User opens existing resume in builder
2. User toggles "Public Visibility" switch to ON
3. System generates unique public ID (UUID)
4. System saves resume as public
5. System displays shareable link with "Copy" button
6. User clicks "Copy Link"
7. System copies link to clipboard and shows confirmation
8. User shares link via email, LinkedIn, etc.
9. Recipient clicks link
10. System verifies public status and loads resume
11. Recipient views read-only resume with download option
12. System increments view count (optional analytics)
```

### Flow 4: Edit Existing Resume

```
1. User on dashboard
2. User clicks on resume thumbnail or "Edit" button
3. System loads resume data and opens builder
4. User navigates between sections using tabs/sidebar
5. User makes changes to content
6. System auto-saves every 30 seconds
7. User changes template
8. System updates preview in real-time
9. User adjusts accent color
10. System updates preview
11. User satisfied with changes
12. Changes already saved via auto-save
13. User exits builder or downloads PDF
```

### Flow 5: AI Enhancement Interaction

```
1. User in resume builder, focusing on Professional Summary
2. User types initial draft: "I am a software engineer with experience."
3. User clicks "AI Enhance" button
4. System disables input and shows loading spinner
5. Frontend sends request to /api/ai/enhance-summary
6. Backend validates request and user authentication
7. Backend calls aiService.enhanceSummary()
8. aiService sends prompt to Google Gemini API
9. Gemini processes and returns enhanced text
10. Backend receives response and sends to frontend
11. Frontend displays enhanced version side-by-side with original
12. User compares versions
13. User clicks "Accept"
14. System replaces original with enhanced version
15. User continues editing or moves to next section
```

---

## 7. Success Metrics & KPIs

### User Acquisition

- **New user registrations per month**
- **Conversion rate**: Landing page visits → Sign-ups
- **Activation rate**: Sign-ups → First resume created

### User Engagement

- **Average resumes per user**
- **AI enhancement usage rate**: % of users who use AI feature
- **Session duration**: Average time spent in builder
- **Return user rate**: Users who return within 7/30 days

### Feature Adoption

- **PDF upload usage**: % of resumes created via PDF import
- **Public resume sharing**: % of resumes made public
- **Template diversity**: Distribution of template selections
- **PDF download rate**: Resumes downloaded vs. created

### Quality & Performance

- **AI enhancement satisfaction**: Accept rate of AI suggestions
- **PDF generation success rate**: % of successful PDF exports
- **Page load time**: Average time to interactive
- **Error rate**: API errors per 1000 requests

### Retention & Growth

- **Weekly/Monthly Active Users (WAU/MAU)**
- **Churn rate**: Users who don't return after 30 days
- **Referral rate**: New users from shared public resumes (tracked via referral parameter)

---

## 8. Development Roadmap

### Phase 1: Foundation (MVP)

**Goal**: Deliver core functionality for creating and downloading a basic resume

#### Milestone 1.1: Authentication & Infrastructure (Week 1-2)

- Set up project structure (frontend + backend)
- Implement user registration and login
- Configure database and ORM models
- Set up environment variables and secrets management
- Implement basic error handling and logging
- Deploy staging environment

#### Milestone 1.2: Basic Resume Builder (Week 3-4)

- Create dashboard UI (list resumes, create new)
- Build resume builder interface (single-page or tabbed)
- Implement Personal Info section
- Implement Professional Summary section (text input only, no AI yet)
- Implement Work Experience section (CRUD operations)
- Implement Education section (CRUD operations)
- Implement Skills section (CRUD operations)
- Basic form validation

#### Milestone 1.3: PDF Generation (Week 5)

- Design and implement at least 1 resume template
- Integrate PDF generation library (Puppeteer or PDFKit)
- Create PDF generation endpoint
- Implement "Download PDF" functionality
- Test PDF output across different data scenarios

#### Milestone 1.4: Testing & Bug Fixes (Week 6)

- End-to-end testing of MVP features
- Fix critical bugs
- Performance optimization
- Security review (authentication, input validation)

**MVP Deliverables**:

- User registration and login
- Dashboard with resume management
- Resume builder with all core sections
- 1 professional template
- PDF download
- Responsive design (desktop + mobile)

---

### Phase 2: AI Enhancement & Advanced Features

**Goal**: Add AI capabilities and improve user experience

#### Milestone 2.1: AI Integration (Week 7-8)

- Set up Google Gemini API integration
- Implement aiService for backend
- Create AI enhancement endpoints
- Add "AI Enhance" buttons to Summary and Experience sections
- Implement loading states and error handling for AI requests
- Test AI prompt engineering for quality output
- Implement rate limiting for AI endpoints

#### Milestone 2.2: Image Upload & Profile Photos (Week 9)

- Integrate ImageKit for image hosting
- Implement profile photo upload UI
- Add background removal toggle
- Image cropping/positioning interface
- Update resume templates to display profile photos

#### Milestone 2.3: Additional Templates & Customization (Week 10)

- Design and implement 2-3 additional resume templates
- Implement template selection UI with previews
- Add color theme picker
- Real-time preview updates
- Save template and color preferences

#### Milestone 2.4: Projects Section & Enhancements (Week 11)

- Implement Projects section (CRUD)
- Improve UX: drag-and-drop reordering
- Auto-save functionality
- Undo/redo capability
- Enhanced form validation with inline feedback

**Phase 2 Deliverables**:

- AI-powered content enhancement
- Profile photo upload with background removal
- 3-5 professional templates
- Color customization
- Projects section
- Improved UX (auto-save, reordering, better validation)

---

### Phase 3: PDF Import & Public Sharing

**Goal**: Enable resume import and public sharing capabilities

#### Milestone 3.1: PDF Upload & Parsing (Week 12-13)

- Implement PDF file upload UI
- Integrate PDF parsing library
- Build field extraction and mapping logic
- Create review/edit interface for imported data
- Handle various PDF formats and layouts
- Error handling for unparseable PDFs

#### Milestone 3.2: Public Resume Sharing (Week 14)

- Implement public/private visibility toggle
- Generate unique public IDs
- Create public resume view page (read-only)
- Implement shareable link with copy function
- Add SEO meta tags for public pages
- Optional: View count analytics

#### Milestone 3.3: Advanced PDF Export (Week 15)

- Improve PDF generation (fonts, formatting)
- Optimize for ATS compatibility
- Add metadata to exported PDFs
- Option to download from public view
- Performance optimization for large resumes

#### Milestone 3.4: Testing & Refinement (Week 16)

- Comprehensive testing of Phase 3 features
- User acceptance testing (UAT)
- Performance testing under load
- Security audit
- Bug fixes and polish

**Phase 3 Deliverables**:

- PDF resume upload and auto-fill
- Public resume sharing with unique links
- Improved PDF export quality
- View analytics (basic)

---

### Phase 4: Polish & Production Readiness

**Goal**: Prepare for production launch

#### Milestone 4.1: Security Hardening (Week 17)

- Comprehensive security review
- Implement all security headers
- Rate limiting on all endpoints
- Input sanitization review
- CSRF protection verification
- Penetration testing

#### Milestone 4.2: Performance Optimization (Week 18)

- Frontend performance optimization (code splitting, lazy loading)
- Backend query optimization
- CDN setup for static assets
- Caching strategy implementation
- Load testing and bottleneck identification

#### Milestone 4.3: Monitoring & Analytics (Week 19)

- Set up error tracking (Sentry)
- Implement logging infrastructure
- Set up performance monitoring
- Create admin dashboard for metrics
- User analytics integration (privacy-compliant)

#### Milestone 4.4: Documentation & Launch Prep (Week 20)

- API documentation
- User documentation/help center
- Developer onboarding guide
- Deployment runbooks
- Backup and recovery procedures
- Launch checklist

**Phase 4 Deliverables**:

- Production-ready security posture
- Optimized performance
- Monitoring and alerting
- Complete documentation
- Ready for public launch

---

### Future Enhancements (Post-Launch)

**Beyond MVP - Prioritize based on user feedback**

#### Enhancement Ideas:

1. **Social Login**: Google, LinkedIn authentication
2. **Resume Analytics**: Detailed view tracking, engagement metrics
3. **Cover Letter Generator**: AI-powered cover letter creation
4. **Resume Scoring**: ATS compatibility checker and suggestions
5. **Multiple Languages**: Internationalization (i18n)
6. **Collaboration**: Share resume for feedback/editing
7. **Version History**: Track and revert to previous versions
8. **Email Resume**: Send resume directly via email from platform
9. **Integrations**: Export to LinkedIn, Indeed, other job boards
10. **Premium Templates**: Paid template marketplace
11. **Career Resources**: Blog, tips, industry-specific advice
12. **Mobile App**: Native iOS/Android applications
13. **Video Resume**: Record and attach video introduction
14. **Skill Endorsements**: Import LinkedIn endorsements
15. **Interview Prep**: AI-generated interview questions based on resume

---

## 9. Logical Dependency Chain

### Development Order (Dependency-Based)

#### Foundation (Must Come First)

1. **Project Setup & Infrastructure**

   - Initialize repositories (frontend/backend)
   - Configure build tools and linters
   - Set up development environment
   - Configure database connection
   - Establish folder structure

2. **Authentication System**

   - User registration and login must exist before any user-specific features
   - Session/token management
   - Middleware for protected routes
   - _Dependency_: All subsequent features require authentication

3. **Database Models**
   - Define User, Resume, and related models
   - Run initial migrations
   - _Dependency_: CRUD operations need models defined first

#### Core Resume Functionality (MVP Critical Path)

4. **Dashboard**

   - List user's resumes
   - Create new resume button
   - _Dependencies_: Authentication (2), Resume model (3)
   - _Why Early_: User's first touchpoint after login; needed to access builder

5. **Resume Builder - Basic Structure**

   - Single-page builder interface
   - Navigation between sections
   - Form state management
   - Save/update functionality
   - _Dependencies_: Dashboard (4), Resume model (3)
   - _Why Early_: Foundation for all resume sections

6. **Personal Information Section**

   - Form inputs for contact details
   - Validation
   - _Dependencies_: Resume builder structure (5)
   - _Why Early_: Simplest section, minimal logic; good starting point

7. **Professional Summary Section**

   - Text area input
   - Character count
   - _Dependencies_: Resume builder structure (5)
   - _Why Early_: Required for AI enhancement testing later

8. **Work Experience Section**

   - CRUD operations for multiple experiences
   - Date pickers
   - "Current position" checkbox
   - _Dependencies_: Resume builder structure (5), Experience model (3)
   - _Why Early_: Core resume content; needed for AI enhancement

9. **Education & Skills Sections**

   - Similar CRUD patterns as Experience
   - _Dependencies_: Resume builder structure (5), Models (3)
   - _Why Early_: Complete basic resume content

10. **First Resume Template**

    - Design one professional template
    - Render resume data in template
    - Responsive layout
    - _Dependencies_: All resume sections (6-9)
    - _Why Early_: Needed for preview and PDF generation

11. **PDF Generation**
    - Integrate PDF library
    - Render template as PDF
    - Download endpoint
    - _Dependencies_: Template (10), All resume data (6-9)
    - _Why Critical_: MVP cannot launch without PDF export

#### Getting to Visible, Usable MVP

**At this point, we have a working product:**

- Users can register, log in
- Create resume with all basic sections
- Preview resume in one template
- Download as PDF

**Why This Order**:

- Establishes foundation before building features
- Each step builds upon previous (dependencies clear)
- Reaches usable state quickly (11 milestones)
- Users can create and export a resume (core value proposition)

---

#### Enhancing Value (Phase 2)

12. **AI Service Integration**

    - Backend aiService.js
    - Integration with Google Gemini
    - _Dependencies_: None (standalone service)
    - _Why Next_: Adds significant value; independent of other features

13. **AI Enhancement UI**

    - "AI Enhance" buttons on Summary and Experience
    - Loading states
    - Accept/reject flow
    - _Dependencies_: AI service (12), Summary/Experience sections (7-8)
    - _Why Next_: Differentiator; leverages existing sections

14. **Image Upload (ImageKit)**

    - Profile photo upload
    - Background removal toggle
    - _Dependencies_: Personal Info section (6), ImageKit account
    - _Why Next_: Visual enhancement; independent of other features

15. **Additional Templates**

    - Design 2-3 more templates
    - Template selection UI
    - _Dependencies_: First template (10) as pattern
    - _Why Next_: Increases customization options; parallel work to AI

16. **Color Customization**

    - Color picker
    - Apply accent colors to templates
    - _Dependencies_: Templates (10, 15)
    - _Why Next_: Further customization; enhances templates

17. **Projects Section**

    - CRUD for projects
    - Add to templates
    - _Dependencies_: Resume builder (5), Template updates (10)
    - _Why Next_: Rounds out resume content; not critical for MVP

18. **UX Improvements**
    - Auto-save
    - Drag-and-drop reordering
    - Undo/redo
    - _Dependencies_: Working builder (5-9)
    - _Why Next_: Improves usability; polish on existing features

---

#### Expanding Capabilities (Phase 3)

19. **PDF Upload & Parsing**

    - File upload UI
    - PDF text extraction
    - Field mapping logic
    - _Dependencies_: Resume builder (5), All sections (6-9)
    - _Why Later_: Complex feature; app already functional without it

20. **Public Resume Feature**

    - Public/private toggle
    - Public ID generation
    - Public view page
    - _Dependencies_: Templates (10), All resume data
    - _Why Later_: Sharing feature; not required for core functionality

21. **Download from Public View**
    - PDF generation for public resumes
    - _Dependencies_: Public feature (20), PDF generation (11)
    - _Why Later_: Extension of public feature

---

#### Production Readiness (Phase 4)

22. **Security Hardening**

    - Security headers
    - Rate limiting
    - Input sanitization review
    - _Dependencies_: All features complete
    - _Why Last_: Applied across entire application

23. **Performance Optimization**

    - Code splitting
    - Caching
    - Query optimization
    - _Dependencies_: All features complete
    - _Why Last_: Optimize once features are stable

24. **Monitoring & Analytics**
    - Error tracking
    - Performance monitoring
    - _Dependencies_: Deployed application
    - _Why Last_: Needed for production, not development

---

### Atomic Feature Scoping

Each feature above is designed to be:

- **Atomic**: Can be developed and tested independently
- **Buildable**: Has clear inputs, outputs, and acceptance criteria
- **Improvable**: Can be enhanced in future iterations without blocking other features

**Example - Work Experience Section**:

- **Phase 1**: Basic CRUD (add, edit, delete, list)
- **Phase 2**: AI enhancement per entry
- **Phase 3**: Drag-and-drop reordering
- **Future**: Import from LinkedIn, skill extraction

---

## 10. Risks & Mitigations

### Technical Risks

#### RISK-001: AI Service Reliability

- **Risk**: Google Gemini API downtime or rate limits affecting user experience
- **Impact**: High - Core differentiating feature unavailable
- **Mitigation**:
  - Implement graceful degradation (manual editing still works)
  - Add retry logic with exponential backoff
  - Set up monitoring and alerts for AI service failures
  - Consider fallback AI provider (OpenAI GPT) for redundancy
  - Clearly communicate when AI is unavailable

#### RISK-002: PDF Generation Complexity

- **Risk**: Generating pixel-perfect PDFs that match preview across all templates and data scenarios
- **Impact**: Medium - Poor PDF quality damages trust
- **Mitigation**:
  - Use proven PDF library (Puppeteer recommended for HTML-to-PDF)
  - Extensive testing with various data combinations
  - Allow users to preview before downloading
  - Implement feedback mechanism for PDF issues
  - Iterate based on user reports

#### RISK-003: PDF Parsing Accuracy

- **Risk**: Uploaded PDF resumes may not parse correctly, leading to poor auto-fill experience
- **Impact**: Medium - Feature becomes unreliable, low adoption
- **Mitigation**:
  - Set realistic expectations (inform users parsing may not be perfect)
  - Provide clear review/edit step after import
  - Test with diverse PDF formats
  - Consider gradual rollout with user feedback
  - Document limitations clearly

#### RISK-004: Scalability Bottlenecks

- **Risk**: AI calls and PDF generation are resource-intensive; may not scale well
- **Impact**: High - Slow performance, increased costs
- **Mitigation**:
  - Implement queue system for long-running tasks (BullMQ, RabbitMQ)
  - Add caching where appropriate (generated PDFs if resume unchanged)
  - Horizontal scaling for backend services
  - Monitor resource usage and optimize queries
  - Set up auto-scaling in production

### Security Risks

#### RISK-005: Data Breach

- **Risk**: User data (personal info, resumes) compromised
- **Impact**: Critical - Legal liability, reputation damage
- **Mitigation**:
  - Follow security best practices (see Section 4.2)
  - Regular security audits and penetration testing
  - Encrypt sensitive data at rest and in transit
  - Implement comprehensive logging for audit trails
  - Have incident response plan ready

#### RISK-006: API Key Exposure

- **Risk**: Third-party API keys (ImageKit, Gemini) accidentally exposed
- **Impact**: High - Unauthorized usage, financial cost, service disruption
- **Mitigation**:
  - Never commit API keys to version control
  - Use environment variables and secrets management
  - Implement server-side API proxy (no keys in frontend)
  - Rotate keys regularly
  - Set up usage alerts and budgets

#### RISK-007: Malicious File Uploads

- **Risk**: Users upload malicious files disguised as PDFs or images
- **Impact**: Medium - Server compromise, data breach
- **Mitigation**:
  - Validate file types and sizes on both frontend and backend
  - Scan uploads for malware
  - Store uploads in isolated, sandboxed environment
  - Implement strict access controls
  - Use third-party services (ImageKit) that handle security

### Product & Business Risks

#### RISK-008: Figuring Out the MVP

- **Risk**: Building too many features initially, delaying launch
- **Impact**: Medium - Wasted development time, delayed market feedback
- **Mitigation**:
  - Strictly adhere to Phase 1 roadmap (MVP only)
  - Resist feature creep during development
  - Launch with core functionality (auth, builder, 1 template, PDF download)
  - Gather user feedback before adding more features
  - Use analytics to prioritize future enhancements

#### RISK-009: AI Content Quality

- **Risk**: AI-generated enhancements are low quality or inappropriate
- **Impact**: Medium - Users don't trust feature, low adoption
- **Mitigation**:
  - Extensive prompt engineering and testing
  - Show original alongside AI version (user has control)
  - Allow users to regenerate if unsatisfied
  - Collect feedback on AI suggestions
  - Continuously refine prompts based on feedback
  - Implement content moderation checks

#### RISK-010: Competitive Landscape

- **Risk**: Existing resume builders (Canva, Zety, Resume.io) have established user bases
- **Impact**: High - Difficulty acquiring users
- **Mitigation**:
  - Focus on unique value proposition (AI enhancement, simplicity)
  - Target specific niches initially (tech professionals, recent grads)
  - Offer free tier to lower barrier to entry
  - Build virality through public resume sharing
  - Iterate quickly based on user feedback

### Resource Risks

#### RISK-011: Timeline Slippage

- **Risk**: Development takes longer than estimated 20 weeks
- **Impact**: Medium - Delayed launch, increased costs
- **Mitigation**:
  - Build in buffer time (estimate 20 weeks, plan for 24)
  - Regular progress reviews and adjustments
  - Descope non-critical features if needed
  - Prioritize MVP ruthlessly
  - Consider additional development resources if budget allows

#### RISK-012: Third-Party Service Changes

- **Risk**: ImageKit or Google Gemini changes pricing, features, or shuts down
- **Impact**: Medium - Feature disruption, cost increase
- **Mitigation**:
  - Monitor service announcements and roadmaps
  - Design with abstraction layer (swap services if needed)
  - Have backup provider options identified
  - Negotiate contracts with clear SLAs
  - Budget for potential cost increases

---

## 11. Assumptions

### Technical Assumptions

1. **Tech Stack**: React + Express architecture is confirmed (unless Next.js alternative is chosen)
2. **Hosting**: Application will be deployed on cloud infrastructure (AWS, Heroku, or Vercel)
3. **Database**: Relational database (PostgreSQL recommended) is suitable for the data model
4. **AI Integration**: Google Gemini API will be accessible via OpenAI-compatible interface
5. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
6. **Internet Connection**: Users have stable internet for real-time features

### User Assumptions

1. **Target Audience**: English-speaking users (initial launch); internationalization later
2. **Technical Proficiency**: Users comfortable with web applications (basic digital literacy)
3. **Use Case**: Primary use is job applications (not academic CVs or other resume types initially)
4. **Device**: Majority of users on desktop/laptop for creation; mobile for viewing
5. **PDF Uploads**: Users have access to digital PDF resumes for import feature

### Business Assumptions

1. **Freemium Model**: MVP will be free to use; monetization strategy defined post-launch
2. **User Acquisition**: Organic growth through SEO and public resume sharing (viral component)
3. **Development Team**: Small team (1-3 developers) with full-stack capabilities
4. **Timeline**: 20-week development timeline is realistic for team size and feature scope
5. **Budget**: Sufficient budget for third-party services (ImageKit, Gemini API, hosting)

### Design Assumptions

1. **Templates**: 1 template for MVP is sufficient; more based on user demand
2. **Mobile Responsiveness**: Mobile experience is secondary to desktop (builder primarily desktop-focused)
3. **Accessibility**: WCAG AA compliance is achievable within timeline
4. **UX Patterns**: Standard web application patterns (no unconventional UI)

### Compliance & Legal Assumptions

1. **Data Privacy**: GDPR/CCPA compliance will be addressed (privacy policy, data handling)
2. **Terms of Service**: Standard ToS and privacy policy in place before launch
3. **Content Ownership**: Users retain ownership of their resume content
4. **AI Content**: AI-generated content does not violate copyright (using licensed API)

### Clarification Questions

Before proceeding, the following should be confirmed:

1. **Architecture**: Confirm React+Express vs. Next.js+Supabase approach?
2. **Authentication**: Email/password only for MVP, or include social logins?
3. **Monetization**: Is freemium confirmed, or paid from the start?
4. **Region**: Launching globally or specific regions first (affects legal/compliance)?
5. **Team**: How many developers, and do we have design resources?
6. **Timeline Flexibility**: Is 20-week timeline fixed or adjustable?
7. **AI Provider**: Is Google Gemini confirmed, or open to alternatives (OpenAI, Anthropic)?
8. **Budget**: Any constraints on third-party service costs?

---

## 12. Appendix

### A. Research Findings

#### Market Research

- **Resume Builder Market Size**: Growing segment within HR Tech (~$2B globally)
- **Competitors**: Canva Resume Builder, Zety, Resume.io, Novoresume, VisualCV
- **Differentiators**: AI enhancement is relatively new; few competitors offer seamless PDF import
- **User Pain Points** (from reviews):
  - Difficult to import existing resumes
  - Limited free features
  - Templates look too similar across users
  - Poor ATS compatibility

#### AI Capabilities Research

- **Google Gemini Pro**: Suitable for text enhancement; good balance of cost/quality
- **Prompt Engineering**: Requires context (current text, job role) for best results
- **Latency**: Expect 2-8 seconds per AI request (plan UX accordingly)
- **Cost**: Monitor usage; cost per request varies with input/output length

#### PDF Generation Research

- **Puppeteer**: Best for HTML-to-PDF; renders exactly like browser
- **Pros**: High fidelity, supports complex CSS
- **Cons**: Resource-intensive, requires headless Chrome
- **Alternative**: PDFKit for programmatic PDF creation (more control, steeper learning curve)

### B. Technical Specifications

#### Security Headers Configuration

```javascript
// Express middleware example
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://ik.imagekit.io"],
        connectSrc: ["'self'", "https://api.gemini.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

#### Rate Limiting Configuration

```javascript
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window
  message: "Too many login attempts, please try again later.",
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 AI requests per minute
  message: "Too many AI requests, please slow down.",
});

app.use("/api/auth/login", authLimiter);
app.use("/api/ai/", aiLimiter);
```

#### Environment Variables Template

```bash
# .env.example

# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/resume_builder
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resume_builder
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Email Service (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourapp.com

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### C. UI/UX Wireframes (Descriptions)

**Note**: Detailed visual wireframes should be created by design team. Below are high-level descriptions.

#### Dashboard

- Header: Logo, user menu (profile, logout)
- Hero section: "My Resumes" heading, "Create New" button
- Grid layout: Resume cards (thumbnail, title, last edited, public/private badge, actions)
- Empty state: Illustration + "Create your first resume" CTA

#### Resume Builder

- Sidebar: Section navigation (Personal Info, Summary, Experience, Education, Projects, Skills)
- Main area: Active section form
- Right panel: Live preview (collapsible)
- Top bar: Resume title (editable), Save status, Template selector, Download button

#### AI Enhancement Modal

- Split view: Original text (left) vs. Enhanced text (right)
- Actions: Accept, Reject, Try Again
- Loading state: Spinner with "Enhancing with AI..."

#### Public Resume View

- Clean, distraction-free layout
- Resume rendered in selected template
- Minimal header: Logo only
- Footer: "Create your own resume" CTA (acquisition loop)

### D. Glossary

- **ATS**: Applicant Tracking System - Software used by employers to filter resumes
- **CSRF**: Cross-Site Request Forgery - Security attack where unauthorized commands are transmitted from a trusted user
- **JWT**: JSON Web Token - Compact, URL-safe means of representing claims between two parties
- **ORM**: Object-Relational Mapping - Technique for converting data between incompatible type systems
- **SPA**: Single Page Application - Web app that loads a single HTML page and dynamically updates content
- **UUID**: Universally Unique Identifier - 128-bit label used for identification

### E. References

1. **Security Best Practices**: See `docs/tech/Security_BestPractices.md`
2. **Next.js Documentation**: See `docs/tech/NextJS_AppDirectory.md`
3. **OpenAI Streaming**: See `docs/tech/OpenAI_StreamText.md`
4. **ImageKit API**: See `docs/tech/OpenAI_ImageGeneration.md`
5. **Supabase Integration**: See `docs/tech/Supabase_NextJS.md`, `Supabase_EdgeFunctions.md`

---

## Document Sign-Off

This PRD represents a comprehensive specification for the AI Resume Builder application. It should be reviewed and approved by stakeholders before development commences.

**Next Steps**:

1. Review PRD with stakeholders
2. Address clarification questions (Section 11)
3. Finalize technology stack decisions
4. Create detailed sprint plans based on roadmap
5. Begin Phase 1: Foundation development

---

_End of Product Requirements Document_
