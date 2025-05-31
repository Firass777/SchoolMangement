import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaEnvelope, FaSearch, FaClock, FaIdCard, FaMoneyCheck, FaBook, FaFileInvoice, FaRegCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const SNotification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);
  const notificationsPerPage = 4;

  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      if (!token || !localRole) {
        localStorage.removeItem("user");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "student") {
        setIsVerifying(false);
        fetchNotifications();
        markAsRead();
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
          response.data.role === "student" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "student");
          setIsVerifying(false);
          fetchNotifications();
          markAsRead();
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

  const fetchNotifications = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const email = userData?.email;

    if (!email) {
      setError('User email not found in localStorage.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${email}`);
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        const unreadCount = data.notifications.filter(n => !n.read_at).length;
        setNotificationCount(unreadCount);
        localStorage.setItem('notificationCount', unreadCount.toString());
      } else {
        setError(data.message || 'Failed to fetch notifications.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await fetch(`http://localhost:8000/api/notifications/mark-as-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setNotificationCount(0);
        localStorage.setItem('notificationCount', '0');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                <h1 className="text-3xl font-bold text-gray-900">Notifications Center</h1>
                <p className="text-gray-500 mt-2">Manage and review your alerts</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={markAsRead}
                  className="flex items-center bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-lg transition-colors"
                >
                  <FaRegCheckCircle className="mr-2" />
                  Mark All Read
                </button>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-xl shadow-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {currentNotifications.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm">
                  <div className="text-gray-300 text-6xl mb-3">
                    <FaBell className="inline-block" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-500">No notifications found</h3>
                  <p className="text-gray-400 mt-1">All caught up! Check back later.</p>
                </div>
              ) : (
                currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 bg-white rounded-xl shadow-sm flex items-start justify-between transition-all ${
                      !notification.read_at
                        ? 'border-l-4 border-purple-600 hover:shadow-md'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-800">
                          {notification.title}
                        </h3>
                        {!notification.read_at && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{notification.description}</p>
                      <div className="mt-3 flex items-center text-sm text-gray-400">
                        <FaClock className="mr-2" />
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredNotifications.length > notificationsPerPage && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex space-x-1">
                  {Array.from({ length: Math.ceil(filteredNotifications.length / notificationsPerPage) }).map(
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === index + 1
                            ? 'bg-purple-700 text-white'
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
        </main>
      </div>
    </div>
  );
};

export default SNotification;