import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from "lucide-react";

export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role) {
      navigate("/login");
      return;
    }
    setUserRole(role);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "New Job Posted",
      message: "Google has posted a new Software Engineer position",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Application Status Updated",
      message: "Your application for Microsoft has been shortlisted",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      title: "Upcoming Event",
      message: "Technical Interview Workshop tomorrow at 10:00 AM",
      time: "2 days ago",
      read: true,
    },
    {
      id: 4,
      title: "Profile Update Required",
      message: "Please update your resume for upcoming placements",
      time: "3 days ago",
      read: true,
    },
    {
      id: 5,
      title: "New Company Registration",
      message: "Amazon has registered for campus placement",
      time: "4 days ago",
      read: true,
    },
  ];

  const handleLogout = () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear any specific items that might be stored
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Force redirect to login page
    window.location.href = "/login";
  };

  const handleProfileClick = () => {
    navigate(userRole === "admin" ? "/admin/settings" : "/student/profile");
  };

  const adminNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Students", icon: Users, path: "/admin/students" },
    { name: "Jobs", icon: Briefcase, path: "/admin/jobs" },
    { name: "Events", icon: Calendar, path: "/admin/events" },
    { name: "Applications", icon: FileText, path: "/admin/applications" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const studentNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/student" },
    { name: "Profile", icon: User, path: "/student/profile" },
    { name: "Jobs", icon: Briefcase, path: "/student/jobs" },
    { name: "Applications", icon: FileText, path: "/student/applications" },
    { name: "Events", icon: Calendar, path: "/student/events" },
  ];

  const navItems = userRole === "admin" ? adminNavItems : studentNavItems;

  // If no user role, don't render the layout
  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative text-gray-500 hover:text-gray-700"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">TNP Portal</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`lg:pl-64 flex flex-col flex-1 min-h-screen ${
          isSidebarOpen ? "pl-0" : "pl-0"
        }`}
      >
        {/* Top navbar */}
        <div className="sticky top-0 z-30 flex-shrink-0 h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900">
              {navItems.find((item) => item.path === location.pathname)?.name ||
                "Dashboard"}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative text-gray-500 hover:text-gray-700"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">
                        Notifications
                      </h2>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-full p-1"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userRole === "admin" ? "Admin" : "John Doe"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
