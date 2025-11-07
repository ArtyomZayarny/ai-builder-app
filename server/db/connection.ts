import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Support both DATABASE_URL (for Vercel/production) and individual env vars (for local dev)
const databaseConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'resume_builder',
      user: process.env.DB_USER || 'resume_user',
      password: process.env.DB_PASSWORD || 'resume_pass_dev',
      ssl: {
        rejectUnauthorized: false,
      },
    };

// Log database configuration (without sensitive data)
console.log('🔍 Database Configuration:');
if (process.env.DATABASE_URL) {
  console.log({
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (using connection string)' : 'NOT SET',
  });
} else {
  console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET',
  });
}

// Create connection pool
const pool = new Pool({
  ...databaseConfig,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit process - allow server to run without database
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error('Query error', { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = () => pool.connect();

// Graceful shutdown
export const closePool = async () => {
  console.log('Closing database pool...');
  await pool.end();
  console.log('Database pool closed');
};

export default pool;

