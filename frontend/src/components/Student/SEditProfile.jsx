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
  FaFileInvoice,
  FaMoneyCheck,
  FaMoneyBillWave,
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
  const [studentRecord, setStudentRecord] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

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

          // Fetch student record if NIN is available
          if (loggedInUser.nin) {
            fetchStudentRecord(loggedInUser.nin);
          }
        } else {
          setError("Logged-in user not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching user data from localStorage:", error);
        setError("Failed to fetch user data from localStorage");
      }
    };

    fetchStudentData();
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudentRecord = async (nin) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/student-records/${nin}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStudentRecord(response.data);
    } catch (err) {
      console.error("Error fetching student record:", err);
      setError("There is no student record");
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
                <Link to="/documents" className="flex items-center space-x-2">
                  <FaFileInvoice /> <span>Documents</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700 relative">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
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
                  <FaSignOutAlt />
                  <span>Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Profile</h2>

          {/* User Information Section */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">User Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
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
                  <div>
                    <p className="text-gray-600 font-semibold">Class</p>
                    <p className="text-gray-800">{formData.class}</p>
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">Class</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
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
          </div>

          {/* Student Record Section */}
          {studentRecord && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-semibold">Full Name</p>
                  <p className="text-gray-800">{studentRecord.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Date of Birth</p>
                  <p className="text-gray-800">{studentRecord.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Gender</p>
                  <p className="text-gray-800">{studentRecord.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Grade/Class</p>
                  <p className="text-gray-800">{studentRecord.grade_class}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Section</p>
                  <p className="text-gray-800">{studentRecord.section}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Enrollment Date</p>
                  <p className="text-gray-800">{studentRecord.enrollment_date}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Parent Name</p>
                  <p className="text-gray-800">{studentRecord.parent_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Relationship</p>
                  <p className="text-gray-800">{studentRecord.relationship}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Contact Number</p>
                  <p className="text-gray-800">{studentRecord.contact_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Email Address</p>
                  <p className="text-gray-800">{studentRecord.email_address}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Address</p>
                  <p className="text-gray-800">{studentRecord.address}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Previous School</p>
                  <p className="text-gray-800">{studentRecord.previous_school || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Admission Status</p>
                  <p className="text-gray-800">{studentRecord.admission_status}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Scholarship</p>
                  <p className="text-gray-800">{studentRecord.scholarship ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Payment Amount</p>
                  <p className="text-gray-800 ">${studentRecord.payment_amount}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Emergency Contact Name</p>
                  <p className="text-gray-800">{studentRecord.emergency_contact_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Emergency Contact Number</p>
                  <p className="text-gray-800">{studentRecord.emergency_contact_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Medical Conditions</p>
                  <p className="text-gray-800">{studentRecord.medical_conditions || "None"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Special Needs</p>
                  <p className="text-gray-800">{studentRecord.special_needs ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Extracurricular Interests</p>
                  <p className="text-gray-800">{studentRecord.extracurricular_interests || "None specified"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && <div className="mt-6 p-4 bg-red-100 text-red-600 rounded">{error}</div>}
          {success && <div className="mt-6 p-4 bg-green-100 text-green-600 rounded">{success}</div>}
        </main>
      </div>
    </div>
  );
}

export default EditProfile;