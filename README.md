# Nutrition Tracker

A full-stack nutrition tracking application built with React, TypeScript, Express, Prisma, and PostgreSQL.

## Features
- Set calorie and macro goals
- Log food entries with detailed nutrition info
- Track optional micronutrients (cholesterol, sodium, sugar)
- View daily progress toward goals
- Navigate between different days
- Dark/light theme support

## Setup

### Prerequisites
- Node.js v18+
- Docker Desktop

### Installation

1. Clone the repository
2. Start the database:
```bash
   docker compose up -d
```

3. Install and run backend:
```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
```

4. Install and run frontend:
```bash
   cd frontend
   npm install
   npm start
```

The app will be available at http://localhost:3000

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
