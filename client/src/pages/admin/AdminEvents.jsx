import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Modal } from "../../components/Modal";
import { EventForm } from "../../components/forms/EventForm";

// Create dummy events data
const dummyEvents = [
  {
    id: 1,
    title: "Web Development Workshop",
    company: "Tech Innovators",
    date: "2024-06-15",
    time: "10:00 AM",
    location: "Main Campus, Building A, Room 101",
    type: "workshop",
    participants: 25,
    maxParticipants: 50,
    status: "upcoming",
    description:
      "Learn the latest web development technologies and frameworks from industry experts.",
    createdAt: new Date("2024-05-01").toISOString(),
  },
  {
    id: 2,
    title: "Spring Career Fair",
    company: "College Placement Cell",
    date: "2024-06-25",
    time: "09:00 AM",
    location: "Convention Center",
    type: "career_fair",
    participants: 120,
    maxParticipants: 500,
    status: "upcoming",
    description:
      "Connect with over 50 companies hiring for internships and full-time positions.",
    createdAt: new Date("2024-05-05").toISOString(),
  },
  {
    id: 3,
    title: "Artificial Intelligence Seminar",
    company: "AI Research Labs",
    date: "2024-05-10",
    time: "02:00 PM",
    location: "Science Building, Auditorium",
    type: "seminar",
    participants: 78,
    maxParticipants: 100,
    status: "completed",
    description:
      "Discover the latest breakthroughs in artificial intelligence and machine learning.",
    createdAt: new Date("2024-04-15").toISOString(),
  },
  {
    id: 4,
    title: "Hackathon 2024",
    company: "CodeBurst",
    date: "2024-07-08",
    time: "08:00 AM",
    location: "Innovation Hub",
    type: "hackathon",
    participants: 45,
    maxParticipants: 150,
    status: "upcoming",
    description: "48-hour coding competition with prizes worth $10,000.",
    createdAt: new Date("2024-05-12").toISOString(),
  },
  {
    id: 5,
    title: "Resume Building Workshop",
    company: "Career Services",
    date: "2024-05-05",
    time: "11:00 AM",
    location: "Student Center, Room 202",
    type: "workshop",
    participants: 40,
    maxParticipants: 40,
    status: "completed",
    description:
      "Learn how to create a standout resume that gets you noticed by recruiters.",
    createdAt: new Date("2024-04-20").toISOString(),
  },
];

export function AdminEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState(dummyEvents);

  // Load events from localStorage on component mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        // Only use saved events if the array is not empty
        if (parsedEvents && parsedEvents.length > 0) {
          setEvents(parsedEvents);
        } else {
          // If empty array, use dummy data and save to localStorage
          localStorage.setItem("events", JSON.stringify(dummyEvents));
        }
      } else {
        // If no data in localStorage, save dummy data
        localStorage.setItem("events", JSON.stringify(dummyEvents));
      }
    } catch (error) {
      console.error("Error loading events:", error);
      // If error, use dummy data
      setEvents(dummyEvents);
      localStorage.setItem("events", JSON.stringify(dummyEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const handleSubmitEvent = (formData) => {
    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id ? { ...event, ...formData } : event
        )
      );
    } else {
      // Add new event
      const newEvent = {
        id: Date.now(), // Use timestamp as unique ID
        ...formData,
        participants: 0,
        status: "upcoming",
        createdAt: new Date().toISOString(),
      };
      setEvents([...events, newEvent]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((event) => event.id !== eventId));
    }
  };

  const filteredEvents = events.filter((event) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      event.title.toLowerCase().includes(searchLower) ||
      event.company.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower);
    const matchesType = selectedType === "all" || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="w-48">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="hackathon">Hackathon</option>
            <option value="career_fair">Career Fair</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date & Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Participants
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.company} • {event.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.date} at {event.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.participants}/{event.maxParticipants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.status === "upcoming"
                          ? "bg-green-100 text-green-800"
                          : event.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5 inline" />
                      <span className="ml-1">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5 inline" />
                      <span className="ml-1">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? "Edit Event" : "Create Event"}
      >
        <EventForm
          onSubmit={handleSubmitEvent}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
          initialData={editingEvent}
        />
      </Modal>
    </div>
  );
}
