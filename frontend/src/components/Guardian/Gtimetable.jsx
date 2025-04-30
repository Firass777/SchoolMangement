import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaEnvelope,
  FaClock,
  FaIdCard,
  FaMoneyCheck,
  FaDownload,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Gtimetable() {
  const navigate = useNavigate();
  const [childrenTimetables, setChildrenTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = [
    "08:30 - 10:00 AM",
    "10:05 - 11:35 AM",
    "12:00 - 13:30 PM",
    "13:35 - 15:00 PM",
    "15:05 - 17:00 PM",
  ];

  const subjectColors = {
    "Math": "bg-indigo-100 border-indigo-300 text-indigo-800",
    "French": "bg-emerald-100 border-emerald-300 text-emerald-800",
    "English": "bg-amber-100 border-amber-300 text-amber-800",
    "IoT": "bg-rose-100 border-rose-300 text-rose-800",
    "React": "bg-blue-100 border-blue-300 text-blue-800",
    "default": "bg-gray-100 border-gray-300 text-gray-800"
  };

  const getSubjectColor = (subject) => {
    const baseSubject = subject?.split(' ')[0]; 
    return subjectColors[baseSubject] || subjectColors.default;
  };

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
        fetchData();
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
          fetchData();
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

  const fetchData = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setError("No user data found");
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      if (user.role !== "parent" || !user.children_nin) {
        setError("Not a parent account or no children data");
        setLoading(false);
        return;
      }

      let childrenNin = [];
      try {
        childrenNin = JSON.parse(user.children_nin);
        if (!Array.isArray(childrenNin)) {
          childrenNin = [childrenNin];
        }
      } catch (e) {
        setError("Invalid children data format");
        setLoading(false);
        return;
      }

      if (!childrenNin.length) {
        setError("No children registered");
        setLoading(false);
        return;
      }

      const childrenData = await Promise.all(
        childrenNin.map(async (nin) => {
          try {
            const response = await axios.get(`http://127.0.0.1:8000/api/user-by-nin/${nin}`);
            if (!response.data) return null;
            return { nin, name: response.data.name, class: response.data.class };
          } catch (error) {
            console.error(`Error fetching child data for NIN ${nin}:`, error);
            return null;
          }
        })
      );

      const validChildren = childrenData.filter(child => child && child.class);

      const timetablesPromises = validChildren.map(async (child) => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/student-timetable/${child.class}`);
          return { ...child, timetable: response.data || [] };
        } catch (error) {
          console.error(`Error fetching timetable for ${child.name}:`, error);
          return { ...child, timetable: [] };
        }
      });

      const timetables = await Promise.all(timetablesPromises);
      setChildrenTimetables(timetables);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleNextChild = () => {
    setActiveChildIndex((prevIndex) => 
      prevIndex < childrenTimetables.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrevChild = () => {
    setActiveChildIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : childrenTimetables.length - 1
    );
  };

  const downloadPDF = () => {
    const activeChild = childrenTimetables[activeChildIndex];
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${activeChild.name}'s Timetable - Class ${activeChild.class}`, 14, 22);

    const tableData = [];
    timeSlots.forEach((time) => {
      const row = [time];
      daysOfWeek.forEach((day) => {
        const entry = activeChild.timetable.find(e => e.day === day && e.time === time);
        row.push(entry ? `${entry.subject}\n${entry.location}` : "-");
      });
      tableData.push(row);
    });

    autoTable(doc, {
      head: [["Time", ...daysOfWeek]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 165, 0] },
    });

    doc.save(`${activeChild.name}_timetable.pdf`);
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading timetables...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
        <div className="flex-1 p-4 sm:p-6 text-red-500">{error}</div>
      </div>
    );
  }

  if (childrenTimetables.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
        <div className="flex-1 p-4 sm:p-6">No children timetables found</div>
      </div>
    );
  }

  const activeChild = childrenTimetables[activeChildIndex];
  const groupedTimetable = activeChild.timetable.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = {};
    acc[entry.day][entry.time] = entry;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Children's Timetables</h1>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            {childrenTimetables.length > 1 && (
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevChild}
                  className="flex items-center justify-center bg-orange-700 text-white p-2 rounded-lg hover:bg-orange-800 transition"
                  aria-label="Previous child"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={handleNextChild}
                  className="flex items-center justify-center bg-orange-700 text-white p-2 rounded-lg hover:bg-orange-800 transition"
                  aria-label="Next child"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
            <button
              onClick={downloadPDF}
              className="flex items-center bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800 transition w-full sm:w-auto"
            >
              <FaDownload className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-orange-800">
            {activeChild.name} - Class {activeChild.class}
            <span className="ml-2 sm:ml-4 text-sm text-gray-600">
              (Page {activeChildIndex + 1} of {childrenTimetables.length})
            </span>
          </h2>
        </div>

        {/* Visual Timetable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            {activeChild.timetable.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <FaClock className="w-full h-full" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No timetable data available for {activeChild.name}
                </h3>
                <p className="mt-1 text-gray-500">
                  The timetable will appear here once available
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Timetable Header */}
                  <div className="grid grid-cols-8 border-b border-gray-200 text-sm font-medium text-gray-700 bg-gray-50">
                    <div className="col-span-1 p-3"></div>
                    {daysOfWeek.map(day => (
                      <div key={day} className="p-3 text-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Timetable Rows */}
                  {timeSlots.map(time => (
                    <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                      <div className="col-span-1 p-3 font-medium text-sm text-gray-700 bg-gray-50 border-r border-gray-200 flex flex-col justify-center">
                        <span className="font-semibold">{time.split(' - ')[0]}</span>
                        <span className="text-xs text-gray-500">{time.split(' - ')[1]}</span>
                      </div>
                      {daysOfWeek.map(day => (
                        <div key={`${day}-${time}`} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px]">
                          {groupedTimetable[day]?.[time] && (
                            <div 
                              className={`mb-2 last:mb-0 p-2 rounded-lg border ${getSubjectColor(groupedTimetable[day][time].subject)} shadow-xs hover:shadow-sm transition-shadow`}
                            >
                              <div className="font-medium text-sm">{groupedTimetable[day][time].subject}</div>
                              <div className="text-xs mt-1">{groupedTimetable[day][time].location}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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

export default Gtimetable;