/**
 * Layout — app shell with sidebar + topbar
 * Now reads user info from AuthContext instead of localStorage.
 */
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Calendar,
  FileText, Settings, LogOut, Menu, X, Bell, User, GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen]     = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const notifRef  = useRef(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const adminNav = [
    { name: "Dashboard",    icon: LayoutDashboard, path: "/admin"              },
    { name: "Students",     icon: Users,           path: "/admin/students"     },
    { name: "Jobs",         icon: Briefcase,       path: "/admin/jobs"         },
    { name: "Events",       icon: Calendar,        path: "/admin/events"       },
    { name: "Applications", icon: FileText,        path: "/admin/applications" },
    { name: "Settings",     icon: Settings,        path: "/admin/settings"     },
  ];

  const studentNav = [
    { name: "Dashboard",    icon: LayoutDashboard, path: "/student"             },
    { name: "Profile",      icon: User,            path: "/student/profile"     },
    { name: "Jobs",         icon: Briefcase,       path: "/student/jobs"        },
    { name: "Applications", icon: FileText,        path: "/student/applications"},
    { name: "Events",       icon: Calendar,        path: "/student/events"      },
  ];

  const navItems = user?.role === "admin" ? adminNav : studentNav;
  const currentPage = navItems.find((i) => i.path === location.pathname)?.name || "Dashboard";

  const handleProfileClick = () =>
    navigate(user?.role === "admin" ? "/admin/settings" : "/student/profile");

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#13161e] border-r border-white/5
          flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">T&amp;P Portal</p>
            <p className="text-[11px] text-white/40 mt-0.5 capitalize">{user?.role} Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${active
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
                  }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <div className="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
            </div>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-[#0f1117]/80 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between h-14 px-5">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white/50 hover:text-white transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <h2 className="hidden lg:block text-sm font-semibold text-white/70">{currentPage}</h2>

            {/* Right side actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#1a1d27] border border-white/10
                    rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      <button onClick={() => setIsNotifOpen(false)}
                        className="text-white/40 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="px-4 py-8 text-center text-sm text-white/30">
                      No new notifications
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                  hover:bg-white/5 transition-all"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-xs font-medium text-white/70 hidden sm:block">{user?.name}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
