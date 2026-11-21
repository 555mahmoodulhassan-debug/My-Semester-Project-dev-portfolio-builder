# DevPortfolio Builder

React + Vite frontend, Node.js + Express API, and MongoDB database.

## Requirements
- Node.js 18 or newer
- MongoDB Atlas account (or local MongoDB)

## Setup
1. Extract this ZIP and open the project folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. In `.env`, set `MONGODB_URI` to your MongoDB Atlas connection string and change `JWT_SECRET`.
5. In MongoDB Atlas, allow your current IP address in Network Access and create a database user.
6. Run `npm run dev`.
7. Open http://localhost:5173 and create an account.

The root `npm run dev` command starts both Vite (5173) and the Express API (5000).
MongoDB is the only database used. If MongoDB is not configured or running, the UI/server can start, but signup/login and saved data will not work until the database connection succeeds.

## Main pages
Login, Signup, Dashboard, Profile, Projects, Skills, Experience, Education, Templates, Messages, Settings.

## API
- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/items`
- `PUT/DELETE /api/items/:id`

Passwords are hashed with bcryptjs. API routes for personal data require a JWT.
