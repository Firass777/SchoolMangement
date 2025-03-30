import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
  FaIdCard,
  FaInfoCircle,
  FaMoneyCheck,
} from "react-icons/fa";

function ParentProfile() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    nin: "",
    password: "",
    role: "parent",
    children_nin: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [childrenRecords, setChildrenRecords] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [needsReload, setNeedsReload] = useState(false);

  const safeParseJSON = (jsonString, fallback = []) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", e);
      return fallback;
    }
  };

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          setError("Please log in to view this page");
          return;
        }

        const loggedInUser = safeParseJSON(userString, {});
        if (!loggedInUser || typeof loggedInUser !== 'object') {
          setError("Invalid user data format");
          return;
        }

        const childrenNin = Array.isArray(loggedInUser.children_nin) 
          ? loggedInUser.children_nin 
          : safeParseJSON(loggedInUser.children_nin || "[]", []);

        const userData = {
          id: loggedInUser.id || "",
          name: loggedInUser.name || "",
          email: loggedInUser.email || "",
          nin: loggedInUser.nin || "",
          password: "",
          role: loggedInUser.role || "parent",
          children_nin: childrenNin,
        };

        setFormData(userData);

        if (childrenNin.length > 0) {
          await fetchChildrenRecords(childrenNin);
        }
      } catch (error) {
        console.error("Error in fetchParentData:", error);
        setError("Failed to load user data.");
      }
    };

    fetchParentData();
  }, []);

  const fetchChildrenRecords = async (childrenNin) => {
    try {
      const validRecords = [];
      
      for (const nin of childrenNin) {
        if (!nin || typeof nin !== 'string') continue;
        
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/student-records/${nin}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          if (response.data) {
            validRecords.push(response.data);
          }
        } catch (err) {
          console.error(`Error fetching record for NIN ${nin}:`, err);
        }
      }
      
      setChildrenRecords(validRecords);
    } catch (err) {
      console.error("Error in fetchChildrenRecords:", err);
      setError("Some children records could not be loaded");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChildNinChange = (index, value) => {
    const updatedChildrenNin = [...formData.children_nin];
    updatedChildrenNin[index] = value;
    setFormData({ ...formData, children_nin: updatedChildrenNin });
  };

  const addChildField = () => {
    setFormData({
      ...formData,
      children_nin: [...formData.children_nin, ""],
    });
  };

  const removeChildField = (index) => {
    const updatedChildrenNin = [...formData.children_nin];
    updatedChildrenNin.splice(index, 1);
    setFormData({
      ...formData,
      children_nin: updatedChildrenNin,
    });
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

      dataToSend.children_nin = dataToSend.children_nin
        .filter(nin => nin && typeof nin === 'string' && nin.trim() !== "");

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
      setNeedsReload(true);

      const updatedUser = { 
        ...JSON.parse(localStorage.getItem("user") || "{}"), 
        ...dataToSend,
        children_nin: JSON.stringify(dataToSend.children_nin) 
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setFormData(prev => ({ ...prev, ...dataToSend, password: "" }));
      setIsEditing(false);
      await fetchChildrenRecords(dataToSend.children_nin);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.email?.[0] || "Failed to update profile");
      } else {
        setError("Something went wrong while updating profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextChild = () => {
    setCurrentChildIndex((prevIndex) => 
      prevIndex < childrenRecords.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevChild = () => {
    setCurrentChildIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-orange-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Guardian Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/guardiandb" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/gpayment" className="flex items-center space-x-2">
                  <FaMoneyCheck />
                  <span>Payment</span>
                </Link>
              </li>              
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/ggrades" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/gattendance" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
             <li className="px-6 py-3 hover:bg-orange-700">
               <Link to="/gevent" className="flex items-center space-x-2">
                 <FaCalendarAlt /> <span>Events</span>
               </Link>
             </li>  
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/notifications" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/geditprofile" className="flex items-center space-x-2">
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

          {needsReload && (
            <div className="mb-6 p-4 bg-green-100 text-green-600 rounded-lg flex items-center">
              <FaInfoCircle className="mr-2" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* User Information Section */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">User Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
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
                    <p className="text-gray-600 font-semibold">Children Count</p>
                    <p className="text-gray-800">{formData.children_nin.length}</p>
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>
                </div>

                {/* Children NIN Fields */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Children NINs</h3>
                    <button
                      type="button"
                      onClick={addChildField}
                      className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      <FaPlus size={12} />
                      <span>Add Child</span>
                    </button>
                  </div>

                  {formData.children_nin.map((nin, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={nin}
                        onChange={(e) => handleChildNinChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
                        placeholder={`Child ${index + 1} NIN`}
                      />
                      {formData.children_nin.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChildField(index)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          <FaMinus size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
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

          {/* Children Records Section */}
          {childrenRecords.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Children Records</h3>
                {childrenRecords.length > 1 && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePrevChild}
                      disabled={currentChildIndex === 0}
                      className={`p-2 rounded ${currentChildIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                    >
                      <FaChevronLeft />
                    </button>
                    <span className="text-gray-600">
                      {currentChildIndex + 1} / {childrenRecords.length}
                    </span>
                    <button
                      onClick={handleNextChild}
                      disabled={currentChildIndex === childrenRecords.length - 1}
                      className={`p-2 rounded ${currentChildIndex === childrenRecords.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-semibold">Full Name</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].full_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Date of Birth</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Gender</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Grade/Class</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].grade_class}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Section</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].section}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Enrollment Date</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].enrollment_date}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Parent Name</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].parent_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Relationship</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].relationship}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Contact Number</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].contact_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Email Address</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].email_address}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Address</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].address}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Previous School</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].previous_school || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Admission Status</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].admission_status}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Scholarship</p>
                  <p className="text-gray-800">{childrenRecords[currentChildIndex].scholarship ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Payment Amount</p>
                  <p className="text-gray-800">${childrenRecords[currentChildIndex].payment_amount}</p>
                </div>
              </div>
            </div>
          ) : formData.children_nin.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Children Records</h3>
              <p className="text-gray-600">No matching student records found for the provided NINs.</p>
            </div>
          ) : null}

          {/* Error and Success Messages */}
          {error && <div className="mt-6 p-4 bg-red-100 text-red-600 rounded">{error}</div>}
          {success && <div className="mt-6 p-4 bg-green-100 text-green-600 rounded">{success}</div>}
        </main>
      </div>
    </div>
  );
}

export default ParentProfile;