import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  FaFileInvoice,
  FaFile,
} from "react-icons/fa";

function TimetableForm() {
  const [formData, setFormData] = useState({
    type: "student",
    class: "",
    teacher_email: "",
    day: "",
    subject: "",
    time: "",
    location: "",
  });

  const [timetableData, setTimetableData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ type: "student", value: "" });
  const [editId, setEditId] = useState(null);
  const [emailCount, setEmailCount] = useState(0);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = [
    "08:30 - 10:00 AM",
    "10:05 - 11:35 AM",
    "12:00 - 13:30 PM",
    "13:35 - 15:00 PM",
    "15:05 - 17:00 PM",
  ];

  useEffect(() => {
    if (filter.value) {
      fetchTimetable();
    }
    fetchEmailCount();
  }, [filter]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editId ? 
      (formData.type === "student" ? `/api/student-timetable/update/${editId}` : `/api/teacher-timetable/update/${editId}`) :
      (formData.type === "student" ? "/api/student-timetable/add" : "/api/teacher-timetable/add");
    const method = editId ? "PUT" : "POST";
    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    alert(data.message);
    fetchTimetable();
    setEditId(null);
    setFormData({
      type: "student",
      class: "",
      teacher_email: "",
      day: "",
      subject: "",
      time: "",
      location: "",
    });
  };

  const fetchTimetable = async () => {
    const endpoint = filter.type === "student" ? `/api/student-timetable/${filter.value}` : `/api/teacher-timetable/${filter.value}`;
    const response = await fetch(`http://127.0.0.1:8000${endpoint}`);
    const data = await response.json();
    setTimetableData(data);
  };

  const handleDelete = async (id) => {
    const endpoint = filter.type === "student" ? `/api/student-timetable/delete/${id}` : `/api/teacher-timetable/delete/${id}`;
    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: "DELETE",
    });
    const data = await response.json();
    alert(data.message);
    fetchTimetable();
  };

  const handleEdit = (entry) => {
    setFormData({
      type: filter.type,
      class: entry.class || "",
      teacher_email: entry.teacher_email || "",
      day: entry.day,
      subject: entry.subject,
      time: entry.time,
      location: entry.location,
    });
    setEditId(entry.id);
    setShowForm(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
                <Link to="/parent" className="flex items-center space-x-2">
                  <FaUserFriends />
                  <span>Parents</span>
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
                <Link to="/teacherrecord" className="flex items-center space-x-2">
                  <FaFile />
                  <span>Teacher Record</span>
                </Link>
              </li>
            <li className="px-6 py-3 hover:bg-blue-700 relative">
              <Link to="/notificationform" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700 relative">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope />
                <span>Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
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

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Timetable Form</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 py-2 px-4 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {showForm ? "Hide Form" : "Show Form"}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {formData.type === "student" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Email</label>
                  <input
                    type="email"
                    value={formData.teacher_email}
                    onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>Select a day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>Select a time slot</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {editId ? "Update Timetable" : "Add Timetable"}
              </button>
            </form>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Filter Timetable</h2>
            <div className="flex space-x-4">
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              <input
                type="text"
                value={filter.value}
                onChange={(e) => setFilter({ ...filter, value: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={filter.type === "student" ? "Enter Class" : "Enter Email"}
              />
              <button
                onClick={fetchTimetable}
                className="py-2 px-4 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Timetable Data</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="p-3">Day</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetableData.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-300">
                    <td className="p-3">{entry.day}</td>
                    <td className="p-3">{entry.subject}</td>
                    <td className="p-3">{entry.time}</td>
                    <td className="p-3">{entry.location}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="py-1 px-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition duration-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="py-1 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition duration-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TimetableForm;