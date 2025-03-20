import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Modal } from "../../components/Modal";
import { JobForm } from "../../components/forms/JobForm";

// Create dummy jobs data
const dummyJobs = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Google",
    location: "Bangalore, India",
    deadline: "2024-07-15",
    description:
      "We are looking for a talented Software Engineer to join our team and help build innovative products that serve billions of users worldwide.",
    requirements:
      "Bachelor's degree in Computer Science or related field. 2+ years of experience in software development. Proficiency in one or more programming languages such as Java, Python, or JavaScript.",
    status: "active",
    createdAt: new Date("2024-05-01").toISOString(),
  },
  {
    id: 2,
    title: "Data Scientist",
    company: "Microsoft",
    location: "Hyderabad, India",
    deadline: "2024-06-30",
    description:
      "Join our data science team to analyze complex datasets and build machine learning models that power our products and services.",
    requirements:
      "Master's degree in Data Science, Computer Science, or related field. Strong programming skills in Python. Experience with machine learning frameworks like TensorFlow or PyTorch.",
    status: "active",
    createdAt: new Date("2024-05-05").toISOString(),
  },
  {
    id: 3,
    title: "Front-end Developer",
    company: "Amazon",
    location: "Remote",
    deadline: "2024-06-15",
    description:
      "We're seeking a talented Front-end Developer to create engaging user experiences for our e-commerce platform.",
    requirements:
      "3+ years of experience with HTML, CSS, and JavaScript. Proficiency in React or Angular. Experience with responsive design and cross-browser compatibility.",
    status: "active",
    createdAt: new Date("2024-05-10").toISOString(),
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "IBM",
    location: "Pune, India",
    deadline: "2024-05-30",
    description:
      "Help us streamline our deployment processes and maintain our cloud infrastructure.",
    requirements:
      "Experience with AWS, Azure, or GCP. Familiarity with CI/CD pipelines. Knowledge of containerization technologies like Docker and Kubernetes.",
    status: "closed",
    createdAt: new Date("2024-04-15").toISOString(),
  },
  {
    id: 5,
    title: "Product Manager",
    company: "Flipkart",
    location: "Bangalore, India",
    deadline: "2024-07-05",
    description:
      "Lead product development for our e-commerce platform, working closely with engineering, design, and marketing teams.",
    requirements:
      "3+ years of product management experience. Strong analytical and problem-solving skills. Excellent communication and leadership abilities.",
    status: "draft",
    createdAt: new Date("2024-05-15").toISOString(),
  },
];

export function AdminJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState(dummyJobs);

  // Load jobs from localStorage on component mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem("jobs");
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        // Only use saved jobs if the array is not empty
        if (parsedJobs && parsedJobs.length > 0) {
          setJobs(parsedJobs);
        } else {
          // If empty array, use dummy data and save to localStorage
          localStorage.setItem("jobs", JSON.stringify(dummyJobs));
        }
      } else {
        // If no data in localStorage, save dummy data
        localStorage.setItem("jobs", JSON.stringify(dummyJobs));
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      // If error, use dummy data
      setJobs(dummyJobs);
      localStorage.setItem("jobs", JSON.stringify(dummyJobs));
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  const handleSubmitJob = (formData) => {
    if (editingJob) {
      // Update existing job
      setJobs(
        jobs.map((job) =>
          job.id === editingJob.id ? { ...job, ...formData } : job
        )
      );
    } else {
      // Add new job
      const newJob = {
        id: Date.now(), // Use timestamp as unique ID
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setJobs([...jobs, newJob]);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      setJobs(jobs.filter((job) => job.id !== jobId));
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower);
    const matchesStatus =
      selectedStatus === "all" || job.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Job
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
              placeholder="Search jobs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
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
                  Job Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Deadline
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
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">
                          {job.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.company} • {job.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === "active"
                          ? "bg-green-100 text-green-800"
                          : job.status === "closed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5 inline" />
                      <span className="ml-1">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
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
          setEditingJob(null);
        }}
        title={editingJob ? "Edit Job" : "Post New Job"}
      >
        <JobForm
          onSubmit={handleSubmitJob}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
          initialData={editingJob}
        />
      </Modal>
    </div>
  );
}
