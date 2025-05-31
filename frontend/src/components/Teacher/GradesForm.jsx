import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaSignOutAlt, FaChartLine, FaBell, FaBook, FaClipboardList, FaEnvelope, FaClock, FaIdCard, FaSearch, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GradesForm = () => {
  const navigate = useNavigate();
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const gradesPerPage = 5;

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const teacherNin = user?.nin;

  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      if (!token || !localRole || !userData?.email) {
        localStorage.removeItem("user");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "teacher") {
        setIsVerifying(false);
        fetchStudents();
        fetchGrades();
        fetchNotificationCount();
        fetchEmailCount();
        const notificationInterval = setInterval(fetchNotificationCount, 30000);
        const emailInterval = setInterval(fetchEmailCount, 30000);
        return () => {
          clearInterval(notificationInterval);
          clearInterval(emailInterval);
        };
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000,
        });

        if (
          response.data.status === "success" &&
          response.data.role === "teacher" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "teacher");
          setIsVerifying(false);
          fetchStudents();
          fetchGrades();
          fetchNotificationCount();
          fetchEmailCount();
          const notificationInterval = setInterval(fetchNotificationCount, 30000);
          const emailInterval = setInterval(fetchEmailCount, 30000);
          return () => {
            clearInterval(notificationInterval);
            clearInterval(emailInterval);
          };
        } else {
          localStorage.removeItem("user");
          sessionStorage.removeItem("verifiedRole");
          navigate("/access", { replace: true });
        }
      } catch (error) {
        console.error("Error verifying role:", error);
        localStorage.removeItem("user");
        sessionStorage.removeItem("verifiedRole");
        navigate("/access", { replace: true });
      }
    };

    verifyUserAndInitialize();
  }, [navigate, teacherNin]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const studentsData = response.data.filter((user) => user.role === 'student');
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/grades/teacher/${teacherNin}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/notifications/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
        `http://127.0.0.1:8000/api/emails/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
      const response = await axios.post('http://127.0.0.1:8000/api/grades/add', {
        student_nin: studentNIN,
        subject,
        grade,
        class: className,
        teacher_nin: teacherNin,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        setMessage('Grade added successfully!');
        const updatedGrades = await axios.get(`http://127.0.0.1:8000/api/grades/teacher/${teacherNin}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setGrades(updatedGrades.data.grades || []);
        setStudentNIN('');
        setSubject('');
        setGrade('');
        setClassName('');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add grade.');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/grades/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage('Grade deleted successfully!');
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete grade.');
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
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

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

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
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    localStorage.clear();
                  }}
                >
                  <FaSignOutAlt className="text-xl" />
                  <span className="hidden sm:block">Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-auto min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grade Management</h1>
                <p className="text-gray-500 mt-2">Record and manage student academic performance</p>
              </div>
              <button
                onClick={() => {
                  setShowStudents(!showStudents);
                  setShowSearch(!showSearch);
                }}
                className="flex items-center bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" />
                {showStudents ? 'Close Student List' : 'Show Student List'}
              </button>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {showSearch && (
              <div className="mb-6 relative bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
            )}

            {showStudents && (
              <div className="mb-6 bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Directory</h3>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-800">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <button
                        onClick={() => setStudentNIN(student.nin)}
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">New Grade Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student NIN</label>
                    <input
                      value={studentNIN}
                      onChange={(e) => setStudentNIN(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                      <input
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <input
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors"
                  >
                    Submit Grade
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Grade Records</h2>
                <div className="space-y-4">
                  {currentGrades.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No grade records found
                    </div>
                  ) : (
                    currentGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-white transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-gray-800">{grade.student_nin}</span>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {grade.class}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.subject} • Grade: {grade.grade}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          disabled={isDeleting}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {grades.length > gradesPerPage && (
                  <div className="mt-6 flex justify-center">
                    <nav className="inline-flex space-x-1">
                      {Array.from({ length: Math.ceil(grades.length / gradesPerPage) }).map(
                        (_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === index + 1
                                ? 'bg-green-700 text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        )
                      )}
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GradesForm;