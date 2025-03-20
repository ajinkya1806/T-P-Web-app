import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Search,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";

export function StudentEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const events = [
    {
      id: 1,
      title: "Technical Interview Workshop",
      company: "Microsoft",
      date: "2024-04-01",
      time: "10:00 AM - 12:00 PM",
      location: "Room 301, Main Building",
      type: "Workshop",
      participants: 50,
      description:
        "Learn the best practices for technical interviews from industry experts.",
      registrationDeadline: "2024-03-30",
      isRegistered: true,
    },
    {
      id: 2,
      title: "Campus Drive",
      company: "Amazon",
      date: "2024-04-05",
      time: "9:00 AM - 5:00 PM",
      location: "Auditorium",
      type: "Campus Drive",
      participants: 200,
      description:
        "Amazon is coming to campus for full-time and internship opportunities.",
      registrationDeadline: "2024-04-03",
      isRegistered: false,
    },
    {
      id: 3,
      title: "Resume Building Session",
      company: "Career Services",
      date: "2024-04-10",
      time: "2:00 PM - 4:00 PM",
      location: "Room 205, Career Center",
      type: "Workshop",
      participants: 30,
      description:
        "Get expert tips on creating a professional resume that stands out.",
      registrationDeadline: "2024-04-08",
      isRegistered: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="workshop">Workshop</option>
              <option value="campus-drive">Campus Drive</option>
              <option value="seminar">Seminar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500">{event.company}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.type === "Workshop"
                      ? "bg-purple-100 text-purple-800"
                      : event.type === "Campus Drive"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {event.type}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {event.participants} participants
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Registration Deadline: {event.registrationDeadline}
                </div>
                <button
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    event.isRegistered
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {event.isRegistered ? "Registered" : "Register Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
