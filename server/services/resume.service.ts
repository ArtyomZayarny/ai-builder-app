/**
 * Resume Service
 * Handles database operations for resumes
 */

import pool from '../db/connection.js';
import { NotFoundError } from '../utils/errors.js';
import type { ResumeCreate, ResumeUpdate, ResumeCreateWithData } from '@resume-builder/shared';

interface ResumeRow {
  id: number;
  title: string;
  template: string;
  accent_color: string;
  is_public: boolean;
  public_id: string;
  created_at: string;
  updated_at: string;
}

class ResumeService {
  /**
   * Get all resumes
   */
  async getAllResumes(): Promise<ResumeRow[]> {
    const result = await pool.query<ResumeRow>(
      `SELECT id, title, template, accent_color, is_public, public_id, created_at, updated_at 
       FROM resumes 
       ORDER BY updated_at DESC`
    );
    return result.rows;
  }

  /**
   * Get resume by ID (basic info only)
   */
  async getResumeById(id: number | string): Promise<ResumeRow> {
    const result = await pool.query<ResumeRow>(
      `SELECT id, title, template, accent_color, is_public, public_id, created_at, updated_at 
       FROM resumes 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Resume');
    }

    return result.rows[0];
  }

  /**
   * Create new resume
   */
  async createResume(data: ResumeCreate): Promise<ResumeRow> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create resume
      const resumeResult = await client.query<ResumeRow>(
        `INSERT INTO resumes (title, template, accent_color) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [data.title, data.template || 'classic', data.accentColor || '#3B82F6']
      );

      const resume = resumeResult.rows[0];

      // Create empty personal info and summary for new resume
      await client.query(
        `INSERT INTO personal_info (resume_id, name, role, email) 
         VALUES ($1, $2, $3, $4)`,
        [resume.id, '', '', '']
      );

      await client.query(
        `INSERT INTO summaries (resume_id, content) 
         VALUES ($1, $2)`,
        [resume.id, '']
      );

      await client.query('COMMIT');
      return resume;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create resume with all data at once (for PDF import)
   * Uses transaction to ensure atomicity
   */
  async createResumeWithData(data: ResumeCreateWithData): Promise<ResumeRow> {
    console.log('🔧 [Service] Starting createResumeWithData');
    console.log('🔧 [Service] Resume title:', data.title);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('✅ [Service] Transaction started');

      // 1. Create resume
      const resumeResult = await client.query<ResumeRow>(
        `INSERT INTO resumes (title, template, accent_color) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [data.title, data.template || 'classic', data.accentColor || '#3B82F6']
      );

      const resume = resumeResult.rows[0];
      const resumeId = resume.id;
      console.log('✅ [Service] Resume created with ID:', resumeId);

      // 2. Create personal info
      await client.query(
        `INSERT INTO personal_info (resume_id, name, role, email, phone, location, linkedin_url, portfolio_url, photo_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          resumeId,
          data.personalInfo.name,
          data.personalInfo.role,
          data.personalInfo.email,
          data.personalInfo.phone || null,
          data.personalInfo.location || null,
          data.personalInfo.linkedinUrl || null,
          data.personalInfo.portfolioUrl || null,
          data.personalInfo.photoUrl || null,
        ]
      );

      // 3. Create summary (if provided)
      if (data.summary?.content) {
        await client.query(
          `INSERT INTO summaries (resume_id, content) 
           VALUES ($1, $2)`,
          [resumeId, data.summary.content]
        );
      } else {
        // Create empty summary
        await client.query(
          `INSERT INTO summaries (resume_id, content) 
           VALUES ($1, $2)`,
          [resumeId, '']
        );
      }

      // 4. Create experiences
      if (data.experiences && data.experiences.length > 0) {
        console.log(`💼 [Service] Creating ${data.experiences.length} experiences`);
        for (let i = 0; i < data.experiences.length; i++) {
          const exp = data.experiences[i];
          
          // Normalize dates: convert empty strings to null
          // Note: After migration 005, start_date can be NULL in DB
          let startDate: string | null = exp.startDate || null;
          let endDate: string | null = exp.endDate || null;
          
          if (startDate && (startDate === '' || startDate.trim() === '')) {
            console.log(`⚠️ [Service] Experience ${i + 1}: startDate is empty string, setting to null`);
            startDate = null;
          }
          
          if (endDate && (endDate === '' || endDate.trim() === '')) {
            console.log(`⚠️ [Service] Experience ${i + 1}: endDate is empty string, setting to null`);
            endDate = null;
          }
          
          console.log(`💼 [Service] Inserting experience ${i + 1}:`, {
            company: exp.company,
            role: exp.role,
            startDate: startDate,
            endDate: endDate,
            isCurrent: exp.isCurrent || false,
            startDateType: typeof startDate,
            endDateType: typeof endDate,
          });
          
          try {
            await client.query(
              `INSERT INTO experiences (resume_id, company, role, location, start_date, end_date, is_current, description, order_index)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                resumeId,
                exp.company || null,
                exp.role || null,
                exp.location || null,
                startDate,
                endDate,
                exp.isCurrent || false,
                exp.description || null,
                exp.order ?? i,
              ]
            );
            console.log(`✅ [Service] Experience ${i + 1} inserted successfully`);
          } catch (error) {
            console.error(`❌ [Service] Error inserting experience ${i + 1}:`, error);
            console.error(`❌ [Service] Experience data:`, JSON.stringify(exp, null, 2));
            throw error;
          }
        }
      }

      // 5. Create education
      if (data.education && data.education.length > 0) {
        console.log(`🎓 [Service] Creating ${data.education.length} education entries`);
        for (let i = 0; i < data.education.length; i++) {
          const edu = data.education[i];
          
          // Normalize dates: convert empty strings to null
          // Note: graduationDate can be NULL in DB
          let graduationDate: string | null = edu.graduationDate || null;
          
          if (graduationDate && (graduationDate === '' || graduationDate.trim() === '')) {
            console.log(`⚠️ [Service] Education ${i + 1}: graduationDate is empty string, converting to null`);
            graduationDate = null;
          }
          
          console.log(`🎓 [Service] Inserting education ${i + 1}:`, {
            institution: edu.institution,
            degree: edu.degree,
            graduationDate: graduationDate,
            graduationDateType: typeof graduationDate,
          });
          
          try {
            await client.query(
              `INSERT INTO education (resume_id, institution, degree, field, location, graduation_date, gpa, description, order_index)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                resumeId,
                edu.institution,
                edu.degree,
                edu.field || null,
                edu.location || null,
                graduationDate,
                edu.gpa || null,
                edu.description || null,
                edu.order ?? i,
              ]
            );
            console.log(`✅ [Service] Education ${i + 1} inserted successfully`);
          } catch (error) {
            console.error(`❌ [Service] Error inserting education ${i + 1}:`, error);
            console.error(`❌ [Service] Education data:`, JSON.stringify(edu, null, 2));
            throw error;
          }
        }
      }

      // 6. Create projects
      if (data.projects && data.projects.length > 0) {
        for (let i = 0; i < data.projects.length; i++) {
          const project = data.projects[i];
          await client.query(
            `INSERT INTO projects (resume_id, name, description, technologies, url, date, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              resumeId,
              project.name,
              project.description || null,
              project.technologies || [],
              project.url || null,
              project.date || null,
              project.order ?? i,
            ]
          );
        }
      }

      // 7. Create skills
      if (data.skills && data.skills.length > 0) {
        console.log(`🛠️ [Service] Creating ${data.skills.length} skills`);
        for (let i = 0; i < data.skills.length; i++) {
          const skill = data.skills[i];
          await client.query(
            `INSERT INTO skills (resume_id, name, category, order_index)
             VALUES ($1, $2, $3, $4)`,
            [
              resumeId,
              skill.name,
              skill.category || null,
              skill.order ?? i,
            ]
          );
        }
        console.log(`✅ [Service] All skills inserted successfully`);
      }

      await client.query('COMMIT');
      console.log('✅ [Service] Transaction committed successfully');
      return resume;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ [Service] Transaction rolled back due to error:', error);
      if (error instanceof Error) {
        console.error('❌ [Service] Error message:', error.message);
        console.error('❌ [Service] Error stack:', error.stack);
      }
      throw error;
    } finally {
      client.release();
      console.log('🔓 [Service] Database client released');
    }
  }

  /**
   * Update resume
   */
  async updateResume(id: number | string, data: ResumeUpdate): Promise<ResumeRow> {
    const result = await pool.query<ResumeRow>(
      `UPDATE resumes 
       SET title = COALESCE($1, title),
           template = COALESCE($2, template),
           accent_color = COALESCE($3, accent_color),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [data.title, data.template, data.accentColor, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Resume');
    }

    return result.rows[0];
  }

  /**
   * Delete resume
   */
  async deleteResume(id: number | string): Promise<{ id: number }> {
    const result = await pool.query<{ id: number }>(
      `DELETE FROM resumes WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Resume');
    }

    return result.rows[0];
  }

  /**
   * Get Personal Info
   */
  async getPersonalInfo(resumeId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `SELECT * FROM personal_info 
       WHERE resume_id = $1`,
      [resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Personal Info');
    }

    return result.rows[0];
  }

  /**
   * Update Personal Info
   */
  async updatePersonalInfo(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    // Handle photoUrl: if explicitly provided (even empty string), use it; otherwise keep existing
    // Important: empty string should clear the photo, undefined should keep existing
    const photoUrlProvided = data.photoUrl !== undefined;
    // If provided, use the value (empty string becomes null for DB)
    // If not provided, we'll skip updating this field
    const photoUrlValue = photoUrlProvided ? data.photoUrl || null : null;

    // Build SQL conditionally: only update photo_url if it was provided
    let sql = `UPDATE personal_info 
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           location = COALESCE($5, location),
           linkedin_url = COALESCE($6, linkedin_url),
           portfolio_url = COALESCE($7, portfolio_url)`;

    const params: any[] = [
      data.name,
      data.role,
      data.email,
      data.phone || null,
      data.location || null,
      data.linkedinUrl || null,
      data.portfolioUrl || null,
    ];

    if (photoUrlProvided) {
      sql += `, photo_url = $8`;
      params.push(photoUrlValue);
      sql += ` WHERE resume_id = $9 RETURNING *`;
      params.push(resumeId);
    } else {
      sql += ` WHERE resume_id = $8 RETURNING *`;
      params.push(resumeId);
    }

    const result = await pool.query(sql, params);

    if (result.rows.length === 0) {
      throw new NotFoundError('Personal Info');
    }

    // Also update resume title when name changes (to keep dashboard in sync)
    if (data.name) {
      await pool.query(
        `UPDATE resumes 
         SET title = $1 || '''s Resume',
             updated_at = NOW()
         WHERE id = $2`,
        [data.name, resumeId]
      );
    }

    return result.rows[0];
  }

  /**
   * Get Summary
   */
  async getSummary(resumeId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `SELECT * FROM summaries 
       WHERE resume_id = $1`,
      [resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Summary');
    }

    return result.rows[0];
  }

  /**
   * Update Summary
   */
  async updateSummary(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    console.log('💾 [Server] Updating summary for resume ID:', resumeId);
    console.log('📦 [Server] Summary content length:', data.content?.length || 0);

    const result = await pool.query(
      `UPDATE summaries 
       SET content = $1
       WHERE resume_id = $2 
       RETURNING *`,
      [data.content, resumeId]
    );

    console.log('✅ [Server] Summary updated successfully');

    if (result.rows.length === 0) {
      throw new NotFoundError('Summary');
    }

    return result.rows[0];
  }

  /**
   * Get all skills for a resume
   */
  async getSkills(resumeId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `SELECT * FROM skills 
       WHERE resume_id = $1 
       ORDER BY order_index ASC`,
      [resumeId]
    );

    return result.rows;
  }

  /**
   * Create new skill
   */
  async createSkill(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `INSERT INTO skills (resume_id, name, category, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [resumeId, data.name, data.category || null, data.order || 0]
    );

    return result.rows[0];
  }

  /**
   * Update skill
   */
  async updateSkill(resumeId: number | string, skillId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `UPDATE skills 
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           order_index = COALESCE($3, order_index)
       WHERE id = $4 AND resume_id = $5
       RETURNING *`,
      [data.name, data.category, data.order, skillId, resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Skill');
    }

    return result.rows[0];
  }

  /**
   * Delete skill
   */
  async deleteSkill(resumeId: number | string, skillId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `DELETE FROM skills 
       WHERE id = $1 AND resume_id = $2
       RETURNING id`,
      [skillId, resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Skill');
    }

    return result.rows[0];
  }

  /**
   * Get all education for a resume
   */
  async getEducation(resumeId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `SELECT * FROM education 
       WHERE resume_id = $1 
       ORDER BY order_index ASC`,
      [resumeId]
    );

    return result.rows;
  }

  /**
   * Create new education
   */
  async createEducation(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `INSERT INTO education (resume_id, institution, degree, field, location, graduation_date, gpa, description, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        resumeId,
        data.institution,
        data.degree,
        data.field || null,
        data.location || null,
        data.graduationDate || null,
        data.gpa || null,
        data.description || null,
        data.order || 0,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update education
   */
  async updateEducation(resumeId: number | string, eduId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `UPDATE education 
       SET institution = COALESCE($1, institution),
           degree = COALESCE($2, degree),
           field = COALESCE($3, field),
           location = COALESCE($4, location),
           graduation_date = COALESCE($5, graduation_date),
           gpa = COALESCE($6, gpa),
           description = COALESCE($7, description),
           order_index = COALESCE($8, order_index)
       WHERE id = $9 AND resume_id = $10
       RETURNING *`,
      [
        data.institution,
        data.degree,
        data.field,
        data.location,
        data.graduationDate,
        data.gpa,
        data.description,
        data.order,
        eduId,
        resumeId,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Education');
    }

    return result.rows[0];
  }

  /**
   * Delete education
   */
  async deleteEducation(resumeId: number | string, eduId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `DELETE FROM education 
       WHERE id = $1 AND resume_id = $2
       RETURNING id`,
      [eduId, resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Education');
    }

    return result.rows[0];
  }

  /**
   * Get all projects for a resume
   */
  async getProjects(resumeId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `SELECT * FROM projects 
       WHERE resume_id = $1 
       ORDER BY order_index ASC`,
      [resumeId]
    );

    return result.rows;
  }

  /**
   * Create new project
   */
  async createProject(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `INSERT INTO projects (resume_id, name, description, technologies, url, date, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        resumeId,
        data.name,
        data.description,
        data.technologies || [],
        data.url || null,
        data.date || null,
        data.order || 0,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update project
   */
  async updateProject(resumeId: number | string, projectId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           technologies = COALESCE($3, technologies),
           url = COALESCE($4, url),
           date = COALESCE($5, date),
           order_index = COALESCE($6, order_index)
       WHERE id = $7 AND resume_id = $8
       RETURNING *`,
      [
        data.name,
        data.description,
        data.technologies,
        data.url,
        data.date,
        data.order,
        projectId,
        resumeId,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Project');
    }

    return result.rows[0];
  }

  /**
   * Delete project
   */
  async deleteProject(resumeId: number | string, projectId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `DELETE FROM projects 
       WHERE id = $1 AND resume_id = $2
       RETURNING id`,
      [projectId, resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Project');
    }

    return result.rows[0];
  }

  /**
   * Get all experiences for a resume
   */
  async getExperiences(resumeId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `SELECT * FROM experiences 
       WHERE resume_id = $1 
       ORDER BY order_index ASC`,
      [resumeId]
    );

    return result.rows;
  }

  /**
   * Create new experience
   */
  async createExperience(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `INSERT INTO experiences (resume_id, company, role, location, start_date, end_date, is_current, description, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        resumeId,
        data.company,
        data.role,
        data.location || null,
        data.startDate,
        data.endDate || null,
        data.isCurrent || false,
        data.description,
        data.order || 0,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update experience
   */
  async updateExperience(resumeId: number | string, expId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `UPDATE experiences 
       SET company = COALESCE($1, company),
           role = COALESCE($2, role),
           location = COALESCE($3, location),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           is_current = COALESCE($6, is_current),
           description = COALESCE($7, description),
           order_index = COALESCE($8, order_index)
       WHERE id = $9 AND resume_id = $10
       RETURNING *`,
      [
        data.company,
        data.role,
        data.location,
        data.startDate,
        data.endDate,
        data.isCurrent,
        data.description,
        data.order,
        expId,
        resumeId,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Experience');
    }

    return result.rows[0];
  }

  /**
   * Delete experience
   */
  async deleteExperience(resumeId: number | string, expId: number | string) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `DELETE FROM experiences 
       WHERE id = $1 AND resume_id = $2
       RETURNING id`,
      [expId, resumeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Experience');
    }

    return result.rows[0];
  }

  /**
   * Toggle resume visibility (public/private)
   */
  async toggleVisibility(
    id: number | string,
    isPublic: boolean
  ): Promise<{ is_public: boolean; public_id: string }> {
    const result = await pool.query<{ is_public: boolean; public_id: string }>(
      `UPDATE resumes 
       SET is_public = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING is_public, public_id`,
      [isPublic, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Resume');
    }

    return result.rows[0];
  }

  /**
   * Get public resume by public_id (with all sections)
   */
  async getPublicResume(publicId: string): Promise<any> {
    // First, get the resume and check if it's public
    const resumeResult = await pool.query(
      `SELECT id, title, template, accent_color, is_public, created_at, updated_at 
       FROM resumes 
       WHERE public_id = $1 AND is_public = true`,
      [publicId]
    );

    if (resumeResult.rows.length === 0) {
      throw new NotFoundError('Public resume');
    }

    const resume = resumeResult.rows[0];

    // Get all sections for this resume
    const [personalInfo, summary, experiences, education, projects, skills] = await Promise.all([
      pool.query(`SELECT * FROM personal_info WHERE resume_id = $1`, [resume.id]),
      pool.query(`SELECT content FROM summaries WHERE resume_id = $1`, [resume.id]),
      pool.query(
        `SELECT * FROM experiences WHERE resume_id = $1 ORDER BY order_index, start_date DESC`,
        [resume.id]
      ),
      pool.query(
        `SELECT * FROM education WHERE resume_id = $1 ORDER BY order_index, graduation_date DESC`,
        [resume.id]
      ),
      pool.query(`SELECT * FROM projects WHERE resume_id = $1 ORDER BY order_index, date DESC`, [
        resume.id,
      ]),
      pool.query(`SELECT * FROM skills WHERE resume_id = $1 ORDER BY order_index, category`, [
        resume.id,
      ]),
    ]);

    return {
      ...resume,
      personalInfo: personalInfo.rows[0] || null,
      summary: summary.rows[0] || null,
      experiences: experiences.rows,
      education: education.rows,
      projects: projects.rows,
      skills: skills.rows,
    };
  }
}

export default new ResumeService();
