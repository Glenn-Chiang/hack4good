# CareConnect
## Problem Statement
TSAO 2 - Caregivers
Develop a solution that improves relationships between caregiver and the care recipient so that caregivers can provide the care that the care recipients want/need in a mutually respectful, meaningful and joyful way.

## Features
CareConnect is a caregiving support platform that connects caregivers and recipients through a request-and-accept workflow. 
Key features include:

- **Care request & acceptance workflow**
  - Caregivers send care requests and recipients can accept or reject them, ensuring consent and trust from the start before access is granted.

- **Recipient profiles (likes, dislikes, phobias, pet peeves, condition, age)**
  - Helps caregivers better understand the recipient’s personality and needs, enabling more thoughtful and personalized care.

- **Recipient journal entries**
  - Gives recipients a safe, structured way to express feelings and document daily experiences, improving emotional support and strengthening caregiver-recipient rapport.

- **Caregiver comments on journal entries**
  - Enables caregivers to respond, encourage, and communicate directly within the recipient’s updates, fostering connection and reassurance.

- **Caregiver todo / task management**
  - Allows caregivers to track and manage care-related responsibilities (with priority and due dates), reducing missed tasks and improving day-to-day coordination.


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
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/hack4good
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
VITE_BACKEND_URL=http://localhost:8080
```

3. Run the dev server
   `npm run dev`

Frontend will start on something like:

```
http://localhost:3000
```
