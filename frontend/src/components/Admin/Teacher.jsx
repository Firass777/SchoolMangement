import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FaUserGraduate,
  FaSchool,
  FaChalkboardTeacher,
  FaChartBar,
  FaUserFriends,
  FaEnvelope,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaPlus,
  FaClipboardList,
  FaTrash,
  FaEdit,
  FaClock,
  FaFileInvoice,
  FaFile,
  FaFileExcel,
} from "react-icons/fa";

function Teacher() {
  const navigate = useNavigate();
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
      if (cachedRole === "admin") {
        setIsVerifying(false);
        fetchTeachers();
        fetchEmailCount();
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000,
        });

        if (
          response.data.status === "success" &&
          response.data.role === "admin" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "admin");
          setIsVerifying(false);
          fetchTeachers();
          fetchEmailCount();
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

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;

    if (!email) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/emails/unread-count/${email}`
      );
      const data = await response.json();
      if (data) {
        setEmailCount(data.count);
        localStorage.setItem("emailCount", data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users");
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
      fetchTeachers();
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email || "Failed to add teacher.");
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
      const dataToSend = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await axios.put(`http://127.0.0.1:8000/api/users/${formData.id}`, dataToSend);
      setSuccess("Teacher updated successfully!");
      setShowUpdateForm(false);
      setFormData({ id: "", name: "", email: "", nin: "", password: "", role: "teacher" });
      fetchTeachers();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email || "Failed to update teacher.");
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
      setSuccess("Teacher deleted successfully!");
      setShowDeleteForm(false);
      setFormData({ id: "", name: "", email: "", nin: "", password: "", role: "teacher" });
      fetchTeachers();
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

  const filteredTeachers = teacherData.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toString().includes(searchTerm)
  );

  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTeachers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    XLSX.writeFile(workbook, "Teachers.xlsx");
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-inter">
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
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="mx-auto max-w-full sm:max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Teacher Management</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage teacher records and information</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm w-full"
                />
                <FaSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition w-full sm:w-auto justify-center"
              >
                <FaPlus className="mr-2" /> Add Teacher
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition w-full sm:w-auto justify-center"
              >
                <FaFileExcel className="mr-2" /> Export
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add New Teacher</h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">National ID (NIN)</label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Teacher"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {error && <div className="text-red-500 text-xs sm:text-sm mt-3">{error}</div>}
              {success && <div className="text-green-500 text-xs sm:text-sm mt-3">{success}</div>}
            </div>
          )}

          {showUpdateForm && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Update Teacher</h3>
              <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">National ID (NIN)</label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Teacher"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {error && <div className="text-red-500 text-xs sm:text-sm mt-3">{error}</div>}
              {success && <div className="text-green-500 text-xs sm:text-sm mt-3">{success}</div>}
            </div>
          )}

          {showDeleteForm && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Delete Teacher</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-medium">{formData.name}</span>?
              </p>
              <form onSubmit={handleDeleteSubmit}>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {error && <div className="text-red-500 text-xs sm:text-sm mt-3">{error}</div>}
              {success && <div className="text-green-500 text-xs sm:text-sm mt-3">{success}</div>}
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Teacher List</h3>
            {filteredTeachers.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No teachers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="p-2 sm:p-3 text-left font-medium">ID</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Name</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Email</th>
                      <th className="p-2 sm:p-3 text-left font-medium">NIN</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 sm:p-3 text-gray-800">{teacher.id}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{teacher.name}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{teacher.email}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{teacher.nin}</td>
                        <td className="p-2 sm:p-3">
                          <button
                            onClick={() => handleEditClick(teacher)}
                            className="text-blue-600 hover:text-blue-800 mr-2 sm:mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(teacher)}
                            className="text-red-600 hover:text-red-800"
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

          {filteredTeachers.length > teachersPerPage && (
            <div className="flex justify-center mt-6 flex-wrap gap-2">
              {Array.from({ length: Math.ceil(filteredTeachers.length / teachersPerPage) }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-1 rounded text-xs sm:text-sm ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Teacher;