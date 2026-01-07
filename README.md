# Nutrition Tracker

A full-stack nutrition tracking application with user authentication.

## Features
- User authentication with username/password
- Multiple user profiles per account
- Set calorie and macro goals (protein, carbs, fat)
- Track optional micronutrients (cholesterol, sodium, sugar)
- Log food entries with detailed nutrition info
- View daily progress toward goals
- Navigate between different days
- Dark/light theme support

## Prerequisites
- [Node.js v18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Quick Start

### 1. Start the Database
```bash
docker compose up -d
```

### 2. Set Up Backend
```bash
cd backend
npm install

# Create .env file with:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/nutrition_tracker?schema=public"
# PORT=3001

npx prisma migrate dev
npm run dev
```

### 3. Set Up Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

The app will open at http://localhost:3000

## First Time Use
1. Register a new account
2. Create your first user profile
3. Set your nutrition goals
4. Start logging food!

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL (Docker)
