# TaskFlow AI - Capstone MVP

TaskFlow AI is a lightweight, AI-assisted project and task management SaaS built specifically for students, freelancers, and small teams. It leverages Google Gemini AI for contextual subtask generation, project health diagnostics, and daily scheduling.

## 🚀 Technology Stack
- **Frontend:** React, Vite, Tailwind CSS (v4), TypeScript, Recharts, Lucide Icons, Axios, React Hook Form, Zod.
- **Backend:** Node.js, Express, TypeScript, Mongoose, JWT, bcrypt, helmet, compression, express-validator.
- **Database:** MongoDB Atlas (Cloud).
- **AI Core:** Google Gemini API.

## 📂 Repository Layout
- `backend/`: Node.js Express server routing APIs and database adapters.
- `frontend/`: Single Page Application (SPA) compiled via Vite React.

## 🛠️ Getting Started
Ensure you have Node.js and MongoDB installed locally.

### Env Configurations
1. Create `backend/.env` using the fields mapped in `backend/.env.example`.
2. Connect to local database or Atlas connection pools.

### Local Development Start
```bash
# Terminal 1: Run Express Server
cd backend
npm install
npm run dev

# Terminal 2: Run React Client
cd frontend
npm install
npm run dev
```
