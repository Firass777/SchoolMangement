import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function GGrades() {
  const navigate = useNavigate();
  const [childrenRecords, setChildrenRecords] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

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
      if (cachedRole === "parent") {
        setIsVerifying(false);
        fetchNotificationCount();
        fetchEmailCount();
        fetchParentData();
        const interval = setInterval(() => {
          fetchNotificationCount();
          fetchEmailCount();
        }, 30000);
        return () => clearInterval(interval);
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000,
        });

        if (
          response.data.status === "success" &&
          response.data.role === "parent" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "parent");
          setIsVerifying(false);
          fetchNotificationCount();
          fetchEmailCount();
          fetchParentData();
          const interval = setInterval(() => {
            fetchNotificationCount();
            fetchEmailCount();
          }, 30000);
          return () => clearInterval(interval);
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

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/notifications/unread-count/${email}`
      );
      if (response.data) {
        setNotificationCount(response.data.count);
        localStorage.setItem('notificationCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/emails/unread-count/${email}`
      );
      if (response.data) {
        setEmailCount(response.data.count);
        localStorage.setItem('emailCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const fetchParentData = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        setError("Please log in to view this page");
        setIsVerifying(false);
        return;
      }

      const loggedInUser = JSON.parse(userString);
      if (!loggedInUser || !loggedInUser.children_nin) {
        setError("No children records found");
        setIsVerifying(false);
        return;
      }

      const childrenNin = JSON.parse(loggedInUser.children_nin);
      if (!Array.isArray(childrenNin) || childrenNin.length === 0) {
        setError("No children records found");
        setIsVerifying(false);
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
        fetchGrades(records[0].student_nin);
      }
      setIsVerifying(false);
    } catch (error) {
      console.error("Error fetching parent data:", error);
      setError("Failed to load user data");
      setIsVerifying(false);
    }
  };

  const fetchGrades = async (studentNIN) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/grades/${studentNIN}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setGrades(response.data.grades || []);
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError("Failed to load grade records");
    } finally {
      setLoading(false);
    }
  };

  const handleNextChild = () => {
    const newIndex = currentChildIndex + 1;
    if (newIndex < childrenRecords.length) {
      setCurrentChildIndex(newIndex);
      fetchGrades(childrenRecords[newIndex].student_nin);
    }
  };

  const handlePrevChild = () => {
    const newIndex = currentChildIndex - 1;
    if (newIndex >= 0) {
      setCurrentChildIndex(newIndex);
      fetchGrades(childrenRecords[newIndex].student_nin);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Grades</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {childrenRecords.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {childrenRecords[currentChildIndex].full_name}'s Grades
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
              ) : grades.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {grades.map((grade, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.class}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.teacher_nin}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(grade.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <p className="text-gray-600">No grade records found for this student.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const Sidebar = ({ notificationCount, emailCount }) => (
  <aside className="w-16 sm:w-64 bg-orange-800 text-white flex flex-col transition-all duration-300">
    <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
      <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Guardian Dashboard</h1>
      <h1 className="text-xl font-bold block sm:hidden">GD</h1>
    </div>
    <nav className="mt-6">
      <ul>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/guardiandb" className="flex items-center space-x-2">
            <FaUserGraduate className="text-xl" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gpayment" className="flex items-center space-x-2">
            <FaMoneyCheck className="text-xl" />
            <span className="hidden sm:block">Payment</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/ggrades" className="flex items-center space-x-2">
            <FaChartLine className="text-xl" />
            <span className="hidden sm:block">Grades</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gattendance" className="flex items-center space-x-2">
            <FaCalendarAlt className="text-xl" />
            <span className="hidden sm:block">Attendance</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gtimetable" className="flex items-center space-x-2">
            <FaClock className="text-xl" />
            <span className="hidden sm:block">Time-Table</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gevent" className="flex items-center space-x-2">
            <FaCalendarAlt className="text-xl" />
            <span className="hidden sm:block">Events</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 relative flex justify-center sm:justify-start">
          <Link to="/gemails" className="flex items-center space-x-2">
            <FaEnvelope className="text-xl" />
            <span className="hidden sm:block">Emails</span>
            {emailCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {emailCount}
              </span>
            )}
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 relative flex justify-center sm:justify-start">
          <Link to="/gnotification" className="flex items-center space-x-2">
            <FaBell className="text-xl" />
            <span className="hidden sm:block">Notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/geditprofile" className="flex items-center space-x-2">
            <FaIdCard className="text-xl" />
            <span className="hidden sm:block">Profile</span>
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
);

export default GGrades;