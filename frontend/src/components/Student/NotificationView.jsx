import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaEnvelope, FaSearch, FaClock, FaIdCard, FaMoneyCheck, FaBook, FaFileInvoice } from 'react-icons/fa';

const SNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const notificationsPerPage = 4;

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
          const unreadCount = data.notifications.filter(n => !n.read_at).length;
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
          localStorage.setItem('notificationCount', '0');
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

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
  }, []);

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

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        <aside className="w-64 bg-purple-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studentdb" className="flex items-center space-x-2">
                  <FaUserGraduate /> <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/spayment" className="flex items-center space-x-2">
                  <FaMoneyCheck /> <span>Payment</span>
                </Link>
              </li>              
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/stimetable" className="flex items-center space-x-2">
                  <FaClock /> <span>Time-Table</span>
                </Link>
              </li>             
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/gradesview" className="flex items-center space-x-2">
                  <FaChartLine /> <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/attendanceview" className="flex items-center space-x-2">
                  <FaCalendarAlt /> <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/courseview" className="flex items-center space-x-2">
                  <FaBook /> <span>Courses</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studenteventview" className="flex items-center space-x-2">
                  <FaCalendarAlt /> <span>Events</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700 relative">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope /> <span>Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/documents" className="flex items-center space-x-2">
                  <FaFileInvoice /> <span>Documents</span>
                </Link>
              </li>              
              <li className="px-6 py-3 hover:bg-purple-700 relative">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/seditprofile" className="flex items-center space-x-2">
                  <FaIdCard /> <span>Profile</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-red-600">
                <Link to="/" className="flex items-center space-x-2">
                  <FaSignOutAlt /> <span>Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-auto min-h-screen bg-gray-50">
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Notifications</h2>
            <p className="text-lg text-gray-600 mt-2">Stay updated with the latest alerts.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg shadow">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Purple-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

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
                      ? 'border-Purple-500 bg-Purple-50' 
                      : 'border-gray-300'
                  } hover:shadow-lg transition-shadow`}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {notification.title}
                      {!notification.read_at && (
                        <span className="ml-2 text-xs bg-Purple-500 text-white px-2 py-1 rounded-full">
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

          {filteredNotifications.length > notificationsPerPage && (
            <div className="mt-8 flex justify-center space-x-2">
              {Array.from({ length: Math.ceil(filteredNotifications.length / notificationsPerPage) }).map(
                (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-Purple-600 text-white'
                        : 'bg-white text-Purple-600 border border-Purple-600 hover:bg-Purple-50'
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

export default SNotification;