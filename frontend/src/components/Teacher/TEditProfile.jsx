import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaBook,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaClipboardList,
  FaEnvelope,
  FaSignOutAlt,
  FaBell,
  FaClock,
  FaEdit,
  FaChartLine,
  FaIdCard,
} from "react-icons/fa";

function TEditProfile() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    nin: "",
    password: "",
    role: "teacher",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teacherRecord, setTeacherRecord] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchTeacherData = () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));

        if (loggedInUser) {
          setFormData({
            id: loggedInUser.id,
            name: loggedInUser.name,
            email: loggedInUser.email,
            nin: loggedInUser.nin || "",
            password: "",
            role: loggedInUser.role,
          });

          if (loggedInUser.nin) {
            fetchTeacherRecord(loggedInUser.nin);
          }
        } else {
          setError("Logged-in user not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching user data from localStorage:", error);
        setError("Failed to fetch user data from localStorage");
      }
    };

    fetchTeacherData();
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchTeacherRecord = async (nin) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/teacher-records/${nin}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTeacherRecord(response.data);
    } catch (err) {
      console.error("Error fetching teacher record:", err);
      setError("There is no teacher record");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
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
              <li className="px-6 py-3 hover:bg-green-700 relative">
                <Link to="/tnotificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
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

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">User Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <FaEdit />
                <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-semibold">Name</p>
                    <p className="text-gray-800">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Email</p>
                    <p className="text-gray-800">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">National ID Number (NIN)</p>
                    <p className="text-gray-800">{formData.nin}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 font-semibold">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">National ID Number (NIN)</label>
                    <input
                      type="text"
                      name="nin"
                      value={formData.nin}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
          </div>

          {teacherRecord && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Teacher Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-semibold">Full Name</p>
                  <p className="text-gray-800">{teacherRecord.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Date of Birth</p>
                  <p className="text-gray-800">{teacherRecord.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Gender</p>
                  <p className="text-gray-800">{teacherRecord.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Contact Number</p>
                  <p className="text-gray-800">{teacherRecord.contact_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Email Address</p>
                  <p className="text-gray-800">{teacherRecord.email_address}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Address</p>
                  <p className="text-gray-800">{teacherRecord.address}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Nationality</p>
                  <p className="text-gray-800">{teacherRecord.nationality}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Emergency Contact Name</p>
                  <p className="text-gray-800">{teacherRecord.emergency_contact_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Emergency Contact Number</p>
                  <p className="text-gray-800">{teacherRecord.emergency_contact_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Department</p>
                  <p className="text-gray-800">{teacherRecord.department}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Subjects Assigned</p>
                  <p className="text-gray-800">{teacherRecord.subjects_assigned}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Class & Section Allocation</p>
                  <p className="text-gray-800">{teacherRecord.class_section_allocation}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Date of Joining</p>
                  <p className="text-gray-800">{teacherRecord.date_of_joining}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Employment Type</p>
                  <p className="text-gray-800">{teacherRecord.employment_type}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Attendance & Leave Records</p>
                  <p className="text-gray-800">{teacherRecord.attendance_leave_records}</p>
                </div>
              </div>
            </div>
          )}

          {error && <div className="mt-6 p-4 bg-red-100 text-red-600 rounded">{error}</div>}
          {success && <div className="mt-6 p-4 bg-green-100 text-green-600 rounded">{success}</div>}
        </main>
      </div>
    </div>
  );
}

export default TEditProfile;