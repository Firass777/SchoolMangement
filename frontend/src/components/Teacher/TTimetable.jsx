import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaBook,
  FaClipboardList,
  FaEnvelope,
  FaClock,
  FaDownload,
  FaIdCard,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function TTimetable() {
  const [timetable, setTimetable] = useState([]);
  const teacherEmail = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).email
    : "";

  useEffect(() => {
    if (teacherEmail) {
      fetchTimetable();
    }
  }, [teacherEmail]);

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

  // Function to generate and download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Teacher Timetable", 14, 22);

    // Prepare data for the table
    const tableData = [];
    sortedTimeSlots.forEach((time) => {
      const row = [time];
      daysOfWeek.forEach((day) => {
        const entry = groupedTimetable[day]?.[time];
        row.push(entry ? `${entry.subject}\n${entry.location}` : "-");
      });
      tableData.push(row);
    });

    // Add table to PDF
    autoTable(doc, {
      head: [["Time", ...daysOfWeek]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [34, 139, 34] }, 
    });

    // Save the PDF
    doc.save("teacher_timetable.pdf");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/teacherdb" className="flex items-center space-x-2">
                <FaChalkboardTeacher />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/ttimetable" className="flex items-center space-x-2">
                <FaClock />
                <span>Time-Table</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/teacherstudents" className="flex items-center space-x-2">
                <FaUserGraduate />
                <span>Students</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/attendanceform" className="flex items-center space-x-2">
                <FaCalendarAlt />
                <span>Attendance</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/gradesform" className="flex items-center space-x-2">
                <FaChartLine />
                <span>Grades</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/courseform" className="flex items-center space-x-2">
                <FaBook />
                <span>Courses</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/teachereventview" className="flex items-center space-x-2">
                <FaClipboardList /> <span>Events</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/temails" className="flex items-center space-x-2">
                <FaEnvelope />
                <span>Emails</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-green-700">
              <Link to="/tnotificationview" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </Link>
            </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teditprofile" className="flex items-center space-x-2">
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
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Timetable</h1>
          <button
            onClick={downloadPDF}
            className="flex items-center bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition duration-200"
          >
            <FaDownload className="mr-2" />
            Download PDF
          </button>
        </div>

        {/* Timetable */}
        <div className="overflow-x-auto">
          <div className="flex border border-gray-300 rounded-lg shadow-lg">
            {/* Time column */}
            <div className="w-48 flex-shrink-0 bg-gray-100">
              <div className="h-12"></div>
              {sortedTimeSlots.map((time) => (
                <div
                  key={time}
                  className="h-20 flex items-center justify-end pr-4 text-sm text-gray-700 border-b border-gray-300"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {daysOfWeek.map((day) => (
              <div key={day} className="flex-1 min-w-40">
                <div className="h-12 flex items-center justify-center font-semibold text-white bg-green-700 border-b border-gray-300">
                  {day}
                </div>
                {sortedTimeSlots.map((time) => {
                  const entry = groupedTimetable[day]?.[time];
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="h-20 p-2 border-b border-gray-400 bg-white hover:bg-gray-100 transition"
                    >
                      {entry ? (
                        <div className="bg-green-100 p-2 rounded-lg shadow-sm border border-green-100">
                          <p className="text-sm font-medium text-green-900">{entry.subject}</p>
                          <p className="text-xs text-gray-600">{entry.location}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center mt-6">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TTimetable;