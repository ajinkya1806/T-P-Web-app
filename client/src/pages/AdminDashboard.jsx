import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminHome } from "./admin/AdminHome";
import { AdminStudents } from "./admin/AdminStudents";
import { AdminJobs } from "./admin/AdminJobs";
import { AdminEvents } from "./admin/AdminEvents";
import { ManageApplications } from "./admin/ManageApplications";
import { Settings } from "./admin/Settings";

export function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="students" element={<AdminStudents />} />
      <Route path="jobs" element={<AdminJobs />} />
      <Route path="events" element={<AdminEvents />} />
      <Route path="applications" element={<ManageApplications />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
}
