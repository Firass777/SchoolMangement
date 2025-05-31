import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaSearch, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaMoneyCheck, FaArrowLeft, FaArrowRight, FaUsers, FaInfoCircle, FaTimes } from 'react-icons/fa';

const StudentEventView = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);
  const eventsPerPage = 4;

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
        fetchEvents();
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
          fetchEvents();
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

  // Fetch notification count
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

  const fetchEvents = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.role) {
      setMessage('User role not found. Please log in again.');
      return;
    }
    const userRole = userData.role;
    try {
      const response = await axios.get('http://localhost:8000/api/events', {
        params: { role: userRole },
      });

      // Sort events by date (newest to oldest)
      const sortedEvents = response.data.events.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents); 
      setMessage('');
    } catch (error) {
      setMessage('No events found.');
      setEvents([]);
      setFilteredEvents([]);
    }
  };

  // Toggle the expanded state of an event
  const toggleEventDescription = (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null); // Collapse if already expanded
    } else {
      setExpandedEventId(eventId); // Expand the clicked event
    }
  };

  // Handle search
  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to the first page after search
  }, [searchQuery, events]);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getEventTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'training':
        return 'bg-green-100 text-green-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
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
              <Link to="/" className="flex items-center space-x-2">
                <FaSignOutAlt className="text-xl" />
                <span className="hidden sm:block">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
            <p className="text-gray-600">View school events</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>Showing {filteredEvents.length} events</span>
            </div>
          </div>
        </div>

        {/* Events List - Card Layout */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {currentEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                onClick={() => toggleEventDescription(event.id)}
              >
                <div className={`p-4 ${getEventTypeColor(event.type)}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg truncate">{event.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaCalendarAlt className="mr-2" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}</span>
                  </div>
                  <p className={`text-gray-700 text-sm mb-4 ${expandedEventId === event.id ? '' : 'line-clamp-2'}`}>
                    {event.description}
                  </p>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaUsers className="mr-2" />
                    <span>Visible to: {event.visible_to.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FaCalendarAlt className="text-5xl mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No events found</h3>
            <p className="text-gray-500">
              {searchQuery ? 
                "No events match your search criteria" : 
                "There are currently no events scheduled"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredEvents.length > eventsPerPage && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastEvent >= filteredEvents.length}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstEvent + 1}</span> to{' '}
                  <span className="font-medium">
                    {indexOfLastEvent > filteredEvents.length ? filteredEvents.length : indexOfLastEvent}
                  </span>{' '}
                  of <span className="font-medium">{filteredEvents.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FaArrowLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.ceil(filteredEvents.length / eventsPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastEvent >= filteredEvents.length}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentEventView;