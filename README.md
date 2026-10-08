# TaskFlow AI

Keeping tasks in a list is easy. Knowing what needs attention across a few projects is harder.

I'm building TaskFlow to keep projects, tasks, and planning in one place. It has a Kanban board, shared projects, a dashboard, and a Gemini-powered planner. The planner suggests work; you decide what to add to the board.

## What's there

- Create projects, invite people with a link, and assign tasks to members.
- Move tasks between Todo, In Progress, and Completed. Set priorities, deadlines, tags, and effort estimates.
- See task counts, upcoming deadlines, recent activity, and charts.
- Ask for a task breakdown, daily plan, project health report, or sprint summary. Import suggested tasks into a project.
- Sign in with email and password, Google, or a guest account.
- Switch between light and dark themes and change accent colors.

This is a work in progress, not an autonomous project manager. AI output needs review, and shared boards don't have live updates between clients.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, and Recharts on the frontend. Express, TypeScript, MongoDB/Mongoose, JWT, and bcrypt on the backend.

The AI service uses `@google/generative-ai` with `gemini-2.5-flash`. Google sign-in uses Google Identity Services on the frontend and `google-auth-library` to verify ID tokens on the backend.

## Run locally

Use Node.js 20 (the version used in CI), npm, and a running MongoDB instance. A Gemini key is needed for model-generated plans. Google sign-in needs a client ID configured for your local frontend origin.

```bash
git clone https://github.com/MaybeSomeone-arc18/taskflow-ai.git
cd taskflow-ai

npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow-ai
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
# Optional: enable Gemini and Google sign-in
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
```

Use `MONGODB_URI`, not `MONGO_URI`. Set your own `JWT_SECRET`; the code's local-development fallback is not suitable for deployment.

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

For Google sign-in, use the same client ID in both env files. You can use email/password or guest login without setting up Google sign-in.

Start the backend:

```bash
cd backend
npm run dev
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The backend's health check is at `http://localhost:5000/health`.

## Checks and builds

```bash
# Compile the backend and run its Node test suite
npm test --prefix backend

# Type-check and build the frontend
npm run build --prefix frontend
```

GitHub Actions runs both checks on pushes to `main` and pull requests. Backend tests cover analytics/count regressions and utility functions; they are not an end-to-end test of the app.

For a backend deployment, run `npm run build:ci --prefix backend`, then `npm start --prefix backend`. The frontend build outputs `frontend/dist`. Set `VITE_API_URL` before building the frontend and configure the backend env variables on your host. Keep API keys on the backend.

## How the AI works

The frontend sends requests to the Express API, which calls Gemini and parses its JSON response. Task breakdowns include suggested subtasks, priorities, and effort estimates. The daily planner uses pending tasks, priorities, effort, and due dates.

If the key is missing or a request or JSON parsing fails, the service returns fallback results. Those are not model-generated plans. Review estimates and recommendations before using them.

Task data is sent to Google when Gemini is used. The daily plan includes tasks assigned to you and unassigned tasks from your projects. Project health and sprint summary requests include the selected project's task list, including other members' tasks. Don't treat those reports as private to an individual assignee.

## Code map

```text
backend/src/
  controllers/   Request handlers
  routes/        API routes
  services/      Auth, projects, tasks, analytics, and Gemini
  models/        Mongoose schemas
  middleware/    Project and task access checks
  middlewares/   Auth, validation, logging, and error handling
backend/tests/   Backend regression and utility tests
frontend/src/
  pages/         Dashboard, Kanban, analytics, planner, and settings
  components/    Task cards, AI panel, and shared UI
  context/       Auth, theme, and notifications
  services/      API client and request helpers
dsa-java/        Separate Java scheduling and dependency-graph exercises
```

The Java exercises aren't wired into the web app.

## API entry points

All paths below are under `/api/v1`. Protected routes use `Authorization: Bearer <token>`.

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/google`, `/auth/guest`; `GET /auth/me` |
| Projects | `GET/POST /projects`; `GET/PATCH/DELETE /projects/:id` |
| Sharing | `POST /projects/:id/invite`; `POST /projects/join/:token`; `GET /projects/:id/members`; `DELETE /projects/:id/members/:userId`; `POST /projects/:id/leave` |
| Tasks | `GET/POST /tasks`; `GET/PATCH/DELETE /tasks/:id`; `POST /tasks/import-ai`; `GET /projects/:projectId/tasks` |
| Analytics | `GET /analytics/dashboard`, `/analytics/charts` |
| AI | `POST /ai/task-breakdown`, `/ai/daily-plan`, `/ai/project-health`, `/ai/sprint-summary` |

See [backend/src/routes](backend/src/routes) for route definitions and [backend/src/controllers](backend/src/controllers) for request handling.

## Current limits

- Guest login creates a database record. There is no automatic guest-account cleanup.
- The app needs the backend and MongoDB for persisted data. There is no offline mode.
- Personal dashboard counts include tasks assigned to you or created by you in active projects. That is not the same as showing only assigned tasks.
- JWTs are stored in browser localStorage. The current auth and access controls should not be read as a security audit or a production-readiness guarantee.

Bugs and small improvements are welcome. Include the steps to reproduce a bug, and run the checks above before opening a PR.
