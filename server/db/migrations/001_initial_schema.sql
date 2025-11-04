-- AI Resume Builder - Initial Schema
-- Creates all tables for MVP (Demo Mode - no users yet)

-- 1. Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  template VARCHAR(50) DEFAULT 'classic',
  accent_color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Personal Info (1:1 with Resume)
CREATE TABLE IF NOT EXISTS personal_info (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin_url TEXT,
  portfolio_url TEXT,
  UNIQUE(resume_id)
);

-- 3. Summaries (1:1 with Resume)
CREATE TABLE IF NOT EXISTS summaries (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  UNIQUE(resume_id)
);

-- 4. Experiences (1:N with Resume)
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- 5. Education (1:N with Resume)
CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  location VARCHAR(255),
  graduation_date DATE,
  gpa VARCHAR(10),
  description TEXT,
  order_index INTEGER DEFAULT 0
);

-- 6. Projects (1:N with Resume)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[], -- PostgreSQL array
  url TEXT,
  date DATE,
  order_index INTEGER DEFAULT 0
);

-- 7. Skills (1:N with Resume)
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  order_index INTEGER DEFAULT 0
);

-- Create indexes for foreign keys (performance)
CREATE INDEX IF NOT EXISTS idx_personal_info_resume_id ON personal_info(resume_id);
CREATE INDEX IF NOT EXISTS idx_summaries_resume_id ON summaries(resume_id);
CREATE INDEX IF NOT EXISTS idx_experiences_resume_id ON experiences(resume_id);
CREATE INDEX IF NOT EXISTS idx_education_resume_id ON education(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON skills(resume_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
END $$;

