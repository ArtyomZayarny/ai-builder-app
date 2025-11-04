/**
 * Resume Service
 * Handles database operations for resumes
 */

import pool from '../db/connection.js';
import { NotFoundError } from '../utils/errors.js';
import type { ResumeCreate, ResumeUpdate } from '@resume-builder/shared';

interface ResumeRow {
  id: number;
  title: string;
  template: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

class ResumeService {
  /**
   * Get all resumes
   */
  async getAllResumes(): Promise<ResumeRow[]> {
    const result = await pool.query<ResumeRow>(
      `SELECT id, title, template, accent_color, created_at, updated_at 
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
      `SELECT id, title, template, accent_color, created_at, updated_at 
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
   * Update Personal Info
   */
  async updatePersonalInfo(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `UPDATE personal_info 
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           location = COALESCE($5, location),
           linkedin_url = COALESCE($6, linkedin_url),
           portfolio_url = COALESCE($7, portfolio_url)
       WHERE resume_id = $8 
       RETURNING *`,
      [
        data.name,
        data.role,
        data.email,
        data.phone || null,
        data.location || null,
        data.linkedinUrl || null,
        data.portfolioUrl || null,
        resumeId,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Personal Info');
    }

    return result.rows[0];
  }

  /**
   * Update Summary
   */
  async updateSummary(resumeId: number | string, data: any) {
    // First check if resume exists
    await this.getResumeById(resumeId);

    const result = await pool.query(
      `UPDATE summaries 
       SET content = $1
       WHERE resume_id = $2 
       RETURNING *`,
      [data.content, resumeId]
    );

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
}

export default new ResumeService();

