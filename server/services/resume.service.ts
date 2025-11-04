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
}

export default new ResumeService();

