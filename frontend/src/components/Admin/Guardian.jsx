import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; 
import {
  FaUserGraduate,
  FaSchool,
  FaChalkboardTeacher,
  FaChartBar,
  FaCog,
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
    fetchGuardians();
    fetchEmailCount();
  }, []);

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
      // Filter out empty children_nin entries
      const filteredChildrenNin = formData.children_nin.filter(nin => nin.trim() !== "");
      
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        ...formData,
        children_nin: filteredChildrenNin
      });
      
      setSuccess("Guardian added successfully!");
      setShowAddForm(false);
      setFormData({ 
        name: "", 
        email: "", 
        nin: "", 
        password: "", 
        role: "parent", 
        children_nin: [] 
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
      // Filter out empty children_nin entries
      const filteredChildrenNin = formData.children_nin.filter(nin => nin.trim() !== "");
      
      const dataToSend = { 
        ...formData,
        children_nin: filteredChildrenNin
      };
      
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await axios.put(`http://127.0.0.1:8000/api/users/${formData.id}`, dataToSend);
      setSuccess("Guardian updated successfully!");
      setShowUpdateForm(false);
      setFormData({ 
        id: "", 
        name: "", 
        email: "", 
        nin: "", 
        password: "", 
        role: "parent", 
        children_nin: [] 
      });
      setChildrenCount(1);
      fetchGuardians();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors.email?.[0] || err.response.data.errors.nin?.[0] || "Failed to update guardian.");
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
      setSuccess("Guardian deleted successfully!");
      setShowDeleteForm(false);
      setFormData({ 
        id: "", 
        name: "", 
        email: "", 
        nin: "", 
        password: "", 
        role: "parent", 
        children_nin: [] 
      });
      fetchGuardians();
    } catch (err) {
      setError("Failed to delete guardian.");
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
      const childrenNin = guardian.children_nin ? 
        (Array.isArray(guardian.children_nin) ? guardian.children_nin : JSON.parse(guardian.children_nin)) : 
        [];
      
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guardians");
    XLSX.writeFile(workbook, "Guardians.xlsx");
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
                  <span>tions</span>
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

            {/* Buttons to Show Forms and Export to Excel */}
            <div className="flex space-x-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <FaPlus className="mr-2" /> Add Parent
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
              <h2 className="text-2xl font-bold mb-4">Add Parent</h2>
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
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Children NINs</label>
                  {Array.from({ length: childrenCount }).map((_, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        placeholder={`Child ${index + 1} NIN`}
                        value={formData.children_nin[index] || ""}
                        onChange={(e) => handleChildNinChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                      {index === childrenCount - 1 && (
                        <button
                          type="button"
                          onClick={addChildField}
                          className="ml-2 bg-blue-500 text-white px-3 rounded"
                        >
                          +
                        </button>
                      )}
                      {childrenCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChildField(index)}
                          className="ml-2 bg-red-500 text-white px-3 rounded"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
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
              <h2 className="text-2xl font-bold mb-4">Update Parent</h2>
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
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Children NINs</label>
                  {Array.from({ length: childrenCount }).map((_, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        placeholder={`Child ${index + 1} NIN`}
                        value={formData.children_nin[index] || ""}
                        onChange={(e) => handleChildNinChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                      {index === childrenCount - 1 && (
                        <button
                          type="button"
                          onClick={addChildField}
                          className="ml-2 bg-blue-500 text-white px-3 rounded"
                        >
                          +
                        </button>
                      )}
                      {childrenCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChildField(index)}
                          className="ml-2 bg-red-500 text-white px-3 rounded"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
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
              <h2 className="text-2xl font-bold mb-4">Delete Parent</h2>
              <p className="mb-4">
                Are you sure you want to delete <strong>{formData.name}</strong>?
              </p>
              <form onSubmit={handleDeleteSubmit}>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded" disabled={loading}>
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </form>
              {error && <div className="text-red-500 mt-3">{error}</div>}
              {success && <div className="text-green-500 mt-3">{success}</div>}
            </div>
          )}

          {/* Parent List */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Parents List</h2>
            <div className="mt-4">
              {filteredGuardians.length === 0 ? (
                <p>No guardians found.</p>
              ) : (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                  <table className="min-w-full table-auto">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="px-6 py-3 text-left">ID</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">NIN</th>
                        <th className="px-6 py-3 text-left">Children NINs</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGuardians.map((guardian) => (
                        <tr key={guardian.id} className="border-b">
                          <td className="px-6 py-3">{guardian.id}</td>
                          <td className="px-6 py-3">{guardian.name}</td>
                          <td className="px-6 py-3">{guardian.email}</td>
                          <td className="px-6 py-3">{guardian.nin}</td>
                          <td className="px-6 py-3">{formatChildrenNin(guardian.children_nin)}</td>
                          <td className="px-6 py-3">
                            <button
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              onClick={() => handleEditClick(guardian)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteClick(guardian)}
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
          {filteredGuardians.length > guardiansPerPage && (
            <div className="flex justify-center mt-6">
              {Array.from({ length: Math.ceil(filteredGuardians.length / guardiansPerPage) }).map((_, index) => (
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

export default Guardian;