import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to manage sessions and propagate real error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the backend's actual error message from the response body
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    // Only auto-redirect on 401 when NOT on auth pages (avoid swallowing login errors)
    if (error.response?.status === 401) {
      const isOnAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/signup';

      if (!isOnAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Re-throw with the backend message so catch blocks in components show real errors
    const enrichedError = new Error(backendMessage);
    (enrichedError as any).response = error.response;
    (enrichedError as any).status = error.response?.status;
    return Promise.reject(enrichedError);
  }
);

export default api;
