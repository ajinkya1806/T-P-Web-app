import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { AdminHome } from "./pages/admin/AdminHome";
import { AdminStudents } from "./pages/admin/AdminStudents";
import { AdminJobs } from "./pages/admin/AdminJobs";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { ManageApplications } from "./pages/admin/ManageApplications";
import { Settings } from "./pages/admin/Settings";
import { StudentHome } from "./pages/student/StudentHome";
import { StudentProfile } from "./pages/student/StudentProfile";
import { StudentJobs } from "./pages/student/StudentJobs";
import { StudentApplications } from "./pages/student/StudentApplications";
import { StudentEvents } from "./pages/student/StudentEvents";

function PrivateRoute({ children, allowedRoles }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication state from localStorage
    const auth = localStorage.getItem("isAuthenticated") === "true";
    const role = localStorage.getItem("userRole");
    setIsAuthenticated(auth);
    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check authentication state from localStorage
    const auth = localStorage.getItem("isAuthenticated") === "true";
    const role = localStorage.getItem("userRole");
    setIsAuthenticated(auth);
    setUserRole(role);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate
                to={userRole === "admin" ? "/admin" : "/student"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <Routes>
                  <Route index element={<AdminHome />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="applications" element={<ManageApplications />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <Layout>
                <Routes>
                  <Route index element={<StudentHome />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="jobs" element={<StudentJobs />} />
                  <Route
                    path="applications"
                    element={<StudentApplications />}
                  />
                  <Route path="events" element={<StudentEvents />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={userRole === "admin" ? "/admin" : "/student"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
