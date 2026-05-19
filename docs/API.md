# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}

Response: 201
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGc..."
  }
}
```

### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: 200
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "eyJhbGc..."
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

## Games Endpoints

### Get All Games

```http
GET /games?page=1&limit=20

Response: 200
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 500,
    "page": 1,
    "pages": 25
  }
}
```

### Search Games

```http
GET /games/search?q=halo&limit=5

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "game123",
      "title": "Halo Infinite",
      "genre": "FPS",
      "coverArt": "https://...",
      "priceHistory": [
        {
          "price": 59.99,
          "date": "2025-01-19T00:00:00Z"
        }
      ]
    }
  ]
}
```

### Get Game by ID

```http
GET /games/game123

Response: 200
{
  "success": true,
  "data": {
    "id": "game123",
    "xboxGameId": "xbox-12345",
    "title": "Halo Infinite",
    "description": "Experience an epic gaming adventure...",
    "coverArt": "https://...",
    "genre": "First-Person Shooter",
    "publisher": "343 Industries",
    "developer": "343 Industries",
    "releaseDate": "2021-12-08T00:00:00Z",
    "xboxStoreUrl": "https://www.xbox.com/...",
    "priceHistory": [...],
    "predictions": [...]
  }
}
```

### Get Games by Genre

```http
GET /games/genre/FPS?page=1&limit=20

Response: 200
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### Get Price History

```http
GET /games/game123/price-history?days=365

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "price123",
      "gameId": "game123",
      "price": 59.99,
      "discount": 0,
      "date": "2025-01-19T00:00:00Z"
    },
    {
      "id": "price124",
      "gameId": "game123",
      "price": 29.99,
      "discount": 50,
      "date": "2024-12-20T00:00:00Z"
    }
  ]
}
```

### Get Price Statistics

```http
GET /games/game123/price-stats

Response: 200
{
  "success": true,
  "data": {
    "currentPrice": 59.99,
    "lowestPrice": 19.99,
    "highestPrice": 79.99,
    "averagePrice": 45.00,
    "medianPrice": 44.99,
    "averageDiscount": 35.5,
    "discountFrequency": 45.5,
    "avgDaysBetweenSales": 45,
    "totalRecords": 110
  }
}
```

---

## Predictions Endpoints

### Get Prediction for Game

```http
GET /predictions/game123

Response: 200
{
  "success": true,
  "data": {
    "id": "pred123",
    "gameId": "game123",
    "nextSaleDate": "2025-02-15T00:00:00Z",
    "estimatedDiscount": 35,
    "estimatedPrice": 38.99,
    "confidence": 85,
    "saleIntervalDays": 45,
    "analysisMetadata": {
      "totalSales": 8,
      "avgInterval": 45,
      "priceVolatility": 2.15,
      "seasonalPattern": "holiday"
    }
  }
}
```

### Calculate Prediction

```http
POST /predictions/game123/calculate

Response: 200
{
  "success": true,
  "message": "Prediction calculated successfully",
  "data": {...}
}
```

### Get Upcoming Sales

```http
GET /predictions/upcoming?limit=10

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "pred123",
      "gameId": "game123",
      "game": {
        "id": "game123",
        "title": "Halo Infinite",
        "coverArt": "https://...",
        "genre": "FPS"
      },
      "nextSaleDate": "2025-02-15T00:00:00Z",
      "estimatedDiscount": 35,
      "estimatedPrice": 38.99,
      "confidence": 85
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error: Email is required"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Game not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth Routes**: 5 requests per 15 minutes
- **Search**: 30 requests per 1 minute

---

## Example Requests

### JavaScript/Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Search games
const games = await api.get('/games/search', {
  params: { q: 'halo' }
});

// Get game details
const game = await api.get('/games/game123');

// Get prediction
const prediction = await api.get('/predictions/game123');
```

### cURL

```bash
# Search games
curl "http://localhost:3001/api/games/search?q=halo"

# Get game
curl "http://localhost:3001/api/games/game123"

# Get prediction
curl "http://localhost:3001/api/predictions/game123"
```
