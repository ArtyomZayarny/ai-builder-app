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

    // Get all migration files sorted by name
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    // Execute each migration
    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);
      const migrationPath = path.join(__dirname, file);
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      await client.query(sql);
      console.log(`✅ ${file} completed\n`);
    }

    console.log('✅ All migrations completed successfully!\n');
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

