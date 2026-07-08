/**
 * Centralised API functions
 * All fetch/mutation calls in the app go through here.
 */
import api from "./axiosInstance";

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (credentials) =>
  api.post("/auth/login", credentials).then((r) => r.data);

export const getCurrentUser = () =>
  api.get("/auth/me").then((r) => r.data);

export const registerAdmin = (data) =>
  api.post("/auth/register/admin", data).then((r) => r.data);

export const registerStudent = (data) =>
  api.post("/auth/register/student", data).then((r) => r.data);

// alias used by AdminStudents
export { registerStudent as addStudent };

export const logoutUser = () =>
  api.post("/auth/logout").then((r) => r.data);

// ── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  api.get("/admin/stats").then((r) => r.data);

export const getStudents = (params) =>
  api.get("/admin/students", { params }).then((r) => r.data);

export const getStudentById = (id) =>
  api.get(`/admin/students/${id}`).then((r) => r.data);

export const updateStudent = (id, data) =>
  api.put(`/admin/students/${id}`, data).then((r) => r.data);

export const deleteStudent = (id) =>
  api.delete(`/admin/students/${id}`).then((r) => r.data);

// ── Student (own profile) ─────────────────────────────────────────────────────
export const getMyProfile = () =>
  api.get("/student/profile").then((r) => r.data);

export const updateMyProfile = (data) =>
  api.put("/student/profile", data).then((r) => r.data);

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const getJobs = (params) =>
  api.get("/jobs/", { params }).then((r) => r.data);

export const getJobById = (id) =>
  api.get(`/jobs/${id}`).then((r) => r.data);

export const createJob = (data) =>
  api.post("/jobs/", data).then((r) => r.data);

export const updateJob = (id, data) =>
  api.put(`/jobs/${id}`, data).then((r) => r.data);

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}`).then((r) => r.data);

// ── Events ────────────────────────────────────────────────────────────────────
export const getEvents = (params) =>
  api.get("/events/", { params }).then((r) => r.data);

export const getEventById = (id) =>
  api.get(`/events/${id}`).then((r) => r.data);

export const createEvent = (data) =>
  api.post("/events/", data).then((r) => r.data);

export const updateEvent = (id, data) =>
  api.put(`/events/${id}`, data).then((r) => r.data);

export const deleteEvent = (id) =>
  api.delete(`/events/${id}`).then((r) => r.data);

// ── Applications ──────────────────────────────────────────────────────────────
export const applyToJob = (jobId) =>
  api.post("/applications/apply", { jobId }).then((r) => r.data);

export const getMyApplications = () =>
  api.get("/applications/my").then((r) => r.data);

export const getApplicationsForJob = (jobId) =>
  api.get(`/applications/job/${jobId}`).then((r) => r.data);

export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/applications/${applicationId}/status`, { status }).then((r) => r.data);
