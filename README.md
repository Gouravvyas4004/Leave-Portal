Leave Portal – Monorepo

A full-stack Leave Management System built with modern MERN stack tools.
Designed for employees, managers, and admins to manage leave requests efficiently.

Tech Stack
Frontend
React (Vite)
Redux Toolkit
Redux Saga
Tailwind CSS
Material UI

Backend
Node.js
Express.js
MongoDB (Mongoose)
Redis (Caching & Sessions)

📂 Monorepo Structure
```
leave-portal/
│
├── backend/      # Express + MongoDB + Redis
├── frontend/     # React + Redux + Saga
└── README.md
```

Quick start (after installing dependencies):

Backend
```
cd backend
npm install
npm run dev
```

Frontend
```
cd frontend
npm install
npm run dev
```

Features
Employee
Apply for leave
View leave history
Check leave balance
Real-time status updates

Manager / Admin
View all employees
Approve / Reject leave requests
Dashboard KPIs
Employee-wise leave history

System
Role-based dashboards
Persistent login
Caching using Redis
Auto-refresh leave data
Scalable architecture

Environment Variables
Create .env file inside backend/
```
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

REDIS_URL=your_redis_connection_string

JWT_SECRET=your_secret_key
```

Notes
- MongoDB Atlas and Redis connection strings go into backend/.env (example provided).
- The APIs are stubbed so UI and flows can be developed before the DB is connected.
- Redis (caching/session) support is available and configured via `REDIS_URL` environment variable; caching is used for leave lists and balances when available.

Future Improvements:
Role-based route protection
Email notifications
Leave analytics
Export reports
Multi-organization support
Mobile responsive UI

Author
Gourav Vyas
