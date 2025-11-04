/**
 * Migration Runner
 * Executes SQL migration files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running database migrations...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await client.query(sql);

    console.log('✅ Migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

