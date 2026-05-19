# Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running locally or connection string ready
- Git installed

### 1. Clone & Install

```bash
git clone https://github.com/Isaac-MPA/xbox-sale-predictor.git
cd xbox-sale-predictor
npm run install-all
```

### 2. Environment Setup

```bash
# Copy example files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration
# Minimum required:
# DATABASE_URL=postgresql://user:password@localhost:5432/xbox_sale_predictor
# JWT_SECRET=your_secret_key_here
```

### 3. Database Setup

```bash
cd backend
npm run migrate
cd ..
```

### 4. Start Development

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

**Done!** 🎉
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/health

---

## Detailed Setup

### System Requirements

**Minimum:**
- 2GB RAM
- 1GB disk space
- Node.js 18 LTS
- PostgreSQL 12 or MongoDB 4.4

**Recommended:**
- 4GB+ RAM
- 5GB+ disk space
- Node.js 20 LTS
- PostgreSQL 15
- Redis 7

### Step-by-Step Installation

#### Step 1: Install Node.js

**macOS (Homebrew)**
```bash
brew install node@18
node --version  # v18.x.x
npm --version   # 9.x.x
```

**Ubuntu/Debian**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows**
Download from https://nodejs.org/

#### Step 2: Install Database

**PostgreSQL Setup**

*macOS:*
```bash
brew install postgresql
brew services start postgresql
creatdb xbox_sale_predictor
psql xbox_sale_predictor
```

*Ubuntu:*
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb xbox_sale_predictor
```

*Windows:*
- Download from https://www.postgresql.org/download/windows/
- Run installer
- Remember the password you set
- Create database: `createdb xbox_sale_predictor`

#### Step 3: Clone Repository

```bash
git clone https://github.com/Isaac-MPA/xbox-sale-predictor.git
cd xbox-sale-predictor
```

#### Step 4: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### Step 5: Configure Environment

**Root `.env`**
```bash
cp .env.example .env
```

**Backend `.env`**
```bash
cd backend
cp .env.example .env

# Edit backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/xbox_sale_predictor"
JWT_SECRET="your-secret-key-min-32-chars-long"
NODE_ENV="development"
PORT="3001"
```

**Frontend `.env`**
```bash
cd frontend
cp .env.example .env

# Edit frontend/.env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

#### Step 6: Setup Database

```bash
cd backend
npm run migrate

# Optional: Add sample data
npm run seed
```

#### Step 7: Verify Installation

```bash
# Test backend
cd backend
npm run build

# Test frontend
cd frontend
npm run build
```

### Development Workflow

#### Running Services

```bash
# Terminal 1: Backend (from project root)
cd backend && npm run dev

# Terminal 2: Frontend (from project root)
cd frontend && npm run dev
```

#### Building for Production

```bash
# Build both
npm run build

# Or individually
cd backend && npm run build
cd frontend && npm run build
```

#### Testing

```bash
# Test backend
cd backend && npm run test

# Test frontend
cd frontend && npm run test

# Test all
npm run test
```

#### Linting

```bash
# Lint all
npm run lint

# Fix issues
npm run format
```

### Docker Setup (Optional)

```bash
# Build containers
npm run docker:build

# Start services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Troubleshooting

#### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql postgres -h localhost -U postgres

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

#### Dependencies Installation Issues

```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall
npm run install-all
```

#### Migration Issues

```bash
# Reset database
cd backend
npm run db:push
npm run migrate:reset
```

### Project Structure

```
xbox-sale-predictor/
├── backend/                    # Express API
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Middlewares
│   │   ├── routes/             # API routes
│   │   ├── jobs/               # Scheduled tasks
│   │   ├── database/           # DB schema
│   │   ├── utils/              # Utilities
│   │   └── types/              # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── pages/              # Next.js pages
│   │   ├── components/         # React components
│   │   ├── styles/             # CSS/Tailwind
│   │   ├── services/           # API calls
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utilities
│   ├── public/                 # Static files
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── docs/                       # Documentation
│   ├── API.md                  # API Reference
│   ├── ARCHITECTURE.md         # System design
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── PREDICTION_ALGORITHM.md # Algorithm details
│   └── SETUP.md               # This file
│
├── docker-compose.yml          # Docker setup
├── Dockerfile.backend          # Backend Docker
├── Dockerfile.frontend         # Frontend Docker
├── .env.example               # Root env template
├── .gitignore
├── README.md
└── package.json               # Root package.json
```

### Environment Variables Reference

#### Backend

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xbox_sale_predictor

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Xbox API (future)
XBOX_API_KEY=your_xbox_api_key
XBOX_API_BASE_URL=https://catalogsvc.tellmeabout.com

# Email (future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Node
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

#### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

### Common Tasks

#### Add a New Feature

1. Create service in `backend/src/services/`
2. Create controller in `backend/src/controllers/`
3. Add routes in `backend/src/routes/`
4. Create components in `frontend/src/components/`
5. Create pages in `frontend/src/pages/`
6. Update tests

#### Run Database Migrations

```bash
cd backend

# Create migration
npm run db:create-migration -- add_feature_name

# Run migrations
npm run migrate

# View database
npm run db:studio
```

#### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Next Steps

1. Read [README.md](../README.md) for project overview
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Review [API.md](./API.md) for API documentation
4. Explore [PREDICTION_ALGORITHM.md](./PREDICTION_ALGORITHM.md) for ML details

### Support

- **Issues**: Open GitHub Issues
- **Discussions**: Start GitHub Discussions
- **Email**: support@xboxsalepredictor.com

### License

MIT License - See LICENSE file
