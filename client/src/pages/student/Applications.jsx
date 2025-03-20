import React, { useState } from "react";
import {
  Search,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Clock4,
  AlertCircle,
} from "lucide-react";

export function Applications() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockApplications = [
    {
      id: 1,
      company: "Google",
      role: "Software Engineer",
      appliedDate: "2024-02-15",
      status: "Shortlisted",
      nextStep: "Technical Interview",
      deadline: "2024-03-20",
    },
    {
      id: 2,
      company: "Microsoft",
      role: "Full Stack Developer",
      appliedDate: "2024-02-10",
      status: "Rejected",
      nextStep: "None",
      deadline: "2024-03-15",
    },
    {
      id: 3,
      company: "Amazon",
      role: "Data Scientist",
      appliedDate: "2024-02-20",
      status: "Pending",
      nextStep: "Resume Screening",
      deadline: "2024-03-25",
    },
    {
      id: 4,
      company: "Meta",
      role: "Product Manager",
      appliedDate: "2024-02-25",
      status: "Interview Scheduled",
      nextStep: "HR Interview",
      deadline: "2024-03-30",
    },
  ];

  const filteredApplications = mockApplications.filter(
    (app) =>
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Shortlisted":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock4 className="h-4 w-4" />;
      case "Interview Scheduled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track the status of your job applications
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
          placeholder="Search applications by company or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Applications List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredApplications.map((application) => (
            <li key={application.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.company}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {application.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Applied: {application.appliedDate}
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Next Step: {application.nextStep}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <Clock className="h-4 w-4 mr-2" />
                      Deadline: {application.deadline}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500 sm:mt-0">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
