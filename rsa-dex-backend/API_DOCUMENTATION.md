# RSA DEX API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "trader123",
  "password": "securepassword",
  "walletAddress": "RSA1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1234567890",
      "username": "trader123",
      "walletAddress": "RSA1234567890abcdef..."
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "trader123",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1234567890",
      "username": "trader123",
      "walletAddress": "RSA1234567890abcdef..."
    }
  }
}
```

### Connect Wallet
```http
POST /auth/connect-wallet
```

**Request Body:**
```json
{
  "walletAddress": "RSA1234567890abcdef...",
  "signature": "signature_data",
  "message": "message_to_sign"
}
```

## Market Data Endpoints

### Get Available Markets
```http
GET /api/markets
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "pair": "RSA/USDT",
      "baseAsset": "RSA",
      "quoteAsset": "USDT",
      "minOrderSize": 0.001,
      "pricePrecision": 8,
      "amountPrecision": 6
    },
    {
      "pair": "RSA/BTC",
      "baseAsset": "RSA",
      "quoteAsset": "BTC",
      "minOrderSize": 0.001,
      "pricePrecision": 8,
      "amountPrecision": 6
    }
  ]
}
```

### Get Market Ticker
```http
GET /api/markets/RSA/USDT/ticker
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pair": "RSA/USDT",
    "lastPrice": 0.25,
    "bestBid": 0.249,
    "bestAsk": 0.251,
    "volume24h": 15000.5,
    "change24h": 2.5,
    "high24h": 0.26,
    "low24h": 0.24
  }
}
```

### Get Order Book
```http
GET /api/markets/RSA/USDT/orderbook?limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pair": "RSA/USDT",
    "bids": [
      {
        "price": 0.249,
        "amount": 100.5,
        "total": 100.5
      },
      {
        "price": 0.248,
        "amount": 200.0,
        "total": 300.5
      }
    ],
    "asks": [
      {
        "price": 0.251,
        "amount": 150.0,
        "total": 150.0
      },
      {
        "price": 0.252,
        "amount": 75.5,
        "total": 225.5
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Recent Trades
```http
GET /api/markets/RSA/USDT/trades?limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "12345",
      "pair": "RSA/USDT",
      "price": 0.25,
      "amount": 100.0,
      "side": "buy",
      "timestamp": "2024-01-15T10:29:45.000Z"
    },
    {
      "id": "12344",
      "pair": "RSA/USDT",
      "price": 0.249,
      "amount": 50.5,
      "side": "sell",
      "timestamp": "2024-01-15T10:29:30.000Z"
    }
  ]
}
```

## Trading Endpoints

### Place Order
```http
POST /api/orders
Authorization: Bearer <token>
```

**Request Body (Limit Order):**
```json
{
  "pair": "RSA/USDT",
  "side": "buy",
  "type": "limit",
  "amount": "100.0",
  "price": "0.25"
}
```

**Request Body (Market Order):**
```json
{
  "pair": "RSA/USDT",
  "side": "sell",
  "type": "market",
  "amount": "50.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67890",
    "userId": "1234567890",
    "pair": "RSA/USDT",
    "side": "buy",
    "type": "limit",
    "amount": 100.0,
    "price": 0.25,
    "filled": 0,
    "remaining": 100.0,
    "status": "open",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get User Orders
```http
GET /api/orders?status=open&pair=RSA/USDT&limit=50&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67890",
      "userId": "1234567890",
      "pair": "RSA/USDT",
      "side": "buy",
      "type": "limit",
      "amount": 100.0,
      "price": 0.25,
      "filled": 0,
      "remaining": 100.0,
      "status": "open",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Specific Order
```http
GET /api/orders/67890
Authorization: Bearer <token>
```

### Cancel Order
```http
DELETE /api/orders/67890
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67890",
    "status": "cancelled",
    "cancelledAt": "2024-01-15T10:35:00.000Z"
  }
}
```

## Trade History

### Get User Trades
```http
GET /api/trades?pair=RSA/USDT&limit=50&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "12345",
      "pair": "RSA/USDT",
      "price": 0.25,
      "amount": 100.0,
      "side": "buy",
      "buyOrderId": "67890",
      "sellOrderId": "67891",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Wallet Endpoints

### Get Wallet Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "RSA": 1000.0,
    "USDT": 500.0,
    "BTC": 0.1
  }
}
```

### Transfer Assets
```http
POST /api/wallet/transfer
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "toAddress": "RSA0987654321fedcba...",
  "amount": "100.0",
  "asset": "RSA"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x1234567890abcdef...",
    "fromAddress": "RSA1234567890abcdef...",
    "toAddress": "RSA0987654321fedcba...",
    "amount": "100.0",
    "asset": "RSA",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## WebSocket API

### Connection
Connect to WebSocket endpoint:
```
ws://localhost:8000
```

### Subscribe to Market Updates
```json
{
  "type": "subscribe",
  "channel": "orderbook",
  "pair": "RSA/USDT"
}
```

### Subscribe to Trades
```json
{
  "type": "subscribe",
  "channel": "trades",
  "pair": "RSA/USDT"
}
```

### Subscribe to Ticker
```json
{
  "type": "subscribe",
  "channel": "ticker",
  "pair": "RSA/USDT"
}
```

### Unsubscribe
```json
{
  "type": "unsubscribe",
  "channel": "orderbook",
  "pair": "RSA/USDT"
}
```

### Ping
```json
{
  "type": "ping"
}
```

## WebSocket Events

### Trade Event
```json
{
  "type": "trade",
  "data": {
    "id": "12345",
    "pair": "RSA/USDT",
    "price": 0.25,
    "amount": 100.0,
    "side": "buy",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Order Book Update
```json
{
  "type": "orderbook",
  "data": {
    "pair": "RSA/USDT",
    "bids": [...],
    "asks": [...],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Ticker Update
```json
{
  "type": "ticker",
  "data": {
    "pair": "RSA/USDT",
    "lastPrice": 0.25,
    "bestBid": 0.249,
    "bestAsk": 0.251,
    "volume24h": 15000.5,
    "change24h": 2.5
  }
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Missing required fields: pair, side, type, amount"
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Access token required"
}
```

### Order Error
```json
{
  "success": false,
  "error": "Insufficient balance"
}
```

## Rate Limits

- API endpoints: 100 requests per minute per IP
- WebSocket connections: 10 connections per IP
- Order placement: 50 orders per minute per user

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error 