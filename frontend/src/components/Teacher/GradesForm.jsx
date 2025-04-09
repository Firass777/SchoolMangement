import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaSignOutAlt, FaChartLine, FaBell, FaBook, FaClipboardList, FaEnvelope, FaClock, FaIdCard, FaSearch, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
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
  const [grades, setGrades] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const gradesPerPage = 5;

  const user = JSON.parse(localStorage.getItem('user'));
  const teacherNin = user.nin;

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
    const fetchGrades = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/grades/teacher/${teacherNin}`);
        setGrades(response.data.grades);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    fetchGrades();
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
        setNotificationCount(response.data.count);
        localStorage.setItem('notificationCount', response.data.count.toString());
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
        setEmailCount(response.data.count);
        localStorage.setItem('emailCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

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
        teacher_nin: teacherNin,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage('Grade added successfully!');
      const updatedGrades = await axios.get(`http://localhost:8000/api/grades/teacher/${teacherNin}`);
      setGrades(updatedGrades.data.grades);
    } else {
      setMessage(data.message || 'Failed to add grade.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/grades/delete/${id}`);
      setMessage('Grade deleted successfully!');
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
    } catch (error) {
      setMessage('Failed to delete grade.');
      console.error('Error:', error);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  const indexOfLastGrade = currentPage * gradesPerPage;
  const indexOfFirstGrade = indexOfLastGrade - gradesPerPage;
  const currentGrades = grades.slice(indexOfFirstGrade, indexOfLastGrade);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
      <aside className="w-16 sm:w-64 bg-green-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Teacher Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">TD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teacherdb" className="flex items-center space-x-2">
                <FaChalkboardTeacher className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/ttimetable" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/attendanceform" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Attendance</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/gradesform" className="flex items-center space-x-2">
                <FaChartLine className="text-xl" />
                <span className="hidden sm:block">Grades</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/courseform" className="flex items-center space-x-2">
                <FaBook className="text-xl" />
                <span className="hidden sm:block">Courses</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teachereventview" className="flex items-center space-x-2">
                <FaClipboardList className="text-xl" />
                <span className="hidden sm:block">Events</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
              <Link to="/temails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
              <Link to="/tnotificationview" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teditprofile" className="flex items-center space-x-2">
                <FaIdCard className="text-xl" />
                <span className="hidden sm:block">Profile</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-red-600 flex justify-center sm:justify-start">
              <Link to="/" className="flex items-center space-x-2">
                <FaSignOutAlt className="text-xl" />
                <span className="hidden sm:block">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Add Grade</h2>
            <p className="text-gray-600">Enter the grade details below.</p>
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
            {message && <p className="mt-4 text-green-600">{message}</p>}
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Grades List</h3>
            {currentGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto min-w-max">
                  <thead>
                    <tr className="bg-green-800 text-white">
                      <th className="px-4 py-2 text-left">Student NIN</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Grade</th>
                      <th className="px-4 py-2 text-left">Class</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGrades.map((grade) => (
                      <tr key={grade.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{grade.student_nin}</td>
                        <td className="px-4 py-2">{grade.subject}</td>
                        <td className="px-4 py-2">{grade.grade}</td>
                        <td className="px-4 py-2">{grade.class}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No grade records found.</p>
            )}

            <div className="flex justify-center mt-6">
              {Array.from({ length: Math.ceil(grades.length / gradesPerPage) }, (_, i) => (
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default GradesForm;