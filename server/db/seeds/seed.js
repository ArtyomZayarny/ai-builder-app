/**
 * Seed Script
 * Populates database with sample resume data
 */

import pool from '../connection.js';
import { sampleResume } from './sample-data.js';

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding database with sample data...\n');

    // 1. Insert resume
    console.log('📝 Creating resume...');
    const resumeResult = await client.query(
      'INSERT INTO resumes (title, template, accent_color) VALUES ($1, $2, $3) RETURNING id',
      [sampleResume.resume.title, sampleResume.resume.template, sampleResume.resume.accent_color]
    );
    const resumeId = resumeResult.rows[0].id;
    console.log(`✅ Resume created with ID: ${resumeId}\n`);

    // 2. Insert personal info
    console.log('👤 Adding personal info...');
    await client.query(
      `INSERT INTO personal_info 
       (resume_id, name, role, email, phone, location, linkedin_url, portfolio_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        resumeId,
        sampleResume.personalInfo.name,
        sampleResume.personalInfo.role,
        sampleResume.personalInfo.email,
        sampleResume.personalInfo.phone,
        sampleResume.personalInfo.location,
        sampleResume.personalInfo.linkedin_url,
        sampleResume.personalInfo.portfolio_url,
      ]
    );
    console.log('✅ Personal info added\n');

    // 3. Insert summary
    console.log('📄 Adding summary...');
    await client.query('INSERT INTO summaries (resume_id, content) VALUES ($1, $2)', [
      resumeId,
      sampleResume.summary.content,
    ]);
    console.log('✅ Summary added\n');

    // 4. Insert experiences
    console.log(`💼 Adding ${sampleResume.experiences.length} work experiences...`);
    for (const exp of sampleResume.experiences) {
      await client.query(
        `INSERT INTO experiences 
         (resume_id, company, role, location, start_date, end_date, is_current, description, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          resumeId,
          exp.company,
          exp.role,
          exp.location,
          exp.start_date,
          exp.end_date,
          exp.is_current,
          exp.description,
          exp.order_index,
        ]
      );
    }
    console.log('✅ Experiences added\n');

    // 5. Insert education
    console.log(`🎓 Adding ${sampleResume.education.length} education entries...`);
    for (const edu of sampleResume.education) {
      await client.query(
        `INSERT INTO education 
         (resume_id, institution, degree, field, location, graduation_date, gpa, description, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          resumeId,
          edu.institution,
          edu.degree,
          edu.field,
          edu.location,
          edu.graduation_date,
          edu.gpa,
          edu.description,
          edu.order_index,
        ]
      );
    }
    console.log('✅ Education added\n');

    // 6. Insert projects
    console.log(`🚀 Adding ${sampleResume.projects.length} projects...`);
    for (const proj of sampleResume.projects) {
      await client.query(
        `INSERT INTO projects 
         (resume_id, name, description, technologies, url, date, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          resumeId,
          proj.name,
          proj.description,
          proj.technologies,
          proj.url,
          proj.date,
          proj.order_index,
        ]
      );
    }
    console.log('✅ Projects added\n');

    // 7. Insert skills
    console.log(`🛠️  Adding ${sampleResume.skills.length} skills...`);
    for (const skill of sampleResume.skills) {
      await client.query(
        'INSERT INTO skills (resume_id, name, category, order_index) VALUES ($1, $2, $3, $4)',
        [resumeId, skill.name, skill.category, skill.order_index]
      );
    }
    console.log('✅ Skills added\n');

    await client.query('COMMIT');

    console.log('🎉 Seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Resume ID: ${resumeId}`);
    console.log(`   Name: ${sampleResume.personalInfo.name}`);
    console.log(`   Role: ${sampleResume.personalInfo.role}`);
    console.log(`   Experiences: ${sampleResume.experiences.length}`);
    console.log(`   Education: ${sampleResume.education.length}`);
    console.log(`   Projects: ${sampleResume.projects.length}`);
    console.log(`   Skills: ${sampleResume.skills.length}`);
    console.log(`\n✨ You can now access this resume at: GET /api/resume/${resumeId}\n`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

