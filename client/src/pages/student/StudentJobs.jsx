import React, { useState } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Search,
  Filter,
} from "lucide-react";

export function StudentJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const jobs = [
    {
      id: 1,
      title: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      type: "Full Time",
      salary: "$120,000 - $150,000",
      requirements: ["B.Tech", "CGPA > 7.5", "React", "Node.js"],
      deadline: "2024-04-15",
      description:
        "We are looking for a talented Software Engineer to join our team...",
      logo: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Microsoft",
      location: "Redmond, WA",
      type: "Full Time",
      salary: "$130,000 - $160,000",
      requirements: ["B.Tech", "CGPA > 7.5", "Product Management"],
      deadline: "2024-04-20",
      description:
        "Join our product team to help shape the future of technology...",
      logo: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "Amazon",
      location: "Seattle, WA",
      type: "Internship",
      salary: "$8,000/month",
      requirements: ["B.Tech", "CGPA > 7.5", "Python", "Machine Learning"],
      deadline: "2024-04-10",
      description:
        "Work on cutting-edge data science projects with our team...",
      logo: "https://via.placeholder.com/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
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
              <option value="full-time">Full Time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part Time</option>
            </select>
          </div>
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Apply Now
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.type}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salary}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Deadline: {job.deadline}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Requirements:
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">{job.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
