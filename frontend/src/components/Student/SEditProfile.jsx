import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaBook,
  FaCalendarAlt,
  FaChartBar,
  FaClipboardList,
  FaEnvelope,
  FaSignOutAlt,
  FaBell,
  FaClock,
  FaEdit,
  FaIdCard,
} from "react-icons/fa";

function EditProfile() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    nin: "",
    password: "",
    role: "student",
    class: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 

  // Fetch the logged-in student's data from localStorage
  useEffect(() => {
    const fetchStudentData = () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));

        console.log("Logged-in User Data from localStorage:", loggedInUser);

        if (loggedInUser) {
          setFormData({
            id: loggedInUser.id,
            name: loggedInUser.name,
            email: loggedInUser.email,
            nin: loggedInUser.nin || "",
            password: "",
            role: loggedInUser.role,
            class: loggedInUser.class || "",
          });
        } else {
          setError("Logged-in user not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching user data from localStorage:", error);
        setError("Failed to fetch user data from localStorage");
      }
    };

    fetchStudentData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // If password is blank, remove it from the form data
      const dataToSend = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await axios.put(
        `http://127.0.0.1:8000/api/users/${formData.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess("Profile updated successfully!");

      // Update the user data in localStorage
      const updatedUser = { ...formData, ...dataToSend };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setFormData({ ...formData, password: "" });
      setIsEditing(false); 
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email || "Failed to update profile.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-purple-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studentdb" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Dashboard</span>
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
                  <FaChartBar />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/attendanceview" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/courseview" className="flex items-center space-x-2">
                  <FaBook />
                  <span>Courses</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studenteventview" className="flex items-center space-x-2">
                  <FaClipboardList />
                  <span>Events</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaIdCard />
                  <span>Profile</span>
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
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
          <div className="p-6 bg-white shadow-md rounded-md mb-6">
            {/* Display User Data */}
            {!isEditing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">User Information</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <p><span className="font-semibold">Name:</span> {formData.name}</p>
                  <p><span className="font-semibold">Email:</span> {formData.email}</p>
                  <p><span className="font-semibold">National ID Number (NIN):</span> {formData.nin}</p>
                  <p><span className="font-semibold">Class:</span> {formData.class}</p>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {isEditing && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">National ID Number (NIN):</label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">New Password (leave blank to keep current):</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Class:</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-2"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Error and Success Messages */}
            {error && <div className="text-red-500 mt-3">{error}</div>}
            {success && <div className="text-green-500 mt-3">{success}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditProfile;