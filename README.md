# TaskMaster - Task Management System

A production-quality, end-to-end Task Management System built with the MERN stack and TypeScript. It features role-based access control, task assignment with email notifications, dynamic status tracking, and a modern, responsive UI.

## Features
- **Role-Based Dashboards**: Separate views and permissions for `admin` and `employee`.
- **Employee Management**: Admins can add, list, and activate/deactivate employees.
- **Task Management**: Full CRUD for tasks. Admins can assign tasks, filter, and track statuses.
- **Dynamic Late Calculation**: Tasks are automatically flagged as "Late" or "Completed Late" without mutating database statuses unnecessarily.
- **Email Notifications**: Employees receive an email when a new task is assigned (using Nodemailer).
- **Secure Authentication**: JWT-based authentication, bcrypt password hashing, rate-limiting on login.
- **Modern UI**: Built with React, Tailwind CSS v4, Lucide icons, and a custom component library.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, React Router v6, Axios, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JSON Web Tokens (JWT), Nodemailer.

## Folder Structure
```text
task-management/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI & Layout components
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Route pages (Admin & Employee)
│   │   └── services/    # API (Axios) configuration
│   └── .env.example
└── server/          # Express backend
    ├── src/
    │   ├── config/      # Database config
    │   ├── controllers/ # Route handlers
    │   ├── middleware/  # Auth & Error handling
    │   ├── models/      # Mongoose schemas
    │   ├── routes/      # API routes
    │   └── services/    # Email service
    └── .env.example
```

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Install
Install dependencies for both client and server:
```bash
# In the server directory
cd server
npm install

# In the client directory
cd ../client
npm install
```

### 2. Environment Variables
Copy the `.env.example` to `.env` in both `client` and `server` folders and fill in the values.

**Server (.env)**
- `PORT`: 5000
- `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://127.0.0.1:27017/task_management`)
- `JWT_SECRET`: A secure random string for signing tokens.
- `SMTP_*`: Credentials for Nodemailer. By default, we use Ethereal Email for development.

**Client (.env)**
- `VITE_API_URL`: `http://localhost:5000/api`

### 3. Database Seeding
To populate the database with an Admin user, sample employees, and dummy tasks:
```bash
cd server
npm run seed
```
*Note: This clears existing data in the collections. The seed credentials are for development only.*
- **Admin**: `admin@example.com` / `Admin@123`
- **Employee**: `john@example.com` / `password123`

### 4. Running the Application
Run the backend and frontend simultaneously in separate terminals:

**Terminal 1 (Backend)**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173`.

## API Overview
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile
- `GET/POST /api/users` - Admin employee management
- `GET/POST/PATCH/DELETE /api/tasks` - Task management (Admin/Employee restrictions apply)
- `GET /api/dashboard/:role` - Statistical aggregates for dashboard cards

## Security Notes
- Passwords are hashed using `bcryptjs`.
- JWT tokens are validated via middleware for all protected routes.
- Admin routes are protected by a secondary role-check middleware.
- Stack traces are hidden from API responses in production environments.
