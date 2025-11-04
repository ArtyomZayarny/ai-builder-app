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

  // ==================== Summary ====================
  describe('PUT /api/resumes/:id/summary', () => {
    let testResumeId: number;

    beforeAll(async () => {
      // Create a test resume for summary tests
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Summary Test Resume' });
      testResumeId = response.body.data.id;
    });

    afterAll(async () => {
      // Clean up test resume
      await request(app).delete(`/api/resumes/${testResumeId}`);
    });

    it('should update summary with valid data', async () => {
      const summary = {
        content:
          'Experienced Full-Stack Developer with 6+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies.',
      };

      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/summary`)
        .send(summary)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(summary.content);
      expect(response.body.message).toBe('Summary updated successfully');
    });

    it('should fail with too short content', async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/summary`)
        .send({
          content: 'Too short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with too long content', async () => {
      const longContent = 'A'.repeat(1001); // 1001 characters
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/summary`)
        .send({
          content: longContent,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with missing content', async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/summary`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .put('/api/resumes/99999/summary')
        .send({
          content:
            'This is a valid summary with more than 50 characters for testing purposes.',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resume not found');
    });
  });

  // ==================== Skills CRUD ====================
  describe('Skills CRUD', () => {
    let testResumeId: number;
    let testSkillId: number;

    beforeAll(async () => {
      // Create a test resume for skills tests
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Skills Test Resume' });
      testResumeId = response.body.data.id;
    });

    afterAll(async () => {
      // Clean up test resume
      await request(app).delete(`/api/resumes/${testResumeId}`);
    });

    describe('GET /api/resumes/:id/skills', () => {
      it('should return empty array for resume without skills', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/skills`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app).get('/api/resumes/99999/skills').expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('POST /api/resumes/:id/skills', () => {
      it('should create skill with valid data', async () => {
        const skill = {
          name: 'React',
          category: 'Frontend',
          order: 0,
        };

        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/skills`)
          .send(skill)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(skill.name);
        expect(response.body.data.category).toBe(skill.category);
        expect(response.body.message).toBe('Skill created successfully');

        testSkillId = response.body.data.id; // Save for update/delete tests
      });

      it('should create skill with only required field (name)', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/skills`)
          .send({ name: 'Node.js' })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Node.js');
      });

      it('should fail with missing name', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/skills`)
          .send({ category: 'Backend' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .post('/api/resumes/99999/skills')
          .send({ name: 'Test Skill' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('PUT /api/resumes/:id/skills/:skillId', () => {
      it('should update skill with valid data', async () => {
        const update = {
          name: 'React.js',
          category: 'Frontend Frameworks',
        };

        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/skills/${testSkillId}`)
          .send(update)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(update.name);
        expect(response.body.data.category).toBe(update.category);
        expect(response.body.message).toBe('Skill updated successfully');
      });

      it('should update only provided fields', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/skills/${testSkillId}`)
          .send({ name: 'ReactJS' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('ReactJS');
      });

      it('should return 404 for non-existent skill', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/skills/99999`)
          .send({ name: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Skill not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .put(`/api/resumes/99999/skills/1`)
          .send({ name: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('DELETE /api/resumes/:id/skills/:skillId', () => {
      it('should return 404 for non-existent skill', async () => {
        const response = await request(app)
          .delete(`/api/resumes/${testResumeId}/skills/99999`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Skill not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .delete(`/api/resumes/99999/skills/1`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });

      it('should delete skill', async () => {
        await request(app)
          .delete(`/api/resumes/${testResumeId}/skills/${testSkillId}`)
          .expect(204);
      });
    });

    describe('GET /api/resumes/:id/skills - with data', () => {
      beforeAll(async () => {
        // Create some test skills
        await request(app)
          .post(`/api/resumes/${testResumeId}/skills`)
          .send({ name: 'TypeScript', category: 'Languages', order: 0 });
        await request(app)
          .post(`/api/resumes/${testResumeId}/skills`)
          .send({ name: 'PostgreSQL', category: 'Database', order: 1 });
      });

      it('should return all skills for resume', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/skills`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('category');
      });
    });
  });

  // ==================== Education CRUD ====================
  describe('Education CRUD', () => {
    let testResumeId: number;
    let testEducationId: number;

    beforeAll(async () => {
      // Create a test resume for education tests
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Education Test Resume' });
      testResumeId = response.body.data.id;
    });

    afterAll(async () => {
      // Clean up test resume
      await request(app).delete(`/api/resumes/${testResumeId}`);
    });

    describe('GET /api/resumes/:id/education', () => {
      it('should return empty array for resume without education', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/education`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app).get('/api/resumes/99999/education').expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('POST /api/resumes/:id/education', () => {
      it('should create education with valid data', async () => {
        const education = {
          institution: 'MIT',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          location: 'Cambridge, MA',
          graduationDate: '2020-05-01',
          gpa: '3.9',
          description: 'Focused on AI and Machine Learning',
          order: 0,
        };

        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/education`)
          .send(education)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.institution).toBe(education.institution);
        expect(response.body.data.degree).toBe(education.degree);
        expect(response.body.message).toBe('Education created successfully');

        testEducationId = response.body.data.id; // Save for update/delete tests
      });

      it('should create education with only required fields', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/education`)
          .send({
            institution: 'Stanford University',
            degree: 'Master of Science',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.institution).toBe('Stanford University');
      });

      it('should fail with missing required fields', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/education`)
          .send({ field: 'Computer Science' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .post('/api/resumes/99999/education')
          .send({
            institution: 'Test University',
            degree: 'Test Degree',
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('PUT /api/resumes/:id/education/:eduId', () => {
      it('should update education with valid data', async () => {
        const update = {
          institution: 'MIT (Updated)',
          degree: 'Bachelor of Science in CS',
        };

        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/education/${testEducationId}`)
          .send(update)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.institution).toBe(update.institution);
        expect(response.body.data.degree).toBe(update.degree);
        expect(response.body.message).toBe('Education updated successfully');
      });

      it('should update only provided fields', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/education/${testEducationId}`)
          .send({ gpa: '4.0' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.gpa).toBe('4.0');
      });

      it('should return 404 for non-existent education', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/education/99999`)
          .send({ institution: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Education not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .put(`/api/resumes/99999/education/1`)
          .send({ institution: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('DELETE /api/resumes/:id/education/:eduId', () => {
      it('should return 404 for non-existent education', async () => {
        const response = await request(app)
          .delete(`/api/resumes/${testResumeId}/education/99999`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Education not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .delete(`/api/resumes/99999/education/1`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });

      it('should delete education', async () => {
        await request(app)
          .delete(`/api/resumes/${testResumeId}/education/${testEducationId}`)
          .expect(204);
      });
    });

    describe('GET /api/resumes/:id/education - with data', () => {
      beforeAll(async () => {
        // Create some test education entries
        await request(app)
          .post(`/api/resumes/${testResumeId}/education`)
          .send({
            institution: 'Harvard',
            degree: 'PhD',
            field: 'Computer Science',
            order: 0,
          });
        await request(app)
          .post(`/api/resumes/${testResumeId}/education`)
          .send({
            institution: 'Yale',
            degree: 'MBA',
            field: 'Business Administration',
            order: 1,
          });
      });

      it('should return all education for resume', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/education`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        expect(response.body.data[0]).toHaveProperty('institution');
        expect(response.body.data[0]).toHaveProperty('degree');
      });
    });
  });

  // ==================== Projects CRUD ====================
  describe('Projects CRUD', () => {
    let testResumeId: number;
    let testProjectId: number;

    beforeAll(async () => {
      // Create a test resume for projects tests
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Projects Test Resume' });
      testResumeId = response.body.data.id;
    });

    afterAll(async () => {
      // Clean up test resume
      await request(app).delete(`/api/resumes/${testResumeId}`);
    });

    describe('GET /api/resumes/:id/projects', () => {
      it('should return empty array for resume without projects', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/projects`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app).get('/api/resumes/99999/projects').expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('POST /api/resumes/:id/projects', () => {
      it('should create project with valid data', async () => {
        const project = {
          name: 'E-commerce Platform',
          description: 'Built full-stack marketplace with Next.js and Stripe',
          technologies: ['Next.js', 'React', 'PostgreSQL', 'Stripe'],
          url: 'https://github.com/test/ecommerce',
          date: '2023-06-01',
          order: 0,
        };

        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/projects`)
          .send(project)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(project.name);
        expect(response.body.data.technologies).toEqual(project.technologies);
        expect(response.body.message).toBe('Project created successfully');

        testProjectId = response.body.data.id; // Save for update/delete tests
      });

      it('should create project with only required fields', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/projects`)
          .send({
            name: 'Simple App',
            description: 'A simple application for testing purposes',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Simple App');
      });

      it('should fail with missing required fields', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/projects`)
          .send({ name: 'Only Name' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .post('/api/resumes/99999/projects')
          .send({
            name: 'Test Project',
            description: 'Test description for testing',
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('PUT /api/resumes/:id/projects/:projectId', () => {
      it('should update project with valid data', async () => {
        const update = {
          name: 'E-commerce Platform (Updated)',
          description: 'Enhanced marketplace with advanced features',
        };

        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/projects/${testProjectId}`)
          .send(update)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(update.name);
        expect(response.body.data.description).toBe(update.description);
        expect(response.body.message).toBe('Project updated successfully');
      });

      it('should update only provided fields', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/projects/${testProjectId}`)
          .send({ url: 'https://newurl.com' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.url).toBe('https://newurl.com');
      });

      it('should return 404 for non-existent project', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/projects/99999`)
          .send({ name: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Project not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .put(`/api/resumes/99999/projects/1`)
          .send({ name: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('DELETE /api/resumes/:id/projects/:projectId', () => {
      it('should return 404 for non-existent project', async () => {
        const response = await request(app)
          .delete(`/api/resumes/${testResumeId}/projects/99999`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Project not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .delete(`/api/resumes/99999/projects/1`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });

      it('should delete project', async () => {
        await request(app)
          .delete(`/api/resumes/${testResumeId}/projects/${testProjectId}`)
          .expect(204);
      });
    });

    describe('GET /api/resumes/:id/projects - with data', () => {
      beforeAll(async () => {
        // Create some test projects
        await request(app)
          .post(`/api/resumes/${testResumeId}/projects`)
          .send({
            name: 'Project Alpha',
            description: 'First test project with amazing features',
            technologies: ['React', 'Node.js'],
            order: 0,
          });
        await request(app)
          .post(`/api/resumes/${testResumeId}/projects`)
          .send({
            name: 'Project Beta',
            description: 'Second test project for validation',
            technologies: ['Vue', 'Express'],
            order: 1,
          });
      });

      it('should return all projects for resume', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/projects`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('technologies');
      });
    });
  });

  // ==================== Experiences CRUD ====================
  describe('Experiences CRUD', () => {
    let testResumeId: number;
    let testExpId: number;

    beforeAll(async () => {
      // Create a test resume for experiences tests
      const response = await request(app)
        .post('/api/resumes')
        .send({ title: 'Experiences Test Resume' });
      testResumeId = response.body.data.id;
    });

    afterAll(async () => {
      // Clean up test resume
      await request(app).delete(`/api/resumes/${testResumeId}`);
    });

    describe('GET /api/resumes/:id/experiences', () => {
      it('should return empty array for resume without experiences', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/experiences`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app).get('/api/resumes/99999/experiences').expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('POST /api/resumes/:id/experiences', () => {
      it('should create current experience (isCurrent=true, no endDate)', async () => {
        const experience = {
          company: 'Tech Corp',
          role: 'Senior Developer',
          location: 'San Francisco, CA',
          startDate: '2021-03-01',
          isCurrent: true,
          description: 'Leading development of microservices architecture',
          order: 0,
        };

        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send(experience)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.company).toBe(experience.company);
        expect(response.body.data.is_current).toBe(true);
        expect(response.body.data.end_date).toBeNull();
        expect(response.body.message).toBe('Experience created successfully');

        testExpId = response.body.data.id; // Save for update/delete tests
      });

      it('should create past experience (isCurrent=false, with endDate)', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send({
            company: 'Previous Company',
            role: 'Junior Developer',
            startDate: '2019-01-01',
            endDate: '2020-12-31',
            isCurrent: false,
            description: 'Worked on various web applications',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.is_current).toBe(false);
        // Date is returned, just verify it exists (not null)
        expect(response.body.data.end_date).toBeTruthy();
      });

      it('should fail if isCurrent=false but no endDate', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send({
            company: 'Test Company',
            role: 'Test Role',
            startDate: '2020-01-01',
            isCurrent: false,
            description: 'Test description for validation',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should fail if isCurrent=true with endDate', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send({
            company: 'Test Company',
            role: 'Test Role',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
            isCurrent: true,
            description: 'Test description for validation',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should fail with missing required fields', async () => {
        const response = await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send({ company: 'Only Company' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .post('/api/resumes/99999/experiences')
          .send({
            company: 'Test Corp',
            role: 'Developer',
            startDate: '2020-01-01',
            isCurrent: true,
            description: 'Test description for testing',
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('PUT /api/resumes/:id/experiences/:expId', () => {
      it('should update experience with valid data', async () => {
        const update = {
          company: 'Tech Corp (Updated)',
          role: 'Lead Senior Developer',
        };

        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/experiences/${testExpId}`)
          .send(update)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.company).toBe(update.company);
        expect(response.body.data.role).toBe(update.role);
        expect(response.body.message).toBe('Experience updated successfully');
      });

      it('should update only provided fields', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/experiences/${testExpId}`)
          .send({ location: 'New York, NY' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.location).toBe('New York, NY');
      });

      it('should return 404 for non-existent experience', async () => {
        const response = await request(app)
          .put(`/api/resumes/${testResumeId}/experiences/99999`)
          .send({ company: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Experience not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .put(`/api/resumes/99999/experiences/1`)
          .send({ company: 'Test' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });
    });

    describe('DELETE /api/resumes/:id/experiences/:expId', () => {
      it('should return 404 for non-existent experience', async () => {
        const response = await request(app)
          .delete(`/api/resumes/${testResumeId}/experiences/99999`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Experience not found');
      });

      it('should return 404 for non-existent resume', async () => {
        const response = await request(app)
          .delete(`/api/resumes/99999/experiences/1`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Resume not found');
      });

      it('should delete experience', async () => {
        await request(app)
          .delete(`/api/resumes/${testResumeId}/experiences/${testExpId}`)
          .expect(204);
      });
    });

    describe('GET /api/resumes/:id/experiences - with data', () => {
      beforeAll(async () => {
        // Create some test experiences
        await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send({
            company: 'Company A',
            role: 'Software Engineer',
            startDate: '2020-01-01',
            isCurrent: true,
            description: 'Current position at Company A',
            order: 0,
          });
        await request(app)
          .post(`/api/resumes/${testResumeId}/experiences`)
          .send({
            company: 'Company B',
            role: 'Junior Developer',
            startDate: '2018-06-01',
            endDate: '2019-12-31',
            isCurrent: false,
            description: 'Previous position at Company B',
            order: 1,
          });
      });

      it('should return all experiences for resume', async () => {
        const response = await request(app)
          .get(`/api/resumes/${testResumeId}/experiences`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        expect(response.body.data[0]).toHaveProperty('company');
        expect(response.body.data[0]).toHaveProperty('is_current');
      });
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

