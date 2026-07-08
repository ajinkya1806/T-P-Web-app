import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth pages
import { Login } from "./pages/auth/Login";

// Layout wrapper
import { Layout } from "./components/Layout";

// Admin pages
import { AdminHome }          from "./pages/admin/AdminHome";
import { AdminStudents }      from "./pages/admin/AdminStudents";
import { AdminJobs }          from "./pages/admin/AdminJobs";
import { AdminEvents }        from "./pages/admin/AdminEvents";
import { ManageApplications } from "./pages/admin/ManageApplications";
import { Settings }           from "./pages/admin/Settings";

// Student pages
import { StudentHome }         from "./pages/student/StudentHome";
import { StudentProfile }      from "./pages/student/StudentProfile";
import { StudentJobs }         from "./pages/student/StudentJobs";
import { StudentApplications } from "./pages/student/StudentApplications";
import { StudentEvents }       from "./pages/student/StudentEvents";

// ── Loading Spinner ───────────────────────────────────────────────────────────
function GlobalLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-white/50 tracking-widest uppercase">Loading…</p>
      </div>
    </div>
  );
}

// ── Protected Route ───────────────────────────────────────────────────────────
// Reads from AuthContext (real JWT validation) — not localStorage strings
function PrivateRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <GlobalLoader />;
  if (!user)     return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <GlobalLoader />;

  return (
    <Routes>
      {/* Public — redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />
            : <Login />
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Layout>
              <Routes>
                <Route index                   element={<AdminHome />}          />
                <Route path="students"         element={<AdminStudents />}      />
                <Route path="jobs"             element={<AdminJobs />}          />
                <Route path="events"           element={<AdminEvents />}        />
                <Route path="applications"     element={<ManageApplications />} />
                <Route path="settings"         element={<Settings />}           />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Student routes */}
      <Route
        path="/student/*"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Layout>
              <Routes>
                <Route index                   element={<StudentHome />}         />
                <Route path="profile"          element={<StudentProfile />}      />
                <Route path="jobs"             element={<StudentJobs />}         />
                <Route path="applications"     element={<StudentApplications />} />
                <Route path="events"           element={<StudentEvents />}       />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Root — redirect based on role */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
