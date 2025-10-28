# AI Resume Builder

A modern, AI-powered resume builder application with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- Docker (for PostgreSQL)
- Git

### Development Setup

1. **Clone the repository**
```bash
git clone git@github.com:ArtyomZayarny/ai-builder-app.git
cd ai-builder-app
```

2. **Install dependencies**
```bash
# Install root dependencies (for running both services)
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
cd ..
```

3. **Start PostgreSQL database**
```bash
docker-compose up -d
```

4. **Configure environment**
```bash
# Copy example env file in server directory
cp server/.env.example server/.env

# Update server/.env with your configuration
```

5. **Run the application**
```bash
# From root directory - runs both client and server
npm run dev

# Or run separately:
npm run dev:client  # Frontend only (port 5173)
npm run dev:server  # Backend only (port 5000)
```

6. **Verify setup**
Open [http://localhost:5173](http://localhost:5173) in your browser. You should see a health check page showing API and database connection status.

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── features/      # Feature-based modules
│   │   ├── services/      # API client services
│   │   ├── store/         # State management
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── db/                # Database connection & models
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── package.json
│
├── docker-compose.yml     # PostgreSQL setup
└── package.json           # Root package for dev scripts
```

## 🛠️ Available Scripts

### Root (Both Services)
- `npm run dev` - Run both client and server concurrently
- `npm run dev:client` - Run only frontend
- `npm run dev:server` - Run only backend
- `npm run lint` - Lint both projects
- `npm run format` - Format client code

### Client (Frontend)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format with Prettier
- `npm run format:check` - Check formatting

### Server (Backend)
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format with Prettier

## 🔧 Tech Stack

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** TailwindCSS (planned)
- **State Management:** Redux Toolkit / Context API (planned)
- **HTTP Client:** Axios (planned)
- **Form Validation:** React Hook Form + Zod (planned)

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **ORM:** pg (PostgreSQL client)
- **Authentication:** JWT (planned)
- **Validation:** Joi / Zod (planned)

### DevOps
- **Database:** Docker + PostgreSQL
- **Linting:** ESLint + Prettier
- **Pre-commit:** Husky + lint-staged
- **CI/CD:** GitHub Actions (planned)

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Check API and database status

### Authentication (Placeholder)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users (Placeholder)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user account

### Resumes (Placeholder)
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get resume by ID
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

## 🔐 Environment Variables

See `server/.env.example` for all required environment variables.

Key variables:
- `PORT` - Server port (default: 5000)
- `DB_*` - Database connection settings
- `JWT_SECRET` - JWT secret key (to be implemented)
- `GEMINI_API_KEY` - Google Gemini AI API key (to be implemented)
- `IMAGEKIT_*` - ImageKit credentials (to be implemented)

## 🧪 Testing

Coming soon...

## 🚢 CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Automated Checks

On every push and pull request:
- ✅ ESLint checks (client & server)
- ✅ Automated tests (when available)
- ✅ Frontend build verification
- ✅ Backend startup verification

See [Deployment Guide](docs/deployment.md) for detailed deployment instructions and configuration.

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

Artem Zaiarnyi - [@ArtyomZayarny](https://github.com/ArtyomZayarny)

Project Link: [https://github.com/ArtyomZayarny/ai-builder-app](https://github.com/ArtyomZayarny/ai-builder-app)

