import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaSignOutAlt, FaChartLine, FaBell, FaBook, FaClipboardList } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GradesForm = () => {
  const [studentNIN, setStudentNIN] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch students
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/api/grades/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_nin: studentNIN,
        subject,
        grade,
        class: className,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Grade added successfully!');
    } else {
      alert(data.message || 'Failed to add grade.');
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-green-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teacherdb" className="flex items-center space-x-2">
                  <FaChalkboardTeacher />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teacherstudents" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Students</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/attendanceform" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/gradesform" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/courseform" className="flex items-center space-x-2">
                  <FaBook />
                  <span>Courses</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teachereventview" className="flex items-center space-x-2">
                  <FaClipboardList /> <span>Events</span>
                </Link>
              </li>                 
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/notifications" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
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
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Add Grade</h2>
            <p className="text-gray-600">Enter the grade details below.</p>
          </div>

          {/* Search Bar for Students */}
          <div className="mb-6 flex justify-between items-center">
            {showSearch && (
              <div className="flex items-center bg-white p-4 rounded-md shadow-md">
                <input
                  type="text"
                  className="ml-4 w-full p-2 border rounded-md"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {/* Button to Show/Hide Student List and Search Bar */}
            <button
              onClick={() => {
                setShowStudents(!showStudents);
                setShowSearch(!showSearch);
              }}
              className="py-2 px-4 ml-4 bg-green-800 text-white rounded hover:bg-green-700"
            >
              {showStudents ? 'Hide Students' : 'Show Students'}
            </button>
          </div>

          {/* Student List */}
          {showStudents && (
            <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Student</h3>
              <ul className="space-y-4 max-h-64 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <li key={student.id} className="flex justify-between items-center border-b py-2">
                    <span>{student.name} ({student.email})</span>
                    <button
                      onClick={() => setStudentNIN(student.nin)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grade Form */}
          <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Student NIN:</label>
                <input
                  type="text"
                  value={studentNIN}
                  onChange={(e) => setStudentNIN(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Grade:</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Class:</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Add Grade
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GradesForm;