import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Loading from './components/Loading';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Core Pages (synchronously loaded for fast paint)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Lazy loaded feature pages
const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AIPlanner = lazy(() => import('./pages/AIPlanner'));
const Settings = lazy(() => import('./pages/Settings'));

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            {/* Guest Authentication Screen Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
            </Route>

            {/* Application Inside Routes Guarded by JWT protect gates */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              
              <Route
                path="/projects/:projectId"
                element={
                  <Suspense fallback={<Loading />}>
                    <KanbanBoard />
                  </Suspense>
                }
              />
              <Route
                path="/analytics"
                element={
                  <Suspense fallback={<Loading />}>
                    <Analytics />
                  </Suspense>
                }
              />
              <Route
                path="/ai-planner"
                element={
                  <Suspense fallback={<Loading />}>
                    <AIPlanner />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<Loading />}>
                    <Settings />
                  </Suspense>
                }
              />
              
              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
