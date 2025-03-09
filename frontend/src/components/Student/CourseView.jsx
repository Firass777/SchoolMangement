import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

const CoursesView = () => {
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/courses', {
        params: {
          class: classFilter,
          subject: subjectFilter,
        },
      });

      setCourses(response.data.courses);
      setMessage('');
    } catch (error) {
      setMessage('No courses found.');
      setCourses([]);
      console.error('Error:', error);
    }
  };

  const handleDownload = async (id) => {
    window.open(`http://localhost:8000/api/courses/download/${id}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-purple-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studentdb" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/gradesview" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/attendanceview" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/courseview" className="flex items-center space-x-2">
                  <FaBook  />
                  <span>Courses</span>
                </Link>
              </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/studenteventview" className="flex items-center space-x-2">
                <FaCalendarAlt /> <span>Events</span>
              </Link>
            </li>   
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>                          
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notification</span>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">View Courses</h2>
          <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
            <div className="mb-4">
              <label className="block text-gray-700">Class:</label>
              <input
                type="text"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Subject:</label>
              <input
                type="text"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={fetchCourses}
              className="w-full py-2 bg-purple-800 text-white rounded hover:bg-purple-700"
            >
              Search
            </button>

            {message && <p className="mt-4 text-red-600">{message}</p>}

            <div className="mt-6">
              {courses.map((course) => (
                <div key={course.id} className="border-b py-4">
                  <h3 className="text-xl font-bold">{course.name}</h3>
                  <p className="text-gray-600">{course.class} - {course.subject}</p>
                  <button
                    onClick={() => handleDownload(course.id)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursesView;