/**
 * AuthContext
 * ============
 * Global authentication state for the entire app.
 *
 * Provides:
 *   - user: { id, name, email, role } | null
 *   - token: JWT string | null
 *   - isLoading: true while validating token on first load
 *   - login(email, password)  → calls API, stores token, sets user
 *   - logout()                → clears everything, redirects to /login
 *
 * On mount, validates any existing token by calling GET /auth/me.
 * If the token is expired or invalid, the user is silently logged out.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, name, email, role }
  const [token, setToken]     = useState(null);   // JWT string
  const [isLoading, setIsLoading] = useState(true); // true on first load

  const navigate = useNavigate();

  // ── Bootstrap: validate existing token on every page load/refresh ──────────
  useEffect(() => {
    const stored = localStorage.getItem("tnp_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }

    // Token exists — verify it with the backend
    setToken(stored);
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        // Token invalid/expired — clean up silently
        localStorage.removeItem("tnp_token");
        localStorage.removeItem("tnp_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // Throws on error so the Login page can catch and display it
    const res = await loginUser({ email, password });
    const { token: jwt, user: userData } = res.data;

    // Persist to localStorage so Axios interceptor can attach it
    localStorage.setItem("tnp_token", jwt);
    localStorage.setItem("tnp_user", JSON.stringify(userData));

    setToken(jwt);
    setUser(userData);

    // Route based on role
    navigate(userData.role === "admin" ? "/admin" : "/student", { replace: true });
  }, [navigate]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("tnp_token");
    localStorage.removeItem("tnp_user");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = { user, token, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — consume auth context in any component.
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}
