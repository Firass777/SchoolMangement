import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  FaSchool,
  FaClock,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaClipboardList,
  FaFileInvoice,
  FaBell,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

const DocumentsForm = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentNIN, setSelectedStudentNIN] = useState('');
  const [year, setYear] = useState('');
  const [inscriptionFile, setInscriptionFile] = useState(null);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [successFile, setSuccessFile] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch all students with the role 'student'
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users');
        const studentsData = response.data.filter((user) => user.role === 'student');
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('student_nin', selectedStudentNIN);
    formData.append('year', year);
    if (inscriptionFile) formData.append('inscription_pdf', inscriptionFile);
    if (attendanceFile) formData.append('attendance_pdf', attendanceFile);
    if (successFile) formData.append('success_pdf', successFile);

    try {
      const response = await axios.post('http://localhost:8000/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Certificates uploaded successfully!');
    } catch (error) {
      setMessage('Failed to upload certificates.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/admindb" className="flex items-center space-x-2">
                <FaSchool />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/timetableform" className="flex items-center space-x-2">
                <FaClock />
                <span>Time-Table</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/students" className="flex items-center space-x-2">
                <FaUserGraduate />
                <span>Students</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/teachers" className="flex items-center space-x-2">
                <FaChalkboardTeacher />
                <span>Teachers</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/reports" className="flex items-center space-x-2">
                <FaChartBar />
                <span>Reports</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/eventform" className="flex items-center space-x-2">
                <FaClipboardList />
                <span>Event Management</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/documentsform" className="flex items-center space-x-2">
                <FaFileInvoice />
                <span>Documents</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/notifications" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope />
                <span>Emails</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/settings" className="flex items-center space-x-2">
                <FaCog />
                <span>Settings</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-red-600">
              <Link to="/logout" className="flex items-center space-x-2">
                <FaSignOutAlt />
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Certificates</h1>

          {/* Student Selection Dropdown */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <label className="block text-gray-700 font-medium mb-2">Select Student:</label>
            <select
              value={selectedStudentNIN}
              onChange={(e) => setSelectedStudentNIN(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.nin} value={student.nin}>
                  {student.name} ({student.nin})
                </option>
              ))}
            </select>
          </div>

          {/* Year Input */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <label className="block text-gray-700 font-medium mb-2">Year:</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter year (e.g., 2023)"
              required
            />
          </div>

          {/* File Uploads */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <label className="block text-gray-700 font-medium mb-2">Inscription Certificate (PDF):</label>
            <input
              type="file"
              onChange={(e) => setInscriptionFile(e.target.files[0])}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf"
            />
          </div>

          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <label className="block text-gray-700 font-medium mb-2">Attendance Certificate (PDF):</label>
            <input
              type="file"
              onChange={(e) => setAttendanceFile(e.target.files[0])}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf"
            />
          </div>

          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <label className="block text-gray-700 font-medium mb-2">Success Certificate (PDF):</label>
            <input
              type="file"
              onChange={(e) => setSuccessFile(e.target.files[0])}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload Certificates
          </button>

          {/* Message */}
          {message && (
            <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
              <p>{message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsForm;