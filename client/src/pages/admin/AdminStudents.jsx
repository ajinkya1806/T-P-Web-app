import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Modal } from "../../components/Modal";
import { StudentForm } from "../../components/forms/StudentForm";

// Create dummy students data
const dummyStudents = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    rollNumber: "CS2020001",
    branch: "Computer Science",
    year: 4,
    cgpa: "9.2",
    phone: "9876543210",
    resume: null,
    createdAt: new Date("2024-03-15").toISOString(),
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    rollNumber: "EC2020015",
    branch: "Electronics",
    year: 4,
    cgpa: "8.7",
    phone: "9876543211",
    resume: null,
    createdAt: new Date("2024-03-18").toISOString(),
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    rollNumber: "ME2020032",
    branch: "Mechanical",
    year: 4,
    cgpa: "8.5",
    phone: "9876543212",
    resume: null,
    createdAt: new Date("2024-03-20").toISOString(),
  },
  {
    id: 4,
    name: "Sneha Gupta",
    email: "sneha.gupta@example.com",
    rollNumber: "CS2020045",
    branch: "Computer Science",
    year: 4,
    cgpa: "9.5",
    phone: "9876543213",
    resume: null,
    createdAt: new Date("2024-03-22").toISOString(),
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    rollNumber: "CE2020028",
    branch: "Civil",
    year: 4,
    cgpa: "8.3",
    phone: "9876543214",
    resume: null,
    createdAt: new Date("2024-03-25").toISOString(),
  },
  {
    id: 6,
    name: "Neha Verma",
    email: "neha.verma@example.com",
    rollNumber: "CH2020019",
    branch: "Chemical",
    year: 4,
    cgpa: "8.9",
    phone: "9876543215",
    resume: null,
    createdAt: new Date("2024-03-28").toISOString(),
  },
];

export function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [students, setStudents] = useState(dummyStudents);

  // Load students from localStorage on component mount
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem("students");
      if (savedStudents) {
        const parsedStudents = JSON.parse(savedStudents);
        // Only use saved students if the array is not empty
        if (parsedStudents && parsedStudents.length > 0) {
          setStudents(parsedStudents);
        } else {
          // If empty array, use dummy data and save to localStorage
          localStorage.setItem("students", JSON.stringify(dummyStudents));
        }
      } else {
        // If no data in localStorage, save dummy data
        localStorage.setItem("students", JSON.stringify(dummyStudents));
      }
    } catch (error) {
      console.error("Error loading students:", error);
      // If error, use dummy data
      setStudents(dummyStudents);
      localStorage.setItem("students", JSON.stringify(dummyStudents));
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const handleSubmitStudent = (formData) => {
    if (editingStudent) {
      // Update existing student
      setStudents(
        students.map((student) =>
          student.id === editingStudent.id
            ? { ...student, ...formData }
            : student
        )
      );
    } else {
      // Add new student
      const newStudent = {
        id: Date.now(), // Use timestamp as unique ID
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setStudents([...students, newStudent]);
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((student) => student.id !== studentId));
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.rollNumber.toLowerCase().includes(searchLower) ||
      student.branch.toLowerCase().includes(searchLower);
    const matchesBranch =
      selectedBranch === "all" || student.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <button
          onClick={() => {
            setEditingStudent(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Student
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
              placeholder="Search students..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="w-48">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Chemical">Chemical</option>
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
                  Student Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Branch & Year
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  CGPA
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email} • {student.rollNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.branch} • Year {student.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.cgpa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5 inline" />
                      <span className="ml-1">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
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
          setEditingStudent(null);
        }}
        title={editingStudent ? "Edit Student" : "Add Student"}
      >
        <StudentForm
          onSubmit={handleSubmitStudent}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingStudent(null);
          }}
          initialData={editingStudent}
        />
      </Modal>
    </div>
  );
}
