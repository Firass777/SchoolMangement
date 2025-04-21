import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link , useNavigate} from "react-router-dom";
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

  // Fetch all events on component mount
  useEffect(() => {
    // Access Checking
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "admin") {
      navigate("/access");
      return;
    }
    
    fetchEvents();
    fetchEmailCount();
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => clearInterval(emailInterval);
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
    <div className="flex min-h-screen bg-gray-100">
       {/* Sidebar */}
       <aside className="w-16 lg:w-64 bg-blue-800 text-white flex-shrink-0">
         <div className="p-4 flex justify-center lg:justify-start">
           <h1 className="text-xl font-bold hidden lg:block">Admin Dashboard</h1>
           <h1 className="text-xl font-bold block lg:hidden">AD</h1>
         </div>
         <nav className="mt-6">
           <ul>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/admindb" className="flex items-center space-x-2">
                 <FaSchool className="text-xl" />
                 <span className="hidden lg:block">Dashboard</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/timetableform" className="flex items-center space-x-2">
                 <FaClock className="text-xl" />
                 <span className="hidden lg:block">Time-Table</span>
               </Link>
             </li>                        
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/students" className="flex items-center space-x-2">
                 <FaUserGraduate className="text-xl" />
                 <span className="hidden lg:block">Students</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/teachers" className="flex items-center space-x-2">
                 <FaChalkboardTeacher className="text-xl" />
                 <span className="hidden lg:block">Teachers</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/parent" className="flex items-center space-x-2">
                 <FaUserFriends className="text-xl" />
                 <span className="hidden lg:block">Parents</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/reports" className="flex items-center space-x-2">
                 <FaChartBar className="text-xl" />
                 <span className="hidden lg:block">Reports</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/eventform" className="flex items-center space-x-2">
                 <FaClipboardList className="text-xl" />
                 <span className="hidden lg:block">Event Management</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/documentsform" className="flex items-center space-x-2">
                 <FaFileInvoice className="text-xl" />
                 <span className="hidden lg:block">Documents</span>
               </Link>
             </li>   
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/recordform" className="flex items-center space-x-2">
                 <FaFile className="text-xl" />
                 <span className="hidden lg:block">Student Record</span>
               </Link>
             </li>        
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/teacherrecord" className="flex items-center space-x-2">
                 <FaFile className="text-xl" />
                 <span className="hidden lg:block">Teacher Record</span>
               </Link>
             </li> 
             <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
               <Link to="/notificationform" className="flex items-center space-x-2">
                 <FaBell className="text-xl" />
                 <span className="hidden lg:block">Notifications</span>
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-blue-700 relative flex justify-center lg:justify-start">
               <Link to="/aemails" className="flex items-center space-x-2">
                 <FaEnvelope className="text-xl" />
                 <span className="hidden lg:block">Emails</span>
                 {emailCount > 0 && (
                   <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                     {emailCount}
                   </span>
                 )}
               </Link>
             </li>
             <li className="px-4 py-3 hover:bg-red-600 flex justify-center lg:justify-start">
               <Link to="/" className="flex items-center space-x-2">
                 <FaSignOutAlt className="text-xl" />
                 <span className="hidden lg:block">Logout</span>
               </Link>
             </li>
           </ul>
         </nav>
       </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="p-4 bg-white shadow-md rounded-lg flex-1">
          <h2 className="text-xl font-bold mb-4">Event Management</h2>

          {/* Add Event Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 mb-4"
          >
            <FaPlus className="mr-2" />
            {showForm ? "Hide Form" : "Add Event"}
          </button>

          {/* Add Event Form */}
          {showForm && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Add New Event</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm">Event Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm">Event Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm">Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm">Event Type:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    required
                  >
                    <option value="Event">Event</option>
                    <option value="Training">Training</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm">Visible To:</label>
                  <div className="space-y-1">
                    {["all", "admin", "teacher", "student", "parent"].map((role) => (
                      <label key={role} className="flex items-center text-sm">
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
                  className="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add Event
                </button>
              </form>
              {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}
            </div>
          )}

          {/* Event List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">All Events</h3>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
                />
                <button className="p-2 bg-blue-800 text-white rounded-r hover:bg-blue-700">
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Event Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">Name</th>
                    <th className="px-4 py-2 text-left text-sm">Date</th>
                    <th className="px-4 py-2 text-left text-sm">Type</th>
                    <th className="px-4 py-2 text-left text-sm">Visible To</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="px-4 py-3 text-sm">{event.name}</td>
                      <td className="px-4 py-3 text-sm">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{event.type}</td>
                      <td className="px-4 py-3 text-sm">{event.visible_to.join(", ")}</td>
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
                className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                <FaArrowLeft />
              </button>
              <span className="text-sm">Page {currentPage}</span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastEvent >= filteredEvents.length}
                className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
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