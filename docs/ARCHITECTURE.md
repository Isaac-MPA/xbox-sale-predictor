# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React + Next.js (Frontend)                              │  │
│  │  - Homepage, Search, Game Detail Pages                   │  │
│  │  - Charts & Analytics (Recharts)                         │  │
│  │  - Dark Mode Gaming UI                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js + Node.js                                    │  │
│  │  - Rate Limiting                                         │  │
│  │  - JWT Authentication                                    │  │
│  │  - Error Handling                                        │  │
│  │  - Request Validation                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Game Service │  │ Price Service│  │Prediction Service    │ │
│  │              │  │              │  │                      │ │
│  │ - Search     │  │ - Record     │  │ - Calculate next     │ │
│  │ - Get all    │  │ - History    │  │   sale date          │ │
│  │ - Get by ID  │  │ - Stats      │  │ - Est. discount      │ │
│  │ - Filters    │  │ - Current    │  │ - Confidence score   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ Auth Service │  │ User Service │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                              │  │
│  │  - Query optimization                                    │  │
│  │  - Type-safe database operations                         │  │
│  │  - Auto-migrations                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  PostgreSQL DB  │  │  Redis Cache │  │  File Storage (   │ │
│  │                 │  │              │  │   game covers)    │ │
│  │ - Users         │  │ - Session    │  │                   │ │
│  │ - Games         │  │ - Cache      │  │ - Cover arts      │ │
│  │ - Price History │  │ - Queries    │  │ - Media           │ │
│  │ - Predictions   │  │              │  │                   │ │
│  │ - Wishlists     │  │              │  │                   │ │
│  └─────────────────┘  └──────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: Zustand (optional)
- **HTTP Client**: Axios
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL / MongoDB
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Zod
- **Logging**: Winston
- **Task Scheduling**: node-cron

## Database Schema

### Core Tables

```sql
-- Users Table
CREATE TABLE users (
  id VARCHAR(21) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role ENUM('USER', 'MODERATOR', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Games Table
CREATE TABLE games (
  id VARCHAR(21) PRIMARY KEY,
  xbox_game_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_art VARCHAR(255),
  genre VARCHAR(100),
  publisher VARCHAR(255),
  developer VARCHAR(255),
  release_date TIMESTAMP,
  xbox_store_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price History Table
CREATE TABLE price_history (
  id VARCHAR(21) PRIMARY KEY,
  game_id VARCHAR(21) NOT NULL REFERENCES games(id),
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(5, 2) DEFAULT 0,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, date)
);

-- Predictions Table
CREATE TABLE predictions (
  id VARCHAR(21) PRIMARY KEY,
  game_id VARCHAR(21) NOT NULL REFERENCES games(id),
  next_sale_date TIMESTAMP NOT NULL,
  estimated_discount DECIMAL(5, 2) NOT NULL,
  estimated_price DECIMAL(10, 2) NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  sale_interval_days INTEGER,
  analysis_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Wishlists
CREATE TABLE wishlists (
  id VARCHAR(21) PRIMARY KEY,
  user_id VARCHAR(21) NOT NULL REFERENCES users(id),
  game_id VARCHAR(21) NOT NULL REFERENCES games(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- User Favorites
CREATE TABLE user_favorites (
  id VARCHAR(21) PRIMARY KEY,
  user_id VARCHAR(21) NOT NULL REFERENCES users(id),
  game_id VARCHAR(21) NOT NULL REFERENCES games(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- User Alerts
CREATE TABLE user_alerts (
  id VARCHAR(21) PRIMARY KEY,
  user_id VARCHAR(21) NOT NULL REFERENCES users(id),
  game_id VARCHAR(21),
  alert_type ENUM('PRICE_DROP', 'UPCOMING_SALE', 'GENERAL'),
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes Structure

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
│
├── /games
│   ├── GET /              (Get all games)
│   ├── GET /search        (Search by title)
│   ├── GET /genre/:genre  (Get by genre)
│   ├── GET /:id           (Get game details)
│   ├── GET /:id/price-history
│   └── GET /:id/price-stats
│
├── /predictions
│   ├── GET /upcoming      (Get upcoming sales)
│   ├── GET /:gameId       (Get prediction for game)
│   └── POST /:gameId/calculate
│
├── /users
│   ├── GET /wishlist
│   ├── GET /favorites
│   └── POST /alerts
│
└── /admin
    ├── GET /dashboard
    ├── POST /sync
    └── GET /logs
```

## Data Flow

### User Search Flow

```
1. User enters search query in frontend
   ↓
2. Frontend sends GET /api/games/search?q=query
   ↓
3. Backend rate limiting middleware checks
   ↓
4. GameController.searchGames() executes
   ↓
5. GameService.searchGames() queries database
   ↓
6. Prisma executes SQL query on PostgreSQL
   ↓
7. Results cached in Redis
   ↓
8. Response returned to frontend with data
   ↓
9. Frontend displays results with cover art
```

### Prediction Calculation Flow

```
1. Backend scheduler runs daily at 2 AM (node-cron)
   ↓
2. predictionCalculationJob() starts
   ↓
3. Get all games with price history (>3 records)
   ↓
4. For each game:
   ├── Get all price records
   ├── Filter sales (discount > 0)
   ├── Calculate intervals between sales
   ├── Calculate average discount
   ├── Detect seasonal patterns
   ├── Calculate confidence score
   ├── Predict next sale date
   └── Estimate discount and price
   ↓
5. Save prediction to database
   ↓
6. Check if upcoming sales match user alerts
   ↓
7. Send email notifications
   ↓
8. Update sync log with status
```

## Caching Strategy

```
Cache Layer (Redis):

Key Patterns:
- games:search:{query}        → Search results (5 min TTL)
- games:{id}:priceHistory     → Price history (1 hour TTL)
- games:{id}:prediction       → Predictions (4 hours TTL)
- games:list:{page}           → Game listings (30 min TTL)
- predictions:upcoming        → Upcoming sales (1 hour TTL)

Invalidation Events:
- New price record → Invalidate game cache
- New prediction → Invalidate upcoming cache
- User login → Create session cache
```

## Security Architecture

```
┌──────────────────────────────────────────┐
│   SSL/TLS Encryption (HTTPS)             │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│   Rate Limiting & DDoS Protection        │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│   JWT Token Validation                   │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│   Request Validation (Zod)               │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│   SQL Injection Prevention (Prisma)      │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│   Password Hashing (Bcrypt)              │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│   CORS & CSP Headers                     │
└──────────────────────────────────────────┘
```

## Performance Optimization

1. **Database Indexing**: Applied on frequently searched columns
2. **Query Caching**: Redis layer for common queries
3. **Pagination**: Large result sets are paginated
4. **Connection Pooling**: Database connections are pooled
5. **Image Optimization**: Lazy loading and CDN delivery
6. **Code Splitting**: Next.js automatic code splitting
7. **Compression**: Gzip compression for responses

## Scalability Considerations

- **Horizontal Scaling**: Stateless API design allows load balancing
- **Database Replication**: Master-slave setup for read scaling
- **Caching Layer**: Redis for frequently accessed data
- **Async Jobs**: node-cron for background tasks
- **CDN**: Static assets served from CDN
- **Microservices**: Future expansion into separate services
