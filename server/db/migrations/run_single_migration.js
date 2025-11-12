/**
 * Run a single migration file
 * Usage: node run_single_migration.js 005_make_experience_fields_optional.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration file name');
  console.error('Usage: node run_single_migration.js <migration_file.sql>');
  process.exit(1);
}

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log(`🔄 Running migration: ${migrationFile}\n`);

    const migrationPath = path.join(__dirname, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8');
    await client.query(sql);
    console.log(`✅ ${migrationFile} completed successfully!\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

