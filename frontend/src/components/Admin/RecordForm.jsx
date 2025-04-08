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
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserFriends,
} from "react-icons/fa";

function RecordForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    student_nin: "",
    date_of_birth: "",
    gender: "",
    grade_class: "",
    section: "",
    enrollment_date: "",
    parent_name: "",
    relationship: "",
    other_relationship: "",
    contact_number: "",
    email_address: "",
    address: "",
    previous_school: "",
    transfer_certificate: false,
    admission_status: "",
    scholarship: false,
    payment_amount: 0,
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_number: "",
    medical_conditions: "",
    special_needs: false,
    special_needs_details: "",
    extracurricular_interests: "",
    added_by_admin: "",
    date_of_entry: "",
    remarks: "",
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
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => clearInterval(emailInterval);
  }, [currentPage, searchTerm]);

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

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/student-records?page=${currentPage}&search=${searchTerm}`);
      setRecords(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
          `http://127.0.0.1:8000/api/student-records/${formData.id}`,
          formData
        );
        setSuccess("Record updated successfully!");
      } else {
        response = await axios.post(
          "http://127.0.0.1:8000/api/student-records",
          formData
        );
        setSuccess("Student record submitted successfully!");
      }
  
      setFormData({
        full_name: "",
        student_nin: "",
        date_of_birth: "",
        gender: "",
        grade_class: "",
        section: "",
        enrollment_date: "",
        parent_name: "",
        relationship: "",
        other_relationship: "",
        contact_number: "",
        email_address: "",
        address: "",
        previous_school: "",
        transfer_certificate: false,
        admission_status: "",
        scholarship: false,
        payment_amount: 0,
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_number: "",
        medical_conditions: "",
        special_needs: false,
        special_needs_details: "",
        extracurricular_interests: "",
        added_by_admin: "",
        date_of_entry: "",
        remarks: "",
      });
      fetchRecords();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit student record. Please try again."
      );
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/student-records/${id}`);
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
    <div className="flex min-h-screen bg-gray-100">
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
                    <span className="absolute top-1 right-1 sm:right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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

      <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
        <div className="bg-white shadow-md rounded-md p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Student Record Form</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              {showForm ? "Hide Form" : "Show Form"}
            </button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Student Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-gray-700">Student NIN:</label>
                    <input
                      type="text"
                      name="student_nin"
                      value={formData.student_nin}
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
                    <label className="block text-gray-700">Grade/Class:</label>
                    <input
                      type="text"
                      name="grade_class"
                      value={formData.grade_class || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Section:</label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Enrollment Date:</label>
                    <input
                      type="date"
                      name="enrollment_date"
                      value={formData.enrollment_date}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Parent/Guardian Name:</label>
                    <input
                      type="text"
                      name="parent_name"
                      value={formData.parent_name || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Relationship:</label>
                    <select
                      name="relationship"
                      value={formData.relationship }
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {formData.relationship === "Other" && (
                    <div>
                      <label className="block text-gray-700">Specify Relationship:</label>
                      <input
                        type="text"
                        name="other_relationship"
                        value={formData.other_relationship || "" }
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  )}
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
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Academic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Previous School:</label>
                    <input
                      type="text"
                      name="previous_school"
                      value={formData.previous_school || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Transfer Certificate:</label>
                    <input
                      type="checkbox"
                      name="transfer_certificate"
                      checked={formData.transfer_certificate}
                      onChange={handleChange}
                      className="p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Admission Status:</label>
                    <select
                      name="admission_status"
                      value={formData.admission_status || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select</option>
                      <option value="New Admission">New Admission</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Returning Student">Returning Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700">Scholarship:</label>
                    <input
                      type="checkbox"
                      name="scholarship"
                      checked={formData.scholarship}
                      onChange={handleChange}
                      className="p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Payment Amount ($):</label>
                    <input
                      type="number"
                      name="payment_amount"
                      value={formData.payment_amount || 0}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-gray-700">Relationship:</label>
                    <input
                      type="text"
                      name="emergency_contact_relationship"
                      value={formData.emergency_contact_relationship || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Contact Number:</label>
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
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Medical Conditions:</label>
                    <textarea
                      name="medical_conditions"
                      value={formData.medical_conditions || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Special Needs:</label>
                    <input
                      type="checkbox"
                      name="special_needs"
                      checked={formData.special_needs || ""}
                      onChange={handleChange}
                      className="p-2 border rounded"
                    />
                    {formData.special_needs && (
                      <input
                        type="text"
                        name="special_needs_details"
                        value={formData.special_needs_details || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-2"
                        placeholder="Specify special needs"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700">Extracurricular Interests:</label>
                    <textarea
                      name="extracurricular_interests"
                      value={formData.extracurricular_interests || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Admin Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Added by (Admin Name):</label>
                    <input
                      type="text"
                      name="added_by_admin"
                      value={formData.added_by_admin || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Date of Entry:</label>
                    <input
                      type="date"
                      name="date_of_entry"
                      value={formData.date_of_entry}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Remarks:</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks|| ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
              >
                Submit
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h3 className="text-lg sm:text-xl font-bold">Student Records</h3>
              <div className="flex items-center w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full sm:w-64 p-2 border rounded"
                />
                <button className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  <FaSearch />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Full Name</th>
                    <th className="p-3 text-left">Student NIN</th>
                    <th className="p-3 text-left">Grade/Class</th>
                    <th className="p-3 text-left">Payment Due</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-3">{record.full_name}</td>
                      <td className="p-3">{record.student_nin}</td>
                      <td className="p-3">{record.grade_class}</td>
                      <td className="p-3">${record.payment_amount}</td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
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

export default RecordForm;