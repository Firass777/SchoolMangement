import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt } from 'react-icons/fa';

const AttendanceView = () => {
  const [attendances, setAttendances] = useState([]);

  // Function to fetch attendance data and sort it
  useEffect(() => {
    const fetchAttendance = async () => {
      const studentData = JSON.parse(localStorage.getItem('user'));
      const studentNIN = studentData?.nin;

      if (!studentNIN) return;

      try {
        const response = await fetch(`http://localhost:8000/api/attendance/${studentNIN}`);
        const data = await response.json();

        if (response.ok) {
          // Sort the attendances by created_at in descending order
          const sortedAttendances = data.attendances.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setAttendances(sortedAttendances);
        } else {
          alert(data.message || 'Failed to fetch attendance.');
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, []);

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
                <Link to="/grades" className="flex items-center space-x-2">
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
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Your Attendance</h2>
            <p className="text-lg text-gray-600 mt-2">View your attendance records below:</p>
          </div>

          {/* Attendance Table */}
          <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
            {attendances.length === 0 ? (
              <p className="text-gray-500">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                  <thead className="bg-purple-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Subject</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Class</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b">
                        <td className="px-6 py-3">{attendance.subject}</td>
                        <td className="px-6 py-3">{attendance.status}</td>
                        <td className="px-6 py-3">{attendance.class}</td>
                        <td className="px-6 py-3">{new Date(attendance.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AttendanceView;
