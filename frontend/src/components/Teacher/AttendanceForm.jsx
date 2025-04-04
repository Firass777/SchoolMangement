import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaSignOutAlt, FaChartLine, FaBell, FaBook, FaClipboardList, FaEnvelope, FaClock, FaIdCard, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AttendanceForm = () => {
  const [studentNIN, setStudentNIN] = useState('');
  const [status, setStatus] = useState('Present');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [attendances, setAttendances] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const attendancesPerPage = 5;

  const user = JSON.parse(localStorage.getItem('user'));
  const teacherNin = user?.nin;

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

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/attendance/teacher/${teacherNin}`);
        setAttendances(response.data?.attendances || []);
      } catch (error) {
        console.error('Error fetching attendances:', error);
      }
    };
    fetchAttendances();
    fetchNotificationCount();
    fetchEmailCount();
    const notificationInterval = setInterval(fetchNotificationCount, 30000);
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => {
      clearInterval(notificationInterval);
      clearInterval(emailInterval);
    };
  }, [teacherNin]);

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread-count/${email}`
      );
      if (response.data) {
        setNotificationCount(response.data.count || 0);
        localStorage.setItem('notificationCount', (response.data.count || 0).toString());
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/emails/unread-count/${email}`
      );
      if (response.data) {
        setEmailCount(response.data.count || 0);
        localStorage.setItem('emailCount', (response.data.count || 0).toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/attendance/add', {
        student_nin: studentNIN,
        status,
        class: className,
        subject,
        teacher_nin: teacherNin,
      });

      if (response.data) {
        setMessage('Attendance added successfully!');
        const updatedAttendances = await axios.get(`http://localhost:8000/api/attendance/teacher/${teacherNin}`);
        setAttendances(updatedAttendances.data?.attendances || []);
        // Reset form
        setStudentNIN('');
        setClassName('');
        setSubject('');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add attendance.');
    }
  };

  const handleDelete = async (id) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`http://localhost:8000/api/attendance/${id}`);
      
      if (response.status === 200) {
        setMessage('Attendance deleted successfully!');
        // Optimistically update the UI
        setAttendances(prev => prev.filter(att => att.id !== id));
      } else {
        setMessage('Failed to delete attendance.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.response?.data?.message || 'Failed to delete attendance.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  const indexOfLastAttendance = currentPage * attendancesPerPage;
  const indexOfFirstAttendance = indexOfLastAttendance - attendancesPerPage;
  const currentAttendances = attendances.slice(indexOfFirstAttendance, indexOfLastAttendance);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Sidebar remains the same */}
      <div className="flex flex-1">
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
                <Link to="/ttimetable" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
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
              <li className="px-6 py-3 hover:bg-green-700 relative">
                <Link to="/temails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700 relative">
                <Link to="/tnotificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teditprofile" className="flex items-center space-x-2">
                  <FaIdCard />
                  <span>Profile</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-red-600">
                <Link to="/" className="flex items-center space-x-2">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Add Attendance</h2>
            <p className="text-gray-600">Enter the attendance details below.</p>
          </div>

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

          {showStudents && (
            <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Student</h3>
              <ul className="space-y-4 max-h-64 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <li key={student.id} className="flex justify-between items-center border-b py-2">
                    <span>{student.name} ({student.email})</span>
                    <button
                      onClick={() => setStudentNIN(student.nin)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                <label className="block text-gray-700">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
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

              <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Add Attendance
              </button>
            </form>
            {message && (
              <p className={`mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Attendances</h3>
            {attendances.length > 0 ? (
              <>
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-green-800 text-white">
                      <th className="px-4 py-2">Student NIN</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Class</th>
                      <th className="px-4 py-2">Subject</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAttendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{attendance.student_nin}</td>
                        <td className="px-4 py-2">{attendance.status}</td>
                        <td className="px-4 py-2">{attendance.class}</td>
                        <td className="px-4 py-2">{attendance.subject}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDelete(attendance.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isDeleting}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-center mt-6">
                  {Array.from({ length: Math.ceil(attendances.length / attendancesPerPage) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`mx-1 px-4 py-2 rounded ${
                        currentPage === i + 1 ? 'bg-green-800 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-gray-500">No attendance records found.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AttendanceForm;