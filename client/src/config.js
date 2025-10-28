/**
 * Application configuration
 * Automatically determines the backend URL based on the environment
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Backend URL configuration
const BACKEND_URLS = {
  development: 'http://localhost:3001',
  production: 'https://ai-builder-app-be.vercel.app',
};

// Get the backend URL from environment variable or use defaults
export const BACKEND_URL = isProduction ? BACKEND_URLS.production : BACKEND_URLS.development;

// API endpoints helper
export const API = {
  BASE_URL: BACKEND_URL,
  HEALTH: `${BACKEND_URL}/api/health`,
  AUTH: {
    REGISTER: `${BACKEND_URL}/api/auth/register`,
    LOGIN: `${BACKEND_URL}/api/auth/login`,
  },
  USERS: {
    PROFILE: `${BACKEND_URL}/api/users/profile`,
  },
  RESUMES: {
    LIST: `${BACKEND_URL}/api/resumes`,
    CREATE: `${BACKEND_URL}/api/resumes`,
    GET: id => `${BACKEND_URL}/api/resumes/${id}`,
    UPDATE: id => `${BACKEND_URL}/api/resumes/${id}`,
    DELETE: id => `${BACKEND_URL}/api/resumes/${id}`,
  },
};

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 App Configuration:', {
    mode: import.meta.env.MODE,
    backendUrl: BACKEND_URL,
  });
}

export default {
  BACKEND_URL,
  API,
  isDevelopment,
  isProduction,
};
