import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [timetable, setTimetable] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const teacherEmail = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).email
    : "";

  useEffect(() => {
    if (teacherEmail) {
      fetchTimetable();
    }
    fetchNotificationCount();
    fetchEmailCount();
    const notificationInterval = setInterval(fetchNotificationCount, 30000);
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => {
      clearInterval(notificationInterval);
      clearInterval(emailInterval);
    };
  }, [teacherEmail]);

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread-count/${email}`
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
        `http://localhost:8000/api/emails/unread-count/${email}`
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
      const response = await fetch(
        `http://127.0.0.1:8000/api/teacher-timetable/${teacherEmail}`
      );
      const data = await response.json();
      setTimetable(data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const parseTime = (timeRange) => {
    const startTime = timeRange.split(" - ")[0];
    const [time, modifier] = startTime.split(" ");
    let [hours, minutes, seconds] = time.split(":");
    if (seconds === undefined) seconds = "00";
    if (modifier === "PM" && hours !== "12")
      hours = String(Number(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return new Date(`1970-01-01 ${hours}:${minutes}:${seconds}`);
  };

  const timeSlots = [...new Set(timetable.map((entry) => entry.time))];

  const sortedTimeSlots = timeSlots.sort((a, b) => {
    return parseTime(a) - parseTime(b);
  });

  const groupedTimetable = timetable.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = {};
    }
    acc[entry.day][entry.time] = entry;
    return acc;
  }, {});

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Teacher Timetable", 14, 22);

    const tableData = [];
    sortedTimeSlots.forEach((time) => {
      const row = [time];
      daysOfWeek.forEach((day) => {
        const entry = groupedTimetable[day]?.[time];
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
      headStyles: { fillColor: [34, 139, 34] },
    });

    doc.save("teacher_timetable.pdf");
  };

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

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="flex border border-gray-300 rounded-lg shadow-lg">
            <div className="w-32 sm:w-48 flex-shrink-0 bg-gray-100">
              <div className="h-12"></div>
              {sortedTimeSlots.map((time) => (
                <div
                  key={time}
                  className="h-20 flex items-center justify-end pr-2 sm:pr-4 text-xs sm:text-sm text-gray-700 border-b border-gray-300"
                >
                  {time}
                </div>
              ))}
            </div>

            {daysOfWeek.map((day) => (
              <div key={day} className="flex-1 min-w-32 sm:min-w-40">
                <div className="h-12 flex items-center justify-center font-semibold text-white bg-green-700 border-b border-gray-300 text-xs sm:text-base">
                  {day}
                </div>
                {sortedTimeSlots.map((time) => {
                  const entry = groupedTimetable[day]?.[time];
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="h-20 p-1 sm:p-2 border-b border-gray-400 bg-white hover:bg-gray-100 transition"
                    >
                      {entry ? (
                        <div className="bg-green-100 p-1 sm:p-2 rounded-lg shadow-sm border border-green-100">
                          <p className="text-xs sm:text-sm font-medium text-green-900">{entry.subject}</p>
                          <p className="text-xs text-gray-600">{entry.location}</p>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-400 text-center mt-4 sm:mt-6">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-green-700 mb-4">{day}</h2>
              <div className="space-y-4">
                {sortedTimeSlots.map((time) => {
                  const entry = groupedTimetable[day]?.[time];
                  return (
                    <div key={`${day}-${time}`} className="flex flex-col border-b border-gray-200 pb-2">
                      <p className="text-sm font-medium text-gray-700">{time}</p>
                      {entry ? (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-green-900">{entry.subject}</p>
                          <p className="text-xs text-gray-600">{entry.location}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TTimetable;