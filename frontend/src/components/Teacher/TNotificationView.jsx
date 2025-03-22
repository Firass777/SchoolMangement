import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaEnvelope, FaSearch, FaChalkboardTeacher, FaClipboardList, FaClock, FaIdCard } from 'react-icons/fa';

const TNotificationView = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
        } else {
          setError(data.message || 'Failed to fetch notifications.');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
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
                <Link to="/teacherstudents" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Students</span>
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
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/temails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>                  
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/tnotificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
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
                  className="p-6 bg-white shadow-md rounded-lg flex justify-between items-center border-l-4 border-green-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{notification.title}</h3>
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

export default TNotificationView;