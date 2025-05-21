# Cocos Challenge Backend

This project is a backend service built with [NestJS](https://nestjs.com), simulating a financial market where users can place buy/sell orders, view their portfolios, and search for financial instruments.

## 🚀 Requirements

- Node.js
- Docker and Docker Compose (for local environment)

---

## 🛠 Installation

```bash
$ npm install
```

## ▶️ Running the Project

## 🌍 Environment Variables

You can find an example file in `.env.example` (.env.local is provided already configured for local)

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SSL=false ## Important: MUST BE 'true' FOR DEVELOPMENT
```

.env.local is provided already configured for local

### 🔁 Local Mode (with Docker and `.env.local`)

This mode uses `docker-compose.yml` to spin up dependencies like PostgreSQL.

```bash
# Start Docker containers
docker-compose up -d

# Start the NestJS app in watch mode with local environment
npm run start:local
```

### 🔁 Development Mode (with AWS database and `.env.development`)

```bash
# Start the NestJS app in watch mode with dev environment
npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## 📬 Postman Collection

A Postman collection is included for tests endpoints.

**The folder is in the root directory and is called "collections". It contains the environment variables and the endpoint collection.**

## 📚 API Endpoints Documentation

---

## 1. POST `/api/orders`

Creates a new order with the following JSON payload:

```json
{
	"instrumentId": 53,
	"userId": 1,
	"size": 2,
	"side": "BUY",
	"price": 10,
	"type": "MARKET"
}
```

### Field explanations:

- **userId**:  
  The ID of the user placing the order.

- **instrumentId**:  
  The ID of the financial instrument (stock or currency).

- **side**:  
  The type of order operation:

    - `BUY` or `SELL` for stock orders,
    - `CASH_IN` or `CASH_OUT` for cash deposit/withdrawal operations.

- **type**:  
  Order execution type:

    - `MARKET` orders execute immediately at the latest market price.
    - `LIMIT` orders are placed with a price limit and remain open until matched or canceled.

- **size**:  
  Number of shares/units the user wants to buy or sell.

- **price** (required for `LIMIT` orders):  
  The limit price per share at which the order should be executed.

- **amount** (optional):  
  Total investment amount in pesos (ARS).
    - Only allowed for `MARKET` orders of type `BUY`.
    - If provided, the system calculates the maximum whole number of shares that can be purchased with this amount; fractional shares are not allowed.
    - Cannot be combined with `size` in the same order.

###

---

## 2. GET `/api/search?`

Search for financial instruments by:

The endpoint returns a list of instruments matching the search query (ticker or instrument or both)

**Example:**
`GET /api/instruments?name=''&ticker=''`

---

## 3. GET `/api/portfolio/:userId`

Retrieves a summary of the user's portfolio including:

- Available cash balance
- Total portfolio value (cash plus all asset holdings)
- Detailed list of asset positions, each including:
    - Instrument
    - Quantity of assets
    - Total value of the position
    - Performance percentage

**Example:**
`GET /api/portfolio/1`

## 4. PATCH `/api/orders/:orderId/cancel`

Cancels an existing order by its ID.

- Only orders that have status `NEW` **and** are of type `LIMIT` can be canceled.
- If the order does not exist, or if it is not in `NEW` status or not a `LIMIT` order, the API will return an error.
- Upon successful cancellation, the order status is updated to `CANCELLED`.
- This endpoint allows users to withdraw open limit orders before execution.

### Example request

```http
PATCH /api/orders/123/cancel
```
