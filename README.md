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

### 🔐 Authentication
- **Google OAuth (Google Identity Services):** Seamless one-tap login.
- **Continue as Guest:** Instant access without account creation.
- **Email/Password Authentication:** Traditional signup with secure password hashing.
- **JWT Authentication:** Stateless and secure session management.
- **Protected Routes:** React Router guarding private application views.
- **Google Account Linking:** Automatically links Google logins to existing accounts.

### 🧠 AI Integration
- **AI Task Breakdown:** Gemini AI intelligently splits large projects into manageable tasks.
- **AI Insights:** Daily planning and productivity suggestions.
- **Estimated Effort:** Automatically estimates task complexity.
- **Gemini-powered Project Planning:** Native integration with Google's latest models.

### 📋 Task Management
- **Drag & Drop Kanban:** Move tasks seamlessly across columns.
- **Bulk Task Creation:** Add multiple tasks efficiently.
- **Project CRUD:** Create, read, update, and delete projects.
- **Task CRUD:** Full lifecycle management for individual tasks.
- **Smart Status Management:** Automatically updates workflows.

### ⚙️ Settings
- **Theme Persistence:** Stores user preferences in `localStorage`.
- **Accent Color Customization:** Personalize the UI look and feel.
- **Layout Preferences:** Adjust the workspace density to your liking.

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

Create a `.env` file for the backend and a `.env` file for the frontend.

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|:---|:---|:---|
| `VITE_API_URL` | The URL of your backend API | `http://localhost:5000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id.apps.googleusercontent.com` |

### Backend (`backend/.env`)
| Variable | Description | Example |
|:---|:---|:---|
| `PORT` | The port for the Express server | `5000` |
| `MONGO_URI` | Your MongoDB connection string | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_super_secret_key_123` |
| `CLIENT_URL` | The URL of your frontend application | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for token verification | `your-google-client-id...` |
| `GEMINI_API_KEY` | Google Gemini API Key for AI features | `AIzaSy...` |

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
| **POST** | `/api/v1/auth/google` | Authenticate using Google OAuth ID token | ❌ |
| **POST** | `/api/v1/auth/guest` | Create a temporary guest session | ❌ |
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

TaskFlow AI features a multi-tiered authentication system ensuring a smooth user experience while maintaining robust security. 

Users can log in via **Traditional Login (Email/Password)**, **Google OAuth**, or **Guest Mode**. Google users are securely verified on the backend using the `google-auth-library` before a session is granted. All flows converge to issue a signed JSON Web Token (JWT), which is used to guard Protected Routes.

```text
[ User ] 
   │
   ├─ (A) Traditional Login -> bcrypt.compare()
   ├─ (B) Google OAuth -> Verify ID Token via google-auth-library
   ├─ (C) Guest Mode -> Generate temporary user profile
   ▼
[ Express API ]
   │
   ├─ Generates signed JWT (includes user ID and Email)
   ▼
[ Frontend ]
   │
   ├─ Stores JWT in LocalStorage
   ├─ Attaches `Authorization: Bearer <token>` to Axios Interceptor
   ▼
[ Protected API Routes ] ── Validates JWT signature ──► [ Access Granted ]
```

---

## 🧠 AI Workflow & Features

TaskFlow AI seamlessly integrates **Google Gemini** to elevate your workflow from passive tracking to active management.

**AI Implementation Workflow:**
1. **User Prompt:** The user inputs a project idea or task description into the AI Planner.
2. **Backend:** The Express server receives the prompt and constructs an engineered context.
3. **Gemini:** The `@google/genai` model processes the request.
4. **JSON Parsing:** The backend extracts and validates the structured JSON response from Gemini.
5. **Task Suggestions:** The parsed array of sub-tasks, complete with estimated effort and priority, is generated.
6. **Displayed in AI Panel:** The frontend renders the suggestions, allowing the user to seamlessly add them to their Kanban board.

---

## ⚡ Performance

- **Optimized Rendering:** React components are carefully memorized using `useMemo` and `useCallback` to prevent unnecessary re-renders, especially on the Kanban board.
- **Reusable Components:** A robust design system built on generic UI components (`Card`, `Button`, `Input`).
- **Persistent Theme:** Theme preferences, sidebar toggles, and user sessions are instantly hydrated from `localStorage` to prevent UI flicker.
- **Responsive Layout:** Tailwind's utility-first approach ensures minimal CSS payload while maintaining a pixel-perfect layout across all devices.

---

## 🔒 Security

- **JWT Authentication:** Stateless, signed tokens securely manage sessions.
- **Password Hashing:** `bcrypt` prevents raw passwords from being stored in the database.
- **Google OAuth Verification:** Backend explicitly verifies Google ID tokens rather than trusting the client.
- **Protected Routes:** Frontend routing and backend middleware enforce authorization checks.
- **CORS:** Cross-Origin Resource Sharing is strictly configured to only accept requests from the frontend client.
- **Rate Limiting:** `express-rate-limit` mitigates brute-force attacks on auth endpoints.
- **Environment Variables:** Sensitive keys are kept completely out of the source code.
- **Input Validation:** Zod (Frontend) and Joi/Mongoose (Backend) ensure all inputs are sanitized.

---

## 📸 Screenshots

*UI previews of TaskFlow AI.*

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Kanban Board
![Kanban](docs/images/kanban.png)

### Analytics
![Analytics](docs/images/analytics.png)

### AI Planner
![AI Planner](docs/images/ai-planner.png)

### Login
![Login](docs/images/login.png)

### Register
![Register](docs/images/register.png)

### Settings
![Settings](docs/images/settings.png)

---

## 🚀 Deployment

The platform is designed to be easily deployed to modern cloud providers:

- **Frontend:** Vercel (Recommended for Vite/React applications)
- **Backend:** Render or Heroku (Node.js/Express)
- **Database:** MongoDB Atlas (Cloud database)

*Ensure all environment variables from `.env` are configured in your deployment platform's dashboard.*

---

## 📈 Future Vision & Roadmap

- [ ] **Real-time Collaboration:** WebSockets for live Kanban board updates across teams.
- [ ] **Team Workspaces:** Role-based access control (Admin, Member, Viewer).
- [ ] **AI Chat Assistant:** A sidebar AI agent to query project status.
- [ ] **Google Calendar Sync:** Two-way synchronization for deadlines.
- [ ] **Slack Integration:** Push notifications for task updates.

---

## ⚠️ Known Limitations

- **Guest Accounts:** Guest sessions are permanent in the database until manually cleaned up. Future updates will introduce an automated cron job to purge inactive guest accounts.
- **Offline Support:** The application currently requires an active internet connection to interact with the database and AI features.

---

## 🧗 Challenges Faced

- **Authentication Architecture:** Designing a seamless system that elegantly handles traditional logins, Google OAuth linking, and temporary Guest sessions without compromising the data model.
- **Gemini Model Compatibility:** Parsing unstructured text responses from the AI into strictly typed JSON objects required careful prompt engineering and fallback validation.
- **Environment Variable Management:** Managing separate environments for frontend builds (Vite) and backend servers required a disciplined approach to avoid leaking secrets.

---

## 🌟 Project Highlights

- **Modern SaaS UI:** A beautiful, responsive interface designed to feel like a premium SaaS product (e.g., Linear, Vercel).
- **Google OAuth & JWT:** A robust, hybrid authentication architecture built for scale.
- **AI-First Project Management:** Moving beyond manual task entry by integrating Google Gemini for automated planning.
- **Drag & Drop Kanban:** A fluid, native-feeling task management experience built on modern React principles.

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
