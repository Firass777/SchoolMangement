import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUserGraduate, FaSchool, FaChalkboardTeacher, FaChartBar, FaCog, FaEnvelope, FaSignOutAlt, FaBell, FaSearch, FaPlus, FaClipboardList, FaTrash, FaEdit, FaClock, FaFileInvoice, FaFile, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

function Teacher() {
  const [teacherData, setTeacherData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
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
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;

  useEffect(() => {
    fetchteachers();
  }, []);

  const fetchteachers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users");
      const teachers = response.data.filter((user) => user.role === "teacher");
      setTeacherData(teachers);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", formData);
      setSuccess("Teacher added successfully!");
      setShowAddForm(false);
      setFormData({ name: "", email: "", nin: "", password: "", role: "teacher" });
      fetchteachers();
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email || "Failed to add Teacher.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false); 
    }
  };

  const handleUpdateSubmit = async (e) => {
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

      const response = await axios.put(`http://127.0.0.1:8000/api/users/${formData.id}`, dataToSend);
      setSuccess("Teacher updated successfully!");
      setShowUpdateForm(false);
      setFormData({ id: "", name: "", email: "", nin: "", password: "", role: "teacher" });
      fetchteachers();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email || "Failed to update Teacher.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false); 
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/users/${formData.id}`);
      setSuccess("teacher deleted successfully!");
      setShowDeleteForm(false);
      setFormData({ id: "", name: "", email: "", nin: "", password: "", role: "teacher" });
      fetchteachers();
    } catch (err) {
      setError("Failed to delete teacher.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (teacher) => {
    if (showUpdateForm && formData.id === teacher.id) {
      setShowUpdateForm(false);
    } else {
      setFormData({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        nin: teacher.nin,
        password: "",
        role: teacher.role,
      });
      setShowUpdateForm(true);
    }
  };

  const handleDeleteClick = (teacher) => {
    if (showDeleteForm && formData.id === teacher.id) {
      setShowDeleteForm(false);
    } else {
      setFormData({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        nin: teacher.nin,
        password: "",
        role: teacher.role,
      });
      setShowDeleteForm(true);
    }
  };

  const filteredteachers = teacherData.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.id.toString().includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastteacher = currentPage * teachersPerPage;
  const indexOfFirstteacher = indexOfLastteacher - teachersPerPage;
  const currentteachers = filteredteachers.slice(indexOfFirstteacher, indexOfLastteacher);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to export data to Excel
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredteachers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
      XLSX.writeFile(workbook, "Teachers.xlsx");
    };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
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
                <Link to="/teacherrecord" className="flex items-center space-x-2">
                  <FaFile />
                  <span>Teacher Record</span>
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
          {/* Search Bar */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center bg-white p-4 rounded-md shadow-md">
              <FaSearch className="text-gray-600" />
              <input
                type="text"
                className="ml-4 w-full p-2 border rounded-md"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Buttons to Show Forms */}
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center" onClick={() => setShowAddForm(!showAddForm)}>
                <FaPlus className="mr-2" /> Add Teacher
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                onClick={exportToExcel}
              >
                <FaFileExcel className="mr-2" /> Export to Excel
              </button>              
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-6 bg-white shadow-md rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Add Teacher</h2>
              <form onSubmit={handleAddSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="National ID Number (NIN)"
                  name="nin"
                  value={formData.nin}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                  {loading ? "Adding..." : "Add"}
                </button>
              </form>
              {error && <div className="text-red-500 mt-3">{error}</div>}
              {success && <div className="text-green-500 mt-3">{success}</div>}
            </div>
          )}

          {/* Update Form */}
          {showUpdateForm && (
            <div className="p-6 bg-white shadow-md rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Update Teacher</h2>
              <form onSubmit={handleUpdateSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="National ID Number (NIN)"
                  name="nin"
                  value={formData.nin}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="password"
                  placeholder="New Password (leave blank to keep current)"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </button>
              </form>
              {error && <div className="text-red-500 mt-3">{error}</div>}
              {success && <div className="text-green-500 mt-3">{success}</div>}
            </div>
          )}

          {/* Delete Form */}
          {showDeleteForm && (
            <div className="p-6 bg-white shadow-md rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Delete Teacher</h2>
              <p className="mb-4">Are you sure you want to delete <strong>{formData.name}</strong>?</p>
              <form onSubmit={handleDeleteSubmit}>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded" disabled={loading}>
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </form>
              {error && <div className="text-red-500 mt-3">{error}</div>}
              {success && <div className="text-green-500 mt-3">{success}</div>}
            </div>
          )}

          {/* teachers List */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Teachers List</h2>
            <div className="mt-4">
              {filteredteachers.length === 0 ? (
                <p>No teachers found.</p>
              ) : (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                  <table className="min-w-full table-auto">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="px-6 py-3 text-left">ID</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">NIN</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentteachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b">
                          <td className="px-6 py-3">{teacher.id}</td>
                          <td className="px-6 py-3">{teacher.name}</td>
                          <td className="px-6 py-3">{teacher.email}</td>
                          <td className="px-6 py-3">{teacher.nin}</td>
                          <td className="px-6 py-3">
                            <button
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              onClick={() => handleEditClick(teacher)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteClick(teacher)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {filteredteachers.length > teachersPerPage && (
            <div className="flex justify-center mt-6">
              {Array.from({ length: Math.ceil(filteredteachers.length / teachersPerPage) }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 mx-1 rounded ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Teacher;