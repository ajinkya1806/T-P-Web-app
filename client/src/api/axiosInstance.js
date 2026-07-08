/**
 * Axios Instance with JWT Interceptors
 * ======================================
 * - Attaches Bearer token to every request automatically
 * - On 401 response → clears auth state and redirects to /login
 * - All API calls in the app should import from this file
 */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Reads the token from localStorage and attaches it on every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tnp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// On 401 Unauthorized → clear stored token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem("tnp_token");
      localStorage.removeItem("tnp_user");
      // Redirect to login without using React Router (outside component tree)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
