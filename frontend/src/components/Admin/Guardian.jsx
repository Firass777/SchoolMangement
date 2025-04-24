import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FaUserGraduate,
  FaSchool,
  FaChalkboardTeacher,
  FaChartBar,
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
  FaUserFriends,
} from "react-icons/fa";

function Guardian() {
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState([]);
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
    role: "parent",
    children_nin: [],
  });
  const [childrenCount, setChildrenCount] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const guardiansPerPage = 10;
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "admin") {
      navigate("/access");
      return;
    }

    fetchGuardians();
    fetchEmailCount();
  }, [navigate]);

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;

    if (!email) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/emails/unread-count/${email}`
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

  const fetchGuardians = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users");
      const guardians = response.data.filter((user) => user.role === "parent");
      setGuardianData(guardians);
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
      const filteredChildrenNin = formData.children_nin.filter((nin) => nin.trim() !== "");
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        ...formData,
        children_nin: filteredChildrenNin,
      });
      setSuccess("Parent added successfully!");
      setShowAddForm(false);
      setFormData({
        name: "",
        email: "",
        nin: "",
        password: "",
        role: "parent",
        children_nin: [],
      });
      setChildrenCount(1);
      fetchGuardians();
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email?.[0] || err.response.data.errors.nin?.[0] || "Failed to add parent.");
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
      const filteredChildrenNin = formData.children_nin.filter((nin) => nin.trim() !== "");
      const dataToSend = {
        ...formData,
        children_nin: filteredChildrenNin,
      };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await axios.put(`http://127.0.0.1:8000/api/users/${formData.id}`, dataToSend);
      setSuccess("Parent updated successfully!");
      setShowUpdateForm(false);
      setFormData({
        id: "",
        name: "",
        email: "",
        nin: "",
        password: "",
        role: "parent",
        children_nin: [],
      });
      setChildrenCount(1);
      fetchGuardians();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email?.[0] || err.response.data.errors.nin?.[0] || "Failed to update parent.");
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
      setSuccess("Parent deleted successfully!");
      setShowDeleteForm(false);
      setFormData({
        id: "",
        name: "",
        email: "",
        nin: "",
        password: "",
        role: "parent",
        children_nin: [],
      });
      fetchGuardians();
    } catch (err) {
      setError("Failed to delete parent.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChildNinChange = (index, value) => {
    const newChildrenNin = [...formData.children_nin];
    newChildrenNin[index] = value;
    setFormData({ ...formData, children_nin: newChildrenNin });
  };

  const addChildField = () => {
    setChildrenCount(childrenCount + 1);
    setFormData({ ...formData, children_nin: [...formData.children_nin, ""] });
  };

  const removeChildField = (index) => {
    if (childrenCount > 1) {
      const newChildrenNin = [...formData.children_nin];
      newChildrenNin.splice(index, 1);
      setChildrenCount(childrenCount - 1);
      setFormData({ ...formData, children_nin: newChildrenNin });
    }
  };

  const handleEditClick = (guardian) => {
    if (showUpdateForm && formData.id === guardian.id) {
      setShowUpdateForm(false);
    } else {
      const childrenNin = guardian.children_nin
        ? Array.isArray(guardian.children_nin)
          ? guardian.children_nin
          : JSON.parse(guardian.children_nin)
        : [];
      setFormData({
        id: guardian.id,
        name: guardian.name,
        email: guardian.email,
        nin: guardian.nin,
        password: "",
        role: guardian.role,
        children_nin: childrenNin,
      });
      setChildrenCount(childrenNin.length > 0 ? childrenNin.length : 1);
      setShowUpdateForm(true);
    }
  };

  const handleDeleteClick = (guardian) => {
    if (showDeleteForm && formData.id === guardian.id) {
      setShowDeleteForm(false);
    } else {
      setFormData({
        id: guardian.id,
        name: guardian.name,
        email: guardian.email,
        nin: guardian.nin,
        password: "",
        role: guardian.role,
        children_nin: guardian.children_nin || [],
      });
      setShowDeleteForm(true);
    }
  };

  const filteredGuardians = guardianData.filter(
    (guardian) =>
      guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guardian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guardian.id.toString().includes(searchTerm)
  );

  const indexOfLastGuardian = currentPage * guardiansPerPage;
  const indexOfFirstGuardian = indexOfLastGuardian - guardiansPerPage;
  const currentGuardians = filteredGuardians.slice(indexOfFirstGuardian, indexOfLastGuardian);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredGuardians);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Parents");
    XLSX.writeFile(workbook, "Parents.xlsx");
  };

  const formatChildrenNin = (childrenNin) => {
    if (!childrenNin) return "None";
    try {
      const parsed = Array.isArray(childrenNin) ? childrenNin : JSON.parse(childrenNin);
      return parsed.join(", ") || "None";
    } catch {
      return "Invalid data";
    }
  };

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
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Parent Management</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage parent records and information</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search parents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                />
                <FaSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition w-full sm:w-auto justify-center"
              >
                <FaPlus className="mr-2" /> Add Parent
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add New Parent</h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Children NINs</label>
                  {Array.from({ length: childrenCount }).map((_, index) => (
                    <div key={index} className="flex mb-2 items-center">
                      <input
                        type="text"
                        placeholder={`Child ${index + 1} NIN`}
                        value={formData.children_nin[index] || ""}
                        onChange={(e) => handleChildNinChange(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {index === childrenCount - 1 && (
                        <button
                          type="button"
                          onClick={addChildField}
                          className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          +
                        </button>
                      )}
                      {childrenCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChildField(index)}
                          className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Parent"}
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Update Parent</h3>
              <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Children NINs</label>
                  {Array.from({ length: childrenCount }).map((_, index) => (
                    <div key={index} className="flex mb-2 items-center">
                      <input
                        type="text"
                        placeholder={`Child ${index + 1} NIN`}
                        value={formData.children_nin[index] || ""}
                        onChange={(e) => handleChildNinChange(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {index === childrenCount - 1 && (
                        <button
                          type="button"
                          onClick={addChildField}
                          className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          +
                        </button>
                      )}
                      {childrenCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChildField(index)}
                          className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Parent"}
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Delete Parent</h3>
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Parent List</h3>
            {filteredGuardians.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No parents found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="p-2 sm:p-3 text-left font-medium">ID</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Name</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Email</th>
                      <th className="p-2 sm:p-3 text-left font-medium">NIN</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Children NINs</th>
                      <th className="p-2 sm:p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGuardians.map((guardian) => (
                      <tr key={guardian.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 sm:p-3 text-gray-800">{guardian.id}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{guardian.name}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{guardian.email}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{guardian.nin}</td>
                        <td className="p-2 sm:p-3 text-gray-800">{formatChildrenNin(guardian.children_nin)}</td>
                        <td className="p-2 sm:p-3">
                          <button
                            onClick={() => handleEditClick(guardian)}
                            className="text-blue-600 hover:text-blue-800 mr-2 sm:mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(guardian)}
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

          {filteredGuardians.length > guardiansPerPage && (
            <div className="flex justify-center mt-6 flex-wrap gap-2">
              {Array.from({ length: Math.ceil(filteredGuardians.length / guardiansPerPage) }).map((_, index) => (
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

export default Guardian;