import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaBook,
  FaEnvelope,
  FaClock,
  FaDownload,
  FaIdCard,
  FaClipboardList,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

function TTimetable() {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);
  const teacherEmail = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).email
    : "";

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

      if (!token || !localRole || !teacherEmail) {
        localStorage.removeItem("user");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "teacher") {
        setIsVerifying(false);
        fetchTimetable();
        fetchNotificationCount();
        fetchEmailCount();
        const notificationInterval = setInterval(fetchNotificationCount, 30000);
        const emailInterval = setInterval(fetchEmailCount, 30000);
        return () => {
          clearInterval(notificationInterval);
          clearInterval(emailInterval);
        };
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000,
        });

        if (
          response.data.status === "success" &&
          response.data.role === "teacher" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "teacher");
          setIsVerifying(false);
          fetchTimetable();
          fetchNotificationCount();
          fetchEmailCount();
          const notificationInterval = setInterval(fetchNotificationCount, 30000);
          const emailInterval = setInterval(fetchEmailCount, 30000);
          return () => {
            clearInterval(notificationInterval);
            clearInterval(emailInterval);
          };
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
  }, [navigate, teacherEmail]);

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

  const fetchTimetable = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/teacher-timetable/${teacherEmail}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTimetable(response.data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const groupTimetableData = () => {
    const grouped = {};
    
    daysOfWeek.forEach(day => {
      grouped[day] = {};
      timeSlots.forEach(time => {
        grouped[day][time] = [];
      });
    });

    timetable.forEach(entry => {
      if (grouped[entry.day] && grouped[entry.day][entry.time]) {
        grouped[entry.day][entry.time].push(entry);
      }
    });

    return grouped;
  };

  const groupedTimetable = groupTimetableData();

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Teacher Timetable", 14, 22);

    const tableData = [];
    timeSlots.forEach((time) => {
      const row = [time];
      daysOfWeek.forEach((day) => {
        const entry = groupedTimetable[day]?.[time]?.[0];
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
      headStyles: { fillColor: [34, 139, 34] }, // Dark green header
    });

    doc.save("teacher_timetable.pdf");
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 sm:w-64 bg-green-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Teacher Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">TD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teacherdb" className="flex items-center space-x-2">
                <FaChalkboardTeacher className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/ttimetable" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/attendanceform" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Attendance</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/gradesform" className="flex items-center space-x-2">
                <FaChartLine className="text-xl" />
                <span className="hidden sm:block">Grades</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/courseform" className="flex items-center space-x-2">
                <FaBook className="text-xl" />
                <span className="hidden sm:block">Courses</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teachereventview" className="flex items-center space-x-2">
                <FaClipboardList className="text-xl" />
                <span className="hidden sm:block">Events</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
              <Link to="/temails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
              <Link to="/tnotificationview" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teditprofile" className="flex items-center space-x-2">
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

      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Teacher Timetable</h1>
          <button
            onClick={downloadPDF}
            className="flex items-center bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition duration-200 w-full sm:w-auto"
          >
            <FaDownload className="mr-2" />
            Download PDF
          </button>
        </div>

        {/* Visual Timetable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            {timetable.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <FaClock className="w-full h-full" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No timetable data available
                </h3>
                <p className="mt-1 text-gray-500">
                  Your timetable will appear here once available
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
                          {groupedTimetable[day][time].map((entry, index) => (
                            <div 
                              key={index} 
                              className={`mb-2 last:mb-0 p-2 rounded-lg border ${getSubjectColor(entry.subject)} shadow-xs hover:shadow-sm transition-shadow`}
                            >
                              <div className="font-medium text-sm">{entry.subject}</div>
                              <div className="text-xs mt-1">{entry.location}</div>
                              <div className="text-xs mt-1 text-gray-600">{entry.class}</div>
                            </div>
                          ))}
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

export default TTimetable;