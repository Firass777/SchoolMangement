import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaEnvelope, FaSearch, FaClock, FaIdCard, FaChalkboardTeacher, FaBook, FaClipboardList } from 'react-icons/fa';

const TNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const notificationsPerPage = 4;

  useEffect(() => {
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
          // Update the count in state and localStorage when fetching notifications
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

    const fetchEmailCount = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData?.email;
      
      if (!email) return;

      try {
        const response = await fetch(
          `http://localhost:8000/api/emails/unread-count/${email}`
        );
        const data = await response.json();
        if (data) {
          setEmailCount(data.count);
          localStorage.setItem('emailCount', data.count.toString());
        }
      } catch (error) {
        console.error("Error fetching email count:", error);
      }
    };

    fetchNotifications();
    fetchEmailCount();
    
    // Mark notifications as read when page is viewed
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
          // Clear the count in state and localStorage when marked as read
          setNotificationCount(0);
          localStorage.setItem('notificationCount', '0');
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

    markAsRead();
    
    // Check for new notifications and emails every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchEmailCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto min-h-screen bg-gray-50">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Notifications</h2>
            <p className="text-lg text-gray-600 mt-2">Stay updated with the latest alerts.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg shadow">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {currentNotifications.length === 0 ? (
              <div className="p-6 bg-white shadow-md rounded-lg text-gray-500 text-center">
                No notifications found.
              </div>
            ) : (
              currentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 bg-white shadow-md rounded-lg flex justify-between items-center border-l-4 ${
                    !notification.read_at 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300'
                  } hover:shadow-lg transition-shadow`}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {notification.title}
                      {!notification.read_at && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </h3>
                    <p className="mt-2 text-gray-600">{notification.description}</p>
                  </div>
                  <span className="text-sm text-gray-500 ml-6 italic">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredNotifications.length > notificationsPerPage && (
            <div className="mt-8 flex justify-center space-x-2">
              {Array.from({ length: Math.ceil(filteredNotifications.length / notificationsPerPage) }).map(
                (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TNotification;