<div align="center">
  
  # 🚀 TaskFlow AI
  
  **An AI-powered intelligent project management platform that helps teams organize work, analyze productivity, automate planning, and gain actionable insights using Google Gemini AI.**
  
  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square" alt="Recharts" />
    <img src="https://img.shields.io/github/license/MaybeSomeone-arc18/taskflow-ai?style=flat-square" alt="License" />
    <img src="https://img.shields.io/github/stars/MaybeSomeone-arc18/taskflow-ai?style=flat-square" alt="Stars" />
    <img src="https://img.shields.io/github/forks/MaybeSomeone-arc18/taskflow-ai?style=flat-square" alt="Forks" />
    <img src="https://img.shields.io/github/issues/MaybeSomeone-arc18/taskflow-ai?style=flat-square" alt="Issues" />
    <img src="https://img.shields.io/github/last-commit/MaybeSomeone-arc18/taskflow-ai?style=flat-square" alt="Last Commit" />
    <img src="https://img.shields.io/github/repo-size/MaybeSomeone-arc18/taskflow-ai?style=flat-square" alt="Repo Size" />
  </p>

  <h3>✨ Live Demo: <a href="#">Coming Soon</a></h3>
</div>

---

## 📑 Table of Contents

<details>
<summary>Click to expand</summary>

