import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaEnvelope,
  FaCog,
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
} from "react-icons/fa";

const EventForm = () => {
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

  // Fetch all events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user")); 
      const userRole = userData ? userData.role : "admin"; 
      const response = await axios.get("http://localhost:8000/api/events", {
        params: { role: userRole },
      });
      console.log("API Response:", response.data); 
      const sortedEvents = response.data.events.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      console.log("Sorted Events:", sortedEvents); 
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
      fetchEvents(); 
      setShowForm(false); 
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
  console.log("Filtered Events:", filteredEvents); 

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  console.log("Current Events (Pagination):", currentEvents); 

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/admindb" className="flex items-center space-x-2">
                <FaSchool />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/timetableform" className="flex items-center space-x-2">
                <FaClock />
                <span>Time-Table</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/students" className="flex items-center space-x-2">
                <FaUserGraduate />
                <span>Students</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/teachers" className="flex items-center space-x-2">
                <FaChalkboardTeacher />
                <span>Teachers</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/reports" className="flex items-center space-x-2">
                <FaChartBar />
                <span>Reports</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/eventform" className="flex items-center space-x-2">
                <FaClipboardList />
                <span>Event Management</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/documentsform" className="flex items-center space-x-2">
                <FaFileInvoice />
                <span>Documents</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/recordform" className="flex items-center space-x-2">
                <FaFile />
                <span>Student Record</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/notificationform" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope />
                <span>Emails</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/settings" className="flex items-center space-x-2">
                <FaCog />
                <span>Settings</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-red-600">
              <Link to="/logout" className="flex items-center space-x-2">
                <FaSignOutAlt />
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Event Management</h2>

          {/* Add Event Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 mb-4"
          >
            <FaPlus className="mr-2" />
            {showForm ? "Hide Form" : "Add Event"}
          </button>

          {/* Add Event Form */}
          {showForm && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Add New Event</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Event Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Event Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Event Type:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="Event">Event</option>
                    <option value="Training">Training</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Visible To:</label>
                  <div className="space-y-2">
                    {["all", "admin", "teacher", "student", "parent"].map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={visibleTo.includes(role)}
                          onChange={() => handleCheckboxChange(role)}
                          className="mr-2"
                        />
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
                >
                  Add Event
                </button>
              </form>
              {message && <p className="mt-4 text-green-600">{message}</p>}
            </div>
          )}

          {/* Event List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">All Events</h3>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
                <button className="p-3 bg-blue-800 text-white rounded-r hover:bg-blue-700">
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Event Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Visible To</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="px-6 py-4">{event.name}</td>
                      <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{event.type}</td>
                      <td className="px-6 py-4">{event.visible_to.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                <FaArrowLeft />
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastEvent >= filteredEvents.length}
                className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventForm;