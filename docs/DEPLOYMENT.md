# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 12+ or MongoDB 4.4+
- Redis 6+ (optional, for caching)
- Docker (optional)
- Git

## Development Deployment

### Local Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/Isaac-MPA/xbox-sale-predictor.git
   cd xbox-sale-predictor
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Setup database**
   ```bash
   cd backend
   npm run migrate
   npm run seed  # Optional: add sample data
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Docker Deployment

### Using Docker Compose

```bash
# Build images
npm run docker:build

# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## Production Deployment

### Option 1: Vercel + Railway

#### Frontend (Vercel)

1. **Connect repository to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Select `frontend` as root directory

2. **Configure environment variables**
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

3. **Deploy**
   - Push to main branch
   - Vercel auto-deploys

#### Backend (Railway)

1. **Connect to Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Import GitHub repository
   - Select `backend` as root directory

2. **Add services**
   - Add PostgreSQL plugin
   - Add Redis plugin (optional)

3. **Configure environment**
   - Set `DATABASE_URL` from PostgreSQL plugin
   - Set other env variables
   - Set `PORT=3001`

4. **Deploy**
   ```bash
   railway up
   ```

### Option 2: AWS EC2 + RDS

1. **Launch EC2 instance**
   ```bash
   # Ubuntu 22.04 LTS recommended
   # Instance type: t3.medium or larger
   ```

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm git postgresql-client redis-server
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

3. **Clone and setup**
   ```bash
   git clone https://github.com/Isaac-MPA/xbox-sale-predictor.git
   cd xbox-sale-predictor
   npm run install-all
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit with RDS endpoint, etc.
   ```

5. **Setup database**
   ```bash
   cd backend
   npm run migrate:prod
   ```

6. **Start with PM2**
   ```bash
   # Backend
   cd backend
   npm run build
   pm2 start dist/index.js --name xbox-backend
   
   # Frontend
   cd ../frontend
   npm run build
   pm2 start npm --name xbox-frontend -- start
   
   # Save PM2 config
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx reverse proxy**
   ```bash
   sudo apt install -y nginx
   ```

   Create `/etc/nginx/sites-available/xbox-predictor`:
   ```nginx
   upstream backend {
     server localhost:3001;
   }
   
   upstream frontend {
     server localhost:3000;
   }
   
   server {
     listen 80;
     server_name yourdomain.com www.yourdomain.com;
   
     location /api {
       proxy_pass http://backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   
     location / {
       proxy_pass http://frontend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/xbox-predictor /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### Option 3: Google Cloud Platform

1. **Create App Engine applications**
   ```bash
   gcloud app create
   ```

2. **Deploy backend**
   ```bash
   cd backend
   gcloud app deploy --version=v1
   ```

3. **Deploy frontend**
   ```bash
   cd ../frontend
   gcloud app deploy --version=v1
   ```

4. **Create Cloud SQL instance**
   ```bash
   gcloud sql instances create xbox-predictor \
     --database-version=POSTGRES_13 \
     --tier=db-f1-micro
   ```

## Database Migration

### For PostgreSQL

```bash
# Create migrations
npm run db:create-migration -- name_of_migration

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### For MongoDB

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

## Monitoring & Maintenance

### Logging

```bash
# View backend logs
pm2 logs xbox-backend

# View frontend logs
pm2 logs xbox-frontend
```

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/health

# Response:
# {"status":"healthy","version":"1.0.0"}
```

### Database Backups

```bash
# PostgreSQL backup
pg_dump -U user -h localhost xbox_sale_predictor > backup.sql

# Restore
psql -U user -h localhost xbox_sale_predictor < backup.sql
```

### Performance Optimization

1. **Enable Redis caching**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

2. **Database indexing**
   - Already configured in schema.prisma
   - Monitor slow queries

3. **CDN for static assets**
   - Configure in Vercel/Cloudflare

4. **Database connection pooling**
   - Use PgBouncer for PostgreSQL

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test connection
psql -U user -h localhost -d xbox_sale_predictor -c "SELECT 1"
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist .next
npm install
npm run build
```

## Scaling Recommendations

1. **Horizontal Scaling**
   - Use load balancer (Nginx/HAProxy)
   - Deploy multiple API instances
   - Use managed database services

2. **Vertical Scaling**
   - Increase server resources
   - Upgrade database tier
   - Implement caching layer

3. **Database Optimization**
   - Create appropriate indexes
   - Archive old price history
   - Use database replication

## Cost Estimation

**Monthly costs (production setup)**:

- Frontend hosting (Vercel): $20-100
- Backend hosting (Railway): $7-50
- Database (PostgreSQL): $15-100
- Domain: $12/year
- **Total**: ~$50-250/month

## Next Steps

1. Configure monitoring (Sentry, DataDog)
2. Setup CI/CD pipeline (GitHub Actions)
3. Implement backup strategy
4. Configure automated scaling
5. Setup logging aggregation (CloudWatch, Kibana)