- [Overview](#-overview)
- [Why TaskFlow AI?](#-why-taskflow-ai)
- [Features](#-features)
- [System Design & Architecture](#-system-design--architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Run Project](#-run-project)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [AI Workflow & Features](#-ai-workflow--features)
- [Performance](#-performance)
- [Future Vision & Roadmap](#-future-vision--roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Developer](#-developer)

</details>

---

## 🔭 Overview

**TaskFlow AI** is a next-generation project management tool built for modern teams. Moving beyond simple task tracking, TaskFlow AI leverages the power of Google Gemini AI to act as a proactive project manager—helping you break down complex projects, prioritize work intelligently, and analyze productivity trends. 

From its premium glassmorphism UI to its deeply integrated AI capabilities, TaskFlow AI provides a seamless workspace to manage everything from daily to-dos to large-scale team projects.

---

## 🏆 Why TaskFlow AI?

While platforms like Trello, Notion, and ClickUp are powerful, TaskFlow AI differentiates itself through **native AI integration** and a **premium, distraction-free aesthetic**.

- **AI-First Design:** It doesn't just store your tasks; it analyzes them. Gemini AI automatically suggests priority levels, identifies bottlenecks, and helps break down vague goals into actionable subtasks.
- **Productivity Analytics:** Deep insights into how you work, complete with beautiful visualizations powered by Recharts.
- **Premium UX:** Built to feel like a high-end macOS application or top-tier SaaS (Linear/Raycast style) with smooth Framer Motion animations, customizable accent colors, and persistent Dark Mode.

---

## ✨ Features

| Feature | Description | Status | Examples |
|:---|:---|:---:|:---|
| **Authentication** | Secure JWT-based login & registration with bcrypt | ✅ | `POST /api/v1/auth/login` |
| **AI Planner** | Gemini-powered task breakdown and prioritization | ✅ | Generates sub-tasks from prompts |
| **Analytics** | Beautiful, interactive charts tracking productivity | ✅ | Weekly task completion charts |
| **Kanban Board** | Intuitive drag & drop interface for workflow management | ✅ | Move tasks from Todo to Done |
| **Responsive UI** | Flawless experience across desktop, tablet, and mobile | ✅ | Collapsible sidebar, flex grids |
| **Dark Mode** | Persistent system/light/dark themes with glassmorphism | ✅ | Controlled via settings tab |
| **Theme Customization** | Customizable accent colors, font sizes, and layout density | ✅ | Saved to `localStorage` |
| **Workspace** | Create, manage, and archive complex projects | ✅ | Multi-project organization |
| **Notifications** | Real-time in-app notification center | 🚧 | *Coming Soon* |
| **Search** | Global command-palette style search | 🚧 | *Coming Soon (Ctrl+K)* |

---

## 📊 System Design & Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │                      REACT UI                          │
 │  (Vite, Tailwind, Framer Motion, React Router, Axios)  │
 └──────────────────────────┬─────────────────────────────┘
                            │ (RESTful JSON over HTTP)
 ┌──────────────────────────▼─────────────────────────────┐
 │                     API LAYER                          │
 │      (Authentication, Input Validation, Routing)       │
 └──────────────────────────┬─────────────────────────────┘
                            │
 ┌──────────────────────────▼─────────────────────────────┐
 │                   EXPRESS SERVER                       │
 │      (Node.js, Controllers, Services, Middleware)      │
 └─────────────┬───────────────────────────┬──────────────┘
               │                           │
 ┌─────────────▼──────────────┐  ┌─────────▼──────────────┐
 │          DATABASE          │  │        AI ENGINE       │
 │   (MongoDB & Mongoose)     │  │ (Google Gemini API)    │
 └────────────────────────────┘  └────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript (via Vite)
- **Styling:** Tailwind CSS (v4)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Networking:** Axios with global interceptors
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ORM/ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **AI Integration:** `@google/genai` (Gemini API)
- **Language:** TypeScript

---

## 📁 Project Structure

```text
taskflow-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers (e.g., auth.controller.ts)
│   │   ├── middleware/     # Custom Express middleware (e.g., auth, errors)
│   │   ├── models/         # Mongoose schemas (User, Task, Project)
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Business logic (e.g., AI integration)
│   │   ├── app.ts          # Express app configuration
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components (Buttons, Cards, Inputs)
    │   ├── context/        # React Contexts (Auth, Theme, Notifications)
    │   ├── hooks/          # Custom React hooks
    │   ├── layouts/        # Page layouts (Sidebar, Header)
    │   ├── pages/          # Main application views (Dashboard, Settings, etc.)
    │   ├── services/       # API integration layer
    │   ├── types/          # TypeScript interfaces
    │   ├── utils/          # Helper functions
    │   ├── App.tsx         # Root component & routing
    │   └── index.css       # Global styles & Tailwind config
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## 🚀 Installation

Follow these steps to get the project running locally.

**1. Clone the repository**
```bash
git clone https://github.com/MaybeSomeone-arc18/taskflow-ai.git
cd taskflow-ai
```

**2. Install Frontend Dependencies**
```bash
cd frontend
npm install
```

**3. Install Backend Dependencies**
```bash
cd ../backend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory and populate it with the following:

| Variable | Description | Example |
|:---|:---|:---|
| `PORT` | The port for the Express server | `5000` |
| `MONGO_URI` | Your MongoDB connection string | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_super_secret_key_123` |
| `GEMINI_API_KEY` | Google Gemini API Key for AI features | `AIzaSy...` |
| `CLIENT_URL` | The URL of your frontend application | `http://localhost:5173` |

---

## ⚡ Run Project

You will need two terminal windows to run both the frontend and backend simultaneously.

### Development

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the output from the `dist/` folder using Nginx, Vercel, or a static server.
```

---

## 🌐 API Endpoints

<details>
<summary><b>View Core API Endpoints</b></summary>

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| **POST** | `/api/v1/auth/register` | Register a new user | ❌ |
| **POST** | `/api/v1/auth/login` | Authenticate user & get JWT | ❌ |
| **GET**  | `/api/v1/auth/me` | Get current logged-in user profile | ✅ |
| **PUT**  | `/api/v1/auth/password` | Change account password | ✅ |
| **GET**  | `/api/v1/projects` | Get all workspace projects | ✅ |
| **POST** | `/api/v1/projects` | Create a new project | ✅ |
| **GET**  | `/api/v1/tasks` | Get all tasks (supports filtering) | ✅ |
| **POST** | `/api/v1/tasks` | Create a new task | ✅ |
| **PUT**  | `/api/v1/tasks/:id` | Update a task (status, priority, etc) | ✅ |
| **DELETE**| `/api/v1/tasks/:id` | Delete a task | ✅ |
| **POST** | `/api/v1/ai/plan` | Generate AI task breakdowns | ✅ |
| **GET**  | `/api/v1/analytics` | Get user productivity metrics | ✅ |

</details>

---

## 🛡️ Authentication

TaskFlow AI uses a secure stateless authentication flow using JSON Web Tokens (JWT).

```text
[ User ] 
   │
   ├─ (1) Submits Email/Password
   ▼
[ Express API ]
   │
   ├─ (2) `bcrypt.compare()` validates hash
   ├─ (3) Generates signed JWT
   ▼
[ Frontend ]
   │
   ├─ (4) Stores JWT in LocalStorage
   ├─ (5) Attaches `Authorization: Bearer <token>` to Axios Interceptor
   ▼
[ Protected API Routes ] ── (6) Validates JWT signature ──► [ Access Granted ]
```

---

## 🧠 AI Workflow & Features

TaskFlow AI seamlessly integrates **Google Gemini** to elevate your workflow from passive tracking to active management.

- **Task Prioritization:** The AI analyzes upcoming deadlines and workload to suggest which tasks you should tackle first.
- **Smart Breakdown (AI Planner):** Input a vague project idea (e.g., "Build a landing page"), and the AI will generate a structured checklist of specific sub-tasks.
- **Project Health:** (Coming Soon) AI evaluation of project velocity to detect if a project is at risk of missing its deadline.
- **Productivity Analysis:** The AI engine will provide weekly summaries of your work habits and suggestions for improvement.
- **Risk Detection:** Alerts when estimated hours exceed available time or deadlines are clustering too tightly.

---

## ⚡ Performance

- **Optimized Rendering:** React components are carefully memorized using `useMemo` and `useCallback` to prevent unnecessary re-renders, especially on the Kanban board.
- **Reusable Components:** A robust design system built on generic UI components (`Card`, `Button`, `Input`).
- **Persistent Theme:** Theme preferences, sidebar toggles, and user sessions are instantly hydrated from `localStorage` to prevent UI flicker.
- **Responsive Layout:** Tailwind's utility-first approach ensures minimal CSS payload while maintaining a pixel-perfect layout across all devices.

---

## 📈 Future Vision & Roadmap

- [ ] **Real-time Collaboration:** WebSockets for live Kanban board updates across teams.
- [ ] **Team Workspaces:** Role-based access control (Admin, Member, Viewer).
- [ ] **Comments & File Uploads:** Attach assets and discuss tasks inline.
- [ ] **AI Chat Assistant:** A sidebar AI agent to query project status ("What's blocking the Q3 release?").
- [ ] **Voice Commands:** Dictate tasks directly into the app.
- [ ] **Google Calendar Sync:** Two-way synchronization for deadlines.
- [ ] **Slack Integration:** Push notifications for task updates.
- [ ] **Email Notifications:** Daily digests and overdue alerts.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Developer

<div align="center">
  <h3>Made with ❤️ by Sanskar Kharya</h3>
  
  <p>
    <a href="https://github.com/MaybeSomeone-arc18"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
    <a href="#"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Portfolio-2563EB?style=for-the-badge&logo=react&logoColor=white" alt="Portfolio" /></a>
    <a href="mailto:contact@example.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
  </p>

  <br/>

  <!-- Extras Section -->
  <img src="https://komarev.com/ghpvc/?username=MaybeSomeone-arc18&label=Profile%20Views&color=0e75b6&style=flat" alt="Visitor Counter" />
  
  <br/><br/>
  
  
  <br/><br/>
 

</div>
