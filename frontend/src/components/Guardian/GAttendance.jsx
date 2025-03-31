import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaIdCard,
  FaMoneyCheck,
  FaEnvelope,
  FaClock,
  
} from "react-icons/fa";

function GAttendance() {
  const [childrenRecords, setChildrenRecords] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          setError("Please log in to view this page");
          return;
        }

        const loggedInUser = JSON.parse(userString);
        if (!loggedInUser || !loggedInUser.children_nin) {
          setError("No children records found");
          return;
        }

        const childrenNin = JSON.parse(loggedInUser.children_nin);
        if (!Array.isArray(childrenNin) || childrenNin.length === 0) {
          setError("No children records found");
          return;
        }

        const records = [];
        for (const nin of childrenNin) {
          try {
            const response = await axios.get(`http://127.0.0.1:8000/api/student-records/${nin}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            if (response.data) {
              records.push(response.data);
            }
          } catch (err) {
            console.error(`Error fetching record for NIN ${nin}:`, err);
          }
        }

        setChildrenRecords(records);
        if (records.length > 0) {
          fetchAttendances(records[0].student_nin);
        }
      } catch (error) {
        console.error("Error fetching parent data:", error);
        setError("Failed to load user data");
      }
    };

    fetchParentData();
  }, []);

  const fetchAttendances = async (studentNIN) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/attendance/${studentNIN}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAttendances(response.data.attendances || []);
    } catch (err) {
      console.error("Error fetching attendances:", err);
      setError("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleNextChild = () => {
    const newIndex = currentChildIndex + 1;
    if (newIndex < childrenRecords.length) {
      setCurrentChildIndex(newIndex);
      fetchAttendances(childrenRecords[newIndex].student_nin);
    }
  };

  const handlePrevChild = () => {
    const newIndex = currentChildIndex - 1;
    if (newIndex >= 0) {
      setCurrentChildIndex(newIndex);
      fetchAttendances(childrenRecords[newIndex].student_nin);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
              <Link to="/gtimetable" className="flex items-center space-x-2">
                <FaClock /> <span>Time-Table</span>
              </Link>
            </li>
             <li className="px-6 py-3 hover:bg-orange-700">
               <Link to="/gevent" className="flex items-center space-x-2">
                 <FaCalendarAlt />
                  <span>Events</span>
               </Link>
             </li>  
             <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/gemails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Attendance Records</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {childrenRecords.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {childrenRecords[currentChildIndex].full_name}'s Attendance
                </h3>
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

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
                </div>
              ) : attendances.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendances.map((attendance, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(attendance.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                              {attendance.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.class}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.teacher_nin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <p className="text-gray-600">No attendance records found for this student.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GAttendance;