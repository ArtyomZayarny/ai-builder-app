/**
 * Resume API Tests
 */

import request from 'supertest';
import app from '../server.js';
import pool from '../db/connection.js';

describe('Resume API', () => {
  let createdResumeId: number;

  // Test data
  const validResume = {
    title: 'Test Resume',
    template: 'classic',
    accentColor: '#3B82F6',
  };

  const updatedResume = {
    title: 'Updated Resume Title',
    template: 'modern',
    accentColor: '#10B981',
  };

  // Clean up after tests
  afterAll(async () => {
    // Close database connection
    await pool.end();
  });

  // ==================== GET /api/resumes ====================
  describe('GET /api/resumes', () => {
    it('should return array of resumes', async () => {
      const response = await request(app).get('/api/resumes').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should return resumes with correct structure', async () => {
      const response = await request(app).get('/api/resumes').expect(200);

      if (response.body.data.length > 0) {
        const resume = response.body.data[0];
        expect(resume).toHaveProperty('id');
        expect(resume).toHaveProperty('title');
        expect(resume).toHaveProperty('template');
        expect(resume).toHaveProperty('accent_color');
        expect(resume).toHaveProperty('created_at');
        expect(resume).toHaveProperty('updated_at');
      }
    });
  });

  // ==================== POST /api/resumes ====================
  describe('POST /api/resumes', () => {
    it('should create new resume with valid data', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send(validResume)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(validResume.title);
      expect(response.body.data.template).toBe(validResume.template);
      expect(response.body.data.accent_color).toBe(validResume.accentColor);
      expect(response.body.message).toBe('Resume created successfully');

      // Save ID for subsequent tests
      createdResumeId = response.body.data.id;
    });

    it('should fail with missing title', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({ template: 'classic' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should fail with invalid template', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({
          title: 'Test',
          template: 'invalid-template',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with invalid accent color', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({
          title: 'Test',
          accentColor: 'not-a-hex-color',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should use defaults for optional fields', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Minimal Resume' })
        .expect(201);

      expect(response.body.data.template).toBe('classic');
      expect(response.body.data.accent_color).toBe('#3B82F6');

      // Clean up
      await request(app).delete(`/api/resumes/${response.body.data.id}`);
    });
  });

  // ==================== GET /api/resumes/:id ====================
  describe('GET /api/resumes/:id', () => {
    it('should return resume by ID', async () => {
      const response = await request(app).get(`/api/resumes/${createdResumeId}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdResumeId);
      expect(response.body.data.title).toBe(validResume.title);
      expect(response.body.message).toBe('Resume retrieved successfully');
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app).get('/api/resumes/99999').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resume not found');
    });

    it('should return 404 for invalid ID format', async () => {
      const response = await request(app).get('/api/resumes/invalid-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== PUT /api/resumes/:id ====================
  describe('PUT /api/resumes/:id', () => {
    it('should update resume with valid data', async () => {
      const response = await request(app)
        .put(`/api/resumes/${createdResumeId}`)
        .send(updatedResume)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdResumeId);
      expect(response.body.data.title).toBe(updatedResume.title);
      expect(response.body.data.template).toBe(updatedResume.template);
      expect(response.body.data.accent_color).toBe(updatedResume.accentColor);
      expect(response.body.message).toBe('Resume updated successfully');
    });

    it('should update only provided fields', async () => {
      const response = await request(app)
        .put(`/api/resumes/${createdResumeId}`)
        .send({ title: 'Partially Updated' })
        .expect(200);

      expect(response.body.data.title).toBe('Partially Updated');
      expect(response.body.data.template).toBe(updatedResume.template); // Should remain unchanged
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .put('/api/resumes/99999')
        .send({ title: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resume not found');
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .put(`/api/resumes/${createdResumeId}`)
        .send({ template: 'invalid-template' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  // ==================== DELETE /api/resumes/:id ====================
  describe('DELETE /api/resumes/:id', () => {
    it('should delete resume', async () => {
      await request(app).delete(`/api/resumes/${createdResumeId}`).expect(204);

      // Verify deletion
      await request(app).get(`/api/resumes/${createdResumeId}`).expect(404);
    });

    it('should return 404 when deleting non-existent resume', async () => {
      const response = await request(app).delete('/api/resumes/99999').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resume not found');
    });
  });

  // ==================== Personal Info ====================
  describe('PUT /api/resumes/:id/personal-info', () => {
    let testResumeId: number;

    beforeAll(async () => {
      // Create a test resume for personal info tests
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Personal Info Test Resume' });
      testResumeId = response.body.data.id;
    });

    afterAll(async () => {
      // Clean up test resume
      await request(app).delete(`/api/resumes/${testResumeId}`);
    });

    it('should update personal info with valid data', async () => {
      const personalInfo = {
        name: 'John Doe',
        role: 'Senior Developer',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        portfolioUrl: 'https://johndoe.dev',
      };

      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/personal-info`)
        .send(personalInfo)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(personalInfo.name);
      expect(response.body.data.role).toBe(personalInfo.role);
      expect(response.body.data.email).toBe(personalInfo.email);
      expect(response.body.data.phone).toBe(personalInfo.phone);
      expect(response.body.message).toBe('Personal info updated successfully');
    });

    it('should update only provided fields', async () => {
      const partialUpdate = {
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/personal-info`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data.name).toBe(partialUpdate.name);
      expect(response.body.data.email).toBe(partialUpdate.email);
      expect(response.body.data.role).toBe('Senior Developer'); // Should remain unchanged
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/personal-info`)
        .send({
          name: 'Test',
          role: 'Developer',
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with invalid URL', async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/personal-info`)
        .send({
          name: 'Test',
          role: 'Developer',
          email: 'test@example.com',
          linkedinUrl: 'not-a-url',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .put('/api/resumes/99999/personal-info')
        .send({
          name: 'Test',
          role: 'Developer',
          email: 'test@example.com',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resume not found');
    });

    it('should allow updating single fields (partial update)', async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/personal-info`)
        .send({
          phone: '+9999999999',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.phone).toBe('+9999999999');
      expect(response.body.message).toBe('Personal info updated successfully');
    });
  });

  // ==================== Error Handling ====================
  describe('Error Handling', () => {
    it('should return 404 for invalid route', async () => {
      const response = await request(app).get('/api/invalid-route').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Content-Type', 'application/json')
        .send('invalid-json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

