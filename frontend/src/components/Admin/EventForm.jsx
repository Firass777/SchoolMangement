import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSchool ,
  FaClipboardList,
} from "react-icons/fa";

const EventForm = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Event");
  const [visibleTo, setVisibleTo] = useState([]);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/api/events/add",
        {
          name,
          date,
          description,
          type,
          visible_to: visibleTo,
        }
      );

      setMessage("Event added successfully!");
      console.log(response.data);
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
              <Link to="/students" className="flex items-center space-x-2">
                <FaSchool />
                <span>Dashboard</span>
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
              <Link to="/notifications" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/messages" className="flex items-center space-x-2">
                  <FaUsers />
                  <span>Messages</span>
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
          <h2 className="text-2xl font-bold mb-4">Add Event</h2>
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
                {["all", "admin", "teacher", "student", "parent"].map(
                  (role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={visibleTo.includes(role)}
                        onChange={() => handleCheckboxChange(role)}
                        className="mr-2"
                      />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                  )
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-800 text-white rounded hover:bg-purple-700"
            >
              Add Event
            </button>
          </form>
          {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
      </main>
    </div>
  );
};

export default EventForm;
