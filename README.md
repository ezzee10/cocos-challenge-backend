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

You can find an example file in `.env.example`:

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
```

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

A Postman collection is included with sample requests for the main endpoints.

## 📚 Available Endpoints

| Method | Endpoint                                    | Description                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| POST   | `/api/orders`                               | Create a buy/sell/cash_in/cash_out order |
| GET    | `/api/instruments/search?name=''&ticker=''` | Search financial instruments             |
| GET    | `/api/portfolio/:userId`                    | Get user's portfolio                     |
