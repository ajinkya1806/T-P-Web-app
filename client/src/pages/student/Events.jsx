import React, { useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";

export function Events() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockEvents = [
    {
      id: 1,
      title: "Google Tech Talk",
      type: "Tech Talk",
      company: "Google",
      date: "2024-03-15",
      time: "10:00 AM",
      venue: "Auditorium Hall",
      attendees: 150,
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Microsoft Interview Prep",
      type: "Workshop",
      company: "Microsoft",
      date: "2024-03-18",
      time: "2:00 PM",
      venue: "Room 301",
      attendees: 80,
      status: "Upcoming",
    },
    {
      id: 3,
      title: "Amazon Mock Interviews",
      type: "Mock Interview",
      company: "Amazon",
      date: "2024-03-10",
      time: "11:00 AM",
      venue: "Career Center",
      attendees: 120,
      status: "Completed",
    },
    {
      id: 4,
      title: "Meta Career Fair",
      type: "Career Fair",
      company: "Meta",
      date: "2024-03-25",
      time: "9:00 AM",
      venue: "Main Campus",
      attendees: 200,
      status: "Upcoming",
    },
  ];

  const filteredEvents = mockEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Placement Events</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and register for upcoming placement events
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search events by title or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {event.company}
                    </h3>
                    <p className="text-sm text-gray-500">{event.title}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.status === "Upcoming"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {event.attendees} attendees
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    event.status === "Upcoming"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  disabled={event.status === "Completed"}
                >
                  {event.status === "Upcoming" ? (
                    <>
                      Register Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Event Completed"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
