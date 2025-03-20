import React from "react";
import { Building2, Calendar, GraduationCap, IndianRupee } from "lucide-react";

export function JobCard({ job, onApply }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{job.role}</h3>
          <div className="flex items-center mt-2 text-gray-600">
            <Building2 className="h-5 w-5 mr-2" />
            <span>{job.companyName}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            job.status === "open"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center text-gray-600">
          <IndianRupee className="h-5 w-5 mr-2" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <GraduationCap className="h-5 w-5 mr-2" />
          <span>Min. CGPA: {job.eligibility.cgpa}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center text-gray-600">
        <Calendar className="h-5 w-5 mr-2" />
        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
      </div>

      {onApply && job.status === "open" && (
        <button
          onClick={onApply}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Now
        </button>
      )}
    </div>
  );
}
