import React, { useState } from "react";
import {
  Search,
  Building2,
  Briefcase,
  DollarSign,
  GraduationCap,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";

export function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockJobs = [
    {
      id: 1,
      company: "Google",
      role: "Software Engineer",
      salary: "₹12-15 LPA",
      eligibility: "CGPA > 7.5",
      deadline: "2024-03-15",
      status: "Open",
      applicants: 150,
    },
    {
      id: 2,
      company: "Microsoft",
      role: "Full Stack Developer",
      salary: "₹10-13 LPA",
      eligibility: "CGPA > 7.0",
      deadline: "2024-03-20",
      status: "Open",
      applicants: 120,
    },
    {
      id: 3,
      company: "Amazon",
      role: "Data Scientist",
      salary: "₹15-18 LPA",
      eligibility: "CGPA > 8.0",
      deadline: "2024-03-10",
      status: "Closed",
      applicants: 200,
    },
    {
      id: 4,
      company: "Meta",
      role: "Product Manager",
      salary: "₹18-22 LPA",
      eligibility: "CGPA > 8.5",
      deadline: "2024-03-25",
      status: "Open",
      applicants: 80,
    },
  ];

  const filteredJobs = mockJobs.filter(
    (job) =>
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and apply for job opportunities
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
          placeholder="Search jobs by company or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Job Listings */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
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
                      {job.company}
                    </h3>
                    <p className="text-sm text-gray-500">{job.role}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === "Open"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {job.salary}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {job.eligibility}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  Deadline: {job.deadline}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {job.applicants} applicants
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    job.status === "Open"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  disabled={job.status === "Closed"}
                >
                  {job.status === "Open" ? (
                    <>
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Applications Closed"
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
