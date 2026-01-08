Leave Portal

Monorepo scaffold for Leave management app.

Workspaces:
- backend: Express + Mongoose (connect to MongoDB Atlas later)
- frontend: Vite + React + Tailwind + Material UI + Redux + Saga

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

Notes
- MongoDB Atlas and Redis connection strings go into backend/.env (example provided).
- The APIs are stubbed so UI and flows can be developed before the DB is connected.
- Redis (caching/session) support is available and configured via `REDIS_URL` environment variable; caching is used for leave lists and balances when available.
