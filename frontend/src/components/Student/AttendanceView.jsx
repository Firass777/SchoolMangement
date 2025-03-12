import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaDownload, FaBook, FaEnvelope, FaClock, FaSearch,FaIdCard } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const AttendanceView = () => {
  const [attendances, setAttendances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Function to download attendance as PDF
  const handleDownloadPDF = () => {
    const element = document.getElementById('attendance-table');
    const opt = {
      margin: 10,
      filename: 'attendance_report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save();
  };

  // Function to get color class based on status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'text-green-600 font-semibold';
      case 'absent':
        return 'text-red-600 font-semibold';
      case 'late':
        return 'text-yellow-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  // Filter attendances based on search term
  const filteredAttendances = attendances.filter(attendance =>
    attendance.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Link to="/stimetable" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
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
                  <span>Notifications</span>
                </Link>
              </li>
             <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/seditprofile" className="flex items-center space-x-2">
                  <FaIdCard />
                  <span>Profile</span>
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

          {/* Search and Download Buttons */}
          <div className="mb-6 flex justify-between">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-purple-800"
              />
              <button
                className="px-5 py-3 bg-purple-800 text-white rounded-r hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-800"
              >
                <FaSearch />
              </button>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700"
            >
              <FaDownload className="mr-2" />
              Download as PDF
            </button>
          </div>

          {/* Attendance Table */}
          <div id="attendance-table" className="mb-6 p-6 bg-white shadow-md rounded-lg">
            {filteredAttendances.length === 0 ? (
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
                    {filteredAttendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b">
                        <td className="px-6 py-3">{attendance.subject}</td>
                        <td className={`px-6 py-3 ${getStatusColor(attendance.status)}`}>
                          {attendance.status}
                        </td>
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