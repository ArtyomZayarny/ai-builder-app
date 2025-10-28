# Environment Variables Setup

## Frontend Configuration

### Automatic Configuration (Default)

The frontend automatically detects the environment and uses the appropriate backend URL:

- **Development**: `http://localhost:3001`
- **Production**: `https://ai-builder-app-be.vercel.app`

Configuration is defined in `src/config.js`.

### Manual Override (Optional)

If you need to override the default backend URL, create environment files:

#### For Development

Create `.env.development` in the `client/` directory:

```bash
VITE_BACKEND_URL=http://localhost:3001
```

#### For Production

Create `.env.production` in the `client/` directory:

```bash
VITE_BACKEND_URL=https://ai-builder-app-be.vercel.app
```

#### For Local Environment

Create `.env.local` (this overrides all other env files):

```bash
VITE_BACKEND_URL=http://localhost:3001
```

> **Note**: `.env` files are gitignored for security. Never commit them to the repository.

## Usage in Code

Import the configuration in your components:

```javascript
import { API, BACKEND_URL } from '../config';

// Use predefined endpoints
const response = await fetch(API.HEALTH);

// Or use the base URL
const response = await fetch(`${BACKEND_URL}/api/custom-endpoint`);
```

## Available API Endpoints

The `API` object provides the following endpoints:

- `API.BASE_URL` - Backend base URL
- `API.HEALTH` - Health check endpoint
- `API.AUTH.REGISTER` - User registration
- `API.AUTH.LOGIN` - User login
- `API.USERS.PROFILE` - User profile
- `API.RESUMES.LIST` - List all resumes
- `API.RESUMES.CREATE` - Create a resume
- `API.RESUMES.GET(id)` - Get resume by ID
- `API.RESUMES.UPDATE(id)` - Update resume by ID
- `API.RESUMES.DELETE(id)` - Delete resume by ID

## Vite Environment Variables

All environment variables for Vite must be prefixed with `VITE_` to be exposed to the client:

- ✅ `VITE_BACKEND_URL`
- ❌ `BACKEND_URL` (won't work)

Learn more: [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
