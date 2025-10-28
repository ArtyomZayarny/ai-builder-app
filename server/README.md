# AI Resume Builder - Backend

## Database Setup

### Using Docker (Recommended)

1. Start PostgreSQL with Docker Compose:
```bash
docker-compose up -d
```

2. Add to your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resume_builder
DB_USER=resume_user
DB_PASSWORD=resume_pass_dev
```

3. The database will be initialized automatically with the schema from `db/init.sql`

### Manual PostgreSQL Installation

If you prefer to install PostgreSQL locally:

1. Install PostgreSQL 16+
2. Create database and user:
```sql
CREATE DATABASE resume_builder;
CREATE USER resume_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE resume_builder TO resume_user;
```

3. Run the init script:
```bash
psql -U resume_user -d resume_builder -f db/init.sql
```

4. Update `.env` with your credentials

## Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## API Endpoints

### Health Check
`GET /api/health`

Returns server and database connection status.

## Environment Variables

See `.env.example` for all required variables.

