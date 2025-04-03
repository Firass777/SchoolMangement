import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaSchool,
  FaClock,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaClipboardList,
  FaFileInvoice,
  FaFile,
  FaBell,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";

function TeacherRecord() {
  const [formData, setFormData] = useState({
    full_name: "",
    teacher_nin: "",
    date_of_birth: "",
    gender: "",
    contact_number: "",
    email_address: "",
    address: "",
    nationality: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    department: "",
    subjects_assigned: "",
    class_section_allocation: "",
    date_of_joining: "",
    employment_type: "",
    attendance_leave_records: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    fetchRecords();
    fetchEmailCount();
  }, [currentPage, searchTerm]);


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

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/teacher-records?page=${currentPage}&search=${searchTerm}`);
      setRecords(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
      let response;
      if (formData.id) {
        response = await axios.put(
          `http://127.0.0.1:8000/api/teacher-records/${formData.id}`,
          formData
        );
        setSuccess("Record updated successfully!");
      } else {
        response = await axios.post(
          "http://127.0.0.1:8000/api/teacher-records",
          formData
        );
        setSuccess("Teacher record submitted successfully!");
      }
  
      setFormData({
        full_name: "",
        teacher_nin: "",
        date_of_birth: "",
        gender: "",
        contact_number: "",
        email_address: "",
        address: "",
        nationality: "",
        emergency_contact_name: "",
        emergency_contact_number: "",
        department: "",
        subjects_assigned: "",
        class_section_allocation: "",
        date_of_joining: "",
        employment_type: "",
        attendance_leave_records: "",
      });
      fetchRecords();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit teacher record. Please try again."
      );
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/teacher-records/${id}`);
      setSuccess("Record deleted successfully!");
      fetchRecords();
    } catch (err) {
      setError("Failed to delete record.");
      console.error(err);
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setShowForm(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/settings" className="flex items-center space-x-2">
                <FaCog />
                <span>Settings</span>
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

      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-white shadow-md rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Teacher Record Form</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? "Hide Form" : "Show Form"}
            </button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Full Name:</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Teacher NIN:</label>
                    <input
                      type="text"
                      name="teacher_nin"
                      value={formData.teacher_nin}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Date of Birth:</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Gender:</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700">Contact Number:</label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Email Address:</label>
                    <input
                      type="email"
                      name="email_address"
                      value={formData.email_address || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Address:</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Nationality:</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Emergency Contact Name:</label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Emergency Contact Number:</label>
                    <input
                      type="text"
                      name="emergency_contact_number"
                      value={formData.emergency_contact_number || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Department:</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Subjects Assigned:</label>
                    <input
                      type="text"
                      name="subjects_assigned"
                      value={formData.subjects_assigned || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Class & Section Allocation:</label>
                    <input
                      type="text"
                      name="class_section_allocation"
                      value={formData.class_section_allocation || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Administrative & Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Date of Joining:</label>
                    <input
                      type="date"
                      name="date_of_joining"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Employment Type:</label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Contractual">Contractual</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700">Attendance & Leave Records:</label>
                    <textarea
                      name="attendance_leave_records"
                      value={formData.attendance_leave_records || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Teacher Records</h3>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="p-2 border rounded"
                />
                <button className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  <FaSearch />
                </button>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left">Full Name</th>
                  <th className="p-3 text-left">Teacher NIN</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-3">{record.full_name}</td>
                    <td className="p-3">{record.teacher_nin}</td>
                    <td className="p-3">{record.department}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(record)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherRecord;