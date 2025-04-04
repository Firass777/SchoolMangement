import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaSearch, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaMoneyCheck } from 'react-icons/fa';

const StudentEventView = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const eventsPerPage = 4;

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

  useEffect(() => {
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
    fetchEvents();
    fetchNotificationCount();
    fetchEmailCount();
    const notificationInterval = setInterval(fetchNotificationCount, 30000);
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => {
      clearInterval(notificationInterval);
      clearInterval(emailInterval);
    };
  }, []);

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
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
                <FaMoneyCheck />
                <span>Payment</span>
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
                <FaEnvelope />
                <span>Emails</span>
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
                <FaBell /> <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/seditprofile" className="flex items-center space-x-2">
                <FaIdCard />
                <span>Profile</span>
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

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Events</h2>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 ml-2 outline-none"
              />
            </div>
          </div>

          {message && <p className="mt-4 text-red-600">{message}</p>}

          {/* Events List */}
          <div className="space-y-6">
            {currentEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => toggleEventDescription(event.id)}
              >
                <h3 className="text-2xl font-semibold text-purple-800 mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Type:</span> {event.type}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                </p>

                {/* Show description if the event is expanded */}
                {expandedEventId === event.id && (
                  <p className="text-gray-600 mt-4">
                    <span className="font-medium">Description:</span> {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredEvents.length > eventsPerPage && (
            <div className="mt-6 flex justify-center space-x-2">
              {Array.from({ length: Math.ceil(filteredEvents.length / eventsPerPage) }).map(
                (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 ${
                      currentPage === index + 1
                        ? 'bg-purple-800 text-white'
                        : 'bg-white text-purple-800'
                    } rounded-lg shadow-md hover:shadow-lg transition-shadow`}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentEventView;