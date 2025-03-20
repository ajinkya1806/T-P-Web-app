import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  Building2,
  GraduationCap,
  Clock,
  TrendingUp,
} from "lucide-react";

export function StudentHome() {
  const stats = [
    {
      name: "Applied Jobs",
      value: "12",
      change: "+2",
      icon: Briefcase,
      color: "bg-blue-500",
      link: "/student/applications",
    },
    {
      name: "Upcoming Events",
      value: "5",
      change: "+1",
      icon: Calendar,
      color: "bg-green-500",
      link: "/student/events",
    },
    {
      name: "Active Applications",
      value: "8",
      change: "-1",
      icon: FileText,
      color: "bg-yellow-500",
      link: "/student/applications",
    },
    {
      name: "Companies Visited",
      value: "15",
      change: "+3",
      icon: Building2,
      color: "bg-purple-500",
      link: "/student/jobs",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "Applied for Software Engineer position",
      company: "Google",
      date: "2 hours ago",
      status: "Pending",
      link: "/student/applications",
    },
    {
      id: 2,
      title: "Registered for Technical Interview Workshop",
      company: "Microsoft",
      date: "1 day ago",
      status: "Confirmed",
      link: "/student/events",
    },
    {
      id: 3,
      title: "Profile viewed by Amazon",
      company: "Amazon",
      date: "2 days ago",
      status: "Viewed",
      link: "/student/profile",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Technical Interview Workshop",
      company: "Microsoft",
      date: "Tomorrow, 10:00 AM",
      location: "Room 301",
      type: "Workshop",
      link: "/student/events",
    },
    {
      id: 2,
      title: "Campus Drive",
      company: "Amazon",
      date: "Next Week, Monday",
      location: "Auditorium",
      type: "Campus Drive",
      link: "/student/events",
    },
    {
      id: 3,
      title: "Resume Building Session",
      company: "Career Services",
      date: "Next Week, Wednesday",
      location: "Room 205",
      type: "Workshop",
      link: "/student/events",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, John!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your placement process
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} rounded-full p-3 text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">from last week</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activities and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activities
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <Link
                key={activity.id}
                to={activity.link}
                className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-500">{activity.company}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : activity.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{activity.date}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Events
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={event.link}
                className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">{event.company}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.type === "Workshop"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {event.type}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.date}
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Building2 className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
