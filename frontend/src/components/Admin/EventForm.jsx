import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaEnvelope,
  FaUserFriends,
  FaSignOutAlt,
  FaBell,
  FaSchool,
  FaClipboardList,
  FaClock,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaFileInvoice,
  FaFile,
  FaCalendarAlt,
  FaUsers,
  FaInfoCircle,
  FaTimes
} from "react-icons/fa";

const EventForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Event");
  const [visibleTo, setVisibleTo] = useState([]);
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(4);
  const [showForm, setShowForm] = useState(false);
  const [emailCount, setEmailCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Role verification and initialization
  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      // Immediate redirect if no token or local role
      if (!token || !localRole) {
        localStorage.removeItem("user"); // Clear localStorage user data 
        navigate("/access", { replace: true });
        return;
      }

      // Check if role is already verified in session storage
      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "admin") {
        initializeEvents();
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000, 
        });

        if (
          response.data.status === "success" &&
          response.data.role === "admin" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "admin"); 
          initializeEvents();
        } else {
          localStorage.removeItem("user"); // Clear localStorage user data 
          sessionStorage.removeItem("verifiedRole"); 
          navigate("/access", { replace: true });
        }
      } catch (error) {
        console.error("Error verifying role:", error);
        localStorage.removeItem("user"); // Clear localStorage user data 
        sessionStorage.removeItem("verifiedRole"); 
        navigate("/access", { replace: true });
      }
    };

    const initializeEvents = () => {
      fetchEvents();
      fetchEmailCount();
      const emailInterval = setInterval(fetchEmailCount, 30000);
      return () => clearInterval(emailInterval);
    };

    verifyUserAndInitialize();
  }, [navigate]);

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
    try {
      const userData = JSON.parse(localStorage.getItem("user")); 
      const userRole = userData ? userData.role : "admin"; 
      const response = await axios.get("http://localhost:8000/api/events", {
        params: { role: userRole },
      });
      const sortedEvents = response.data.events.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/events/add", {
        name,
        date,
        description,
        type,
        visible_to: visibleTo,
      });

      setMessage("Event added successfully!");
      setShowSuccess(true);
      // Reset form fields
      setName("");
      setDate("");
      setDescription("");
      setType("Event");
      setVisibleTo([]);
      
      fetchEvents();
      setShowForm(false);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      setMessage("Failed to add event.");
      console.error("Error:", error);
    }
  };

  const handleCheckboxChange = (role) => {
    if (visibleTo.includes(role)) {
      setVisibleTo(visibleTo.filter((r) => r !== role));
    } else {
      setVisibleTo([...visibleTo, role]);
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to get color based on event type
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-16 sm:w-64 bg-blue-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Admin Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">AD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/admindb" className="flex items-center space-x-2">
                <FaSchool className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/timetableform" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>                        
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/students" className="flex items-center space-x-2">
                <FaUserGraduate className="text-xl" />
                <span className="hidden sm:block">Students</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/teachers" className="flex items-center space-x-2">
                <FaChalkboardTeacher className="text-xl" />
                <span className="hidden sm:block">Teachers</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/parent" className="flex items-center space-x-2">
                <FaUserFriends className="text-xl" />
                <span className="hidden sm:block">Parents</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/reports" className="flex items-center space-x-2">
                <FaChartBar className="text-xl" />
                <span className="hidden sm:block">Reports</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/eventform" className="flex items-center space-x-2">
                <FaClipboardList className="text-xl" />
                <span className="hidden sm:block">Event Management</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/documentsform" className="flex items-center space-x-2">
                <FaFileInvoice className="text-xl" />
                <span className="hidden sm:block">Documents</span>
              </Link>
            </li>   
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/recordform" className="flex items-center space-x-2">
                <FaFile className="text-xl" />
                <span className="hidden sm:block">Student Record</span>
              </Link>
            </li>        
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/teacherrecord" className="flex items-center space-x-2">
                <FaFile className="text-xl" />
                <span className="hidden sm:block">Teacher Record</span>
              </Link>
            </li> 
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/notificationform" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 relative flex justify-center sm:justify-start">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
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
            <p className="text-gray-600">Create and manage school events</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaPlus className="mr-2" />
            {showForm ? "Hide Form" : "Add Event"}
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FaInfoCircle className="mr-2" />
                <p>Event added successfully!</p>
              </div>
              <button 
                onClick={() => setShowSuccess(false)}
                className="text-green-700 hover:text-green-900"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Add Event Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Event Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter event description"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Event">Event</option>
                    <option value="Training">Training</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Visible To</label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "admin", "teacher", "student", "parent"].map((role) => (
                      <label key={role} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={visibleTo.includes(role)}
                          onChange={() => handleCheckboxChange(role)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        )}

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
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
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{event.description}</p>
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
              <FaClipboardList className="text-5xl mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No events found</h3>
            <p className="text-gray-500">
              {searchTerm ? 
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
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

export default EventForm;