# News Portal Web Application

A modern, scalable full-stack News Portal Web Application designed as a senior-level production project.

## Features

- **Role-Based Access Control (RBAC):** Admin, Sub-Admin, and User roles.
- **Admin Dashboard:** Total counts, recent articles, manage categories, user management.
- **News Management:** Upload news articles with featured images, videos, and categories.
- **Real-time Feed:** Users can browse the latest news, watch videos, read full articles, and view a breaking news ticker.
- **Authentication:** Secure JWT/OAuth/session-based login with password hashing.

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Storage:** Cloudinary for media uploads

## Project Structure

This project is a monorepo consisting of two main directories:
- `/frontend`: Next.js application.
- `/backend`: Express.js server.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (local or Atlas)
- Cloudinary account

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the backend server:
   ```bash
   npm start
   # or for development
   node server.js
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` directory and add:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Architecture Details

The project utilizes clean architecture and reusable components:
- **Backend:** Models, Routes, Controllers, and Middleware are neatly separated.
- **Frontend:** Next.js `app` router for fast server-side rendering, standard React functional components, and standard utility-first Tailwind styling.
