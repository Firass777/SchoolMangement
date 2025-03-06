import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserGraduate, FaSchool, FaChalkboardTeacher, FaChartBar, FaCog, FaUsers, FaSignOutAlt, FaBell, FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

function Teacher() {
  const [teacherData, setTeacherData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/users") // Fetch data from the users API
      .then((response) => response.json())
      .then((data) => setTeacherData(data))  // Set the data
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const filteredTeachers = teacherData.filter((teacher) =>
    teacher.role === 'teacher' && (
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toString().includes(searchTerm)
    )
  );

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
                <Link to="/users" className="flex items-center space-x-2">
                  <FaUsers />
                  <span>User Management</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/notifications" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/messages" className="flex items-center space-x-2">
                  <FaUsers />
                  <span>Messages</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/settings" className="flex items-center space-x-2">
                  <FaCog />
                  <span>Settings</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-red-600">
                <Link to="/logout" className="flex items-center space-x-2">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto min-h-screen">
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
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center" onClick={() => setShowAddForm(!showAddForm)}>
                <FaPlus className="mr-2" /> Add Teacher
              </button>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center" onClick={() => setShowUpdateForm(!showUpdateForm)}>
                <FaEdit className="mr-2" /> Update Teacher
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded flex items-center" onClick={() => setShowDeleteForm(!showDeleteForm)}>
                <FaTrash className="mr-2" /> Delete Teacher
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-6 bg-white shadow-md rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Add Teacher</h2>
              <input type="text" placeholder="Name" className="w-full p-2 border rounded mb-2" />
              <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-2" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </div>
          )}

          {/* Update Form */}
          {showUpdateForm && (
            <div className="p-6 bg-white shadow-md rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Update Teacher</h2>
              <input type="text" placeholder="Teacher ID" className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="New Name" className="w-full p-2 border rounded mb-2" />
              <input type="email" placeholder="New Email" className="w-full p-2 border rounded mb-2" />
              <button className="bg-yellow-500 text-white px-4 py-2 rounded">Update</button>
            </div>
          )}

          {/* Delete Form */}
          {showDeleteForm && (
            <div className="p-6 bg-white shadow-md rounded-md mb-6">
              <h2 className="text-2xl font-bold mb-4">Delete Teacher</h2>
              <input type="text" placeholder="Teacher ID" className="w-full p-2 border rounded mb-2" />
              <button className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Teachers List</h2>
            <div className="mt-4">
              {filteredTeachers.length === 0 ? (
                <p>No teachers found.</p>
              ) : (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                  <table className="min-w-full table-auto">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="px-6 py-3 text-left">ID</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Verified At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b">
                          <td className="px-6 py-3">{teacher.id}</td>
                          <td className="px-6 py-3">{teacher.name}</td>
                          <td className="px-6 py-3">{teacher.email}</td>
                          <td className="px-6 py-3">{teacher.email_verified_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Teacher;
