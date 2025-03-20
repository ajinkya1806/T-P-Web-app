import React from "react";
import {
  BarChart2,
  Users,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function AdminHome() {
  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Placement Rate",
      value: "92%",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Active Companies",
      value: "45",
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      trend: { value: 15, isPositive: true },
    },
    {
      title: "Average Package",
      value: "₹8.5 LPA",
      icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
      trend: { value: 10, isPositive: true },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  stat.trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend.isPositive ? "↑" : "↓"} {stat.trend.value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-md"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    New student registration
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-md"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tech Corp Campus Drive
                  </p>
                  <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
