import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaMoneyCheck, FaBell, FaSignOutAlt, FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice } from 'react-icons/fa';
import axios from 'axios';

const CoursesView = () => {
  const navigate = useNavigate();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("verifiedRole");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const verifyUserAndInitialize = async (retries = 2) => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      if (!token || !localRole || !userData?.email) {
        console.log("Missing token, role, or email, redirecting to /access");
        localStorage.removeItem("user");
        sessionStorage.removeItem("verifiedRole");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole && cachedRole !== "student") {
        console.log("Clearing stale verifiedRole:", cachedRole);
        sessionStorage.removeItem("verifiedRole");
      }

      if (cachedRole === "student") {
        setIsVerifying(false);
        fetchNotificationCount();
        fetchEmailCount();
        const interval = setInterval(() => {
          fetchNotificationCount();
          fetchEmailCount();
        }, 30000);
        return () => clearInterval(interval);
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 5000,
        });

        console.log("Role API Response:", response.data);

        if (
          response.data.status === "success" &&
          response.data.role === "student" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "student");
          setIsVerifying(false);
          fetchNotificationCount();
          fetchEmailCount();
          const interval = setInterval(() => {
            fetchNotificationCount();
            fetchEmailCount();
          }, 30000);
          return () => clearInterval(interval);
        } else {
          console.log("Invalid role or mismatch:", response.data);
          localStorage.removeItem("user");
          sessionStorage.removeItem("verifiedRole");
          navigate("/access", { replace: true });
        }
      } catch (error) {
        console.error("Error verifying role:", error.response?.data || error.message);
        if (retries > 0 && error.response?.status === 401) {
          console.log(`Retrying role verification (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return verifyUserAndInitialize(retries - 1);
        }
        localStorage.removeItem("user");
        sessionStorage.removeItem("verifiedRole");
        navigate("/access", { replace: true });
      }
    };

    verifyUserAndInitialize();
  }, [navigate]);

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

  const fetchCourses = async () => {
    if (!subjectFilter.trim()) {
      setMessage('Please enter a subject to search.');
      setCourses([]);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userClass = userData ? userData.class : null;

      if (!userClass) {
        setMessage('Class information not found. Please log in again.');
        setCourses([]);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/courses');
      const allCourses = response.data.courses;

      const filteredCourses = allCourses.filter(
        (course) =>
          course.class === userClass &&
          course.subject.toLowerCase().includes(subjectFilter.toLowerCase())
      );

      if (filteredCourses.length === 0) {
        setMessage('No courses found matching your search.');
      } else {
        setMessage('');
      }

      setCourses(filteredCourses);
    } catch (error) {
      setMessage('Failed to fetch courses. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id) => {
    window.open(`http://localhost:8000/api/courses/download/${id}`, '_blank');
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        <aside className="w-16 sm:w-64 bg-purple-800 text-white flex flex-col transition-all duration-300">
          <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
            <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Student Dashboard</h1>
            <h1 className="text-xl font-bold block sm:hidden">SD</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/studentdb" className="flex items-center space-x-2">
                  <FaUserGraduate className="text-xl" />
                  <span className="hidden sm:block">Dashboard</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/spayment" className="flex items-center space-x-2">
                  <FaMoneyCheck className="text-xl" />
                  <span className="hidden sm:block">Payment</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/stimetable" className="flex items-center space-x-2">
                  <FaClock className="text-xl" />
                  <span className="hidden sm:block">Time-Table</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/gradesview" className="flex items-center space-x-2">
                  <FaChartLine className="text-xl" />
                  <span className="hidden sm:block">Grades</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/attendanceview" className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-xl" />
                  <span className="hidden sm:block">Attendance</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/courseview" className="flex items-center space-x-2">
                  <FaBook className="text-xl" />
                  <span className="hidden sm:block">Courses</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/studenteventview" className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-xl" />
                  <span className="hidden sm:block">Events</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 relative flex justify-center sm:justify-start">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope className="text-xl" />
                  <span className="hidden sm:block">Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/documents" className="flex items-center space-x-2">
                  <FaFileInvoice className="text-xl" />
                  <span className="hidden sm:block">Documents</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 relative flex justify-center sm:justify-start">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell className="text-xl" />
                  <span className="hidden sm:block">Notifications</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
                <Link to="/seditprofile" className="flex items-center space-x-2">
                  <FaIdCard className="text-xl" />
                  <span className="hidden sm:block">Profile</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-red-600 flex justify-center sm:justify-start">
                <button onClick={handleLogout} className="flex items-center space-x-2">
                  <FaSignOutAlt className="text-xl" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">View Courses</h2>
          <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
            <div className="mb-4">
              <label className="block text-gray-700">Subject:</label>
              <input
                type="text"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                placeholder="Enter subject (e.g., Math)"
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={fetchCourses}
              disabled={isLoading}
              className="w-full py-2 bg-purple-800 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>

            {message && <p className="mt-4 text-red-600">{message}</p>}

            <div className="mt-6">
              {courses.map((course) => (
                <div key={course.id} className="border-b py-4">
                  <h3 className="text-xl font-bold">{course.name}</h3>
                  <p className="text-gray-600">{course.class} - {course.subject}</p>
                  <button
                    onClick={() => handleDownload(course.id)}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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