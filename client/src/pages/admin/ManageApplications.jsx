import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  User,
  Building2,
} from "lucide-react";

export function ManageApplications() {
  const [searchQuery, setSearchQuery] = useState("");

  const applications = [
    {
      id: 1,
      student: {
        name: "John Doe",
        rollNo: "2021001",
        branch: "CSE",
        cgpa: "8.5",
      },
      job: {
        title: "Software Engineer",
        company: "Tech Corp",
        location: "Bangalore",
        package: "₹12-15 LPA",
      },
      appliedDate: "2024-03-15",
      status: "Pending",
      resume: "resume.pdf",
    },
    {
      id: 2,
      student: {
        name: "Jane Smith",
        rollNo: "2021002",
        branch: "IT",
        cgpa: "8.8",
      },
      job: {
        title: "Data Analyst",
        company: "Data Solutions",
        location: "Mumbai",
        package: "₹25,000/month",
      },
      appliedDate: "2024-03-14",
      status: "Shortlisted",
      resume: "resume.pdf",
    },
    // Add more mock data as needed
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Applications
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option>All Status</option>
            <option>Pending</option>
            <option>Shortlisted</option>
            <option>Rejected</option>
            <option>Selected</option>
          </select>
          <select className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option>All Companies</option>
            <option>Tech Corp</option>
            <option>Data Solutions</option>
            <option>Innovation Labs</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.student.rollNo} •{" "}
                          {application.student.branch}
                        </div>
                        <div className="text-sm text-gray-500">
                          CGPA: {application.student.cgpa}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {application.job.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.job.company}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.job.location} • {application.job.package}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.appliedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900">
                      <FileText className="h-5 w-5 mr-1" />
                      View Resume
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
