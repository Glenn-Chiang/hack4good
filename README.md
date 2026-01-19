# hack4good

## Backend Setup

### Prerequisites

- Install Go
- Install Docker + Docker Compose

### Steps

In backend directory:

1. Start PostgreSQL database:
   `docker compose up -d`

2. Create `.env` file with:

```
DATABASE_URL=postgresql://devuser:devpassword@host.docker.internal:5432/hack4good
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

3. Install dependencies:
   `go mod tidy`

4. Run server:
   `go run ./cmd/main.go`

## Frontend Setup

### Prerequisites

- Install Node.js (v18+ recommended)
- npm (comes with Node.js)

### Steps

From the frontend/ directory:

1. Install dependencies
   npm install

2. Create .env file in frontend/ (if needed)

If your frontend reads the backend URL from env (e.g. Vite / React):

```
VITE_API_BASE_URL=http://localhost:8080
```

3. Run the dev server
   `npm run dev`

Frontend will start on something like:

```
http://localhost:3000
```
