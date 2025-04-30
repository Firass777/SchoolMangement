import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

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
      if (cachedRole === "teacher") {
        setIsVerifying(false);
        fetchTeacherData();
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
          response.data.role === "teacher" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "teacher");
          setIsVerifying(false);
          fetchTeacherData();
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

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/notifications/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
        `http://127.0.0.1:8000/api/emails/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        setEmailCount(response.data.count);
        localStorage.setItem('emailCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
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

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        <aside className="w-16 sm:w-64 bg-green-800 text-white flex flex-col transition-all duration-300">
          <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
            <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Teacher Dashboard</h1>
            <h1 className="text-xl font-bold block sm:hidden">TD</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/teacherdb" className="flex items-center space-x-2">
                  <FaChalkboardTeacher className="text-xl" />
                  <span className="hidden sm:block">Dashboard</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/ttimetable" className="flex items-center space-x-2">
                  <FaClock className="text-xl" />
                  <span className="hidden sm:block">Time-Table</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/attendanceform" className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-xl" />
                  <span className="hidden sm:block">Attendance</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/gradesform" className="flex items-center space-x-2">
                  <FaChartLine className="text-xl" />
                  <span className="hidden sm:block">Grades</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/courseform" className="flex items-center space-x-2">
                  <FaBook className="text-xl" />
                  <span className="hidden sm:block">Courses</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/teachereventview" className="flex items-center space-x-2">
                  <FaClipboardList className="text-xl" />
                  <span className="hidden sm:block">Events</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
                <Link to="/temails" className="flex items-center space-x-2">
                  <FaEnvelope className="text-xl" />
                  <span className="hidden sm:block">Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
                <Link to="/tnotificationview" className="flex items-center space-x-2">
                  <FaBell className="text-xl" />
                  <span className="hidden sm:block">Notifications</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
                <Link to="/teditprofile" className="flex items-center space-x-2">
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