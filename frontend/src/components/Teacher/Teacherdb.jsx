import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaChalkboardTeacher, FaUserGraduate, FaChartLine, FaCalendarAlt, FaBell, FaSignOutAlt, FaBook, FaClipboardList, FaEnvelope } from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

function Teacherdb() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [students] = useState(30);
  const [attendance] = useState("95%");
  const [grades] = useState("A");

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Student Attendance",
        backgroundColor: "#4F46E5",
        borderColor: "#4F46E5",
        borderWidth: 1,
        hoverBackgroundColor: "#4338CA",
        hoverBorderColor: "#4338CA",
        data: [90, 95, 92, 96, 94, 98],
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Class Performance",
        backgroundColor: "#10B981",
        borderColor: "#10B981",
        borderWidth: 2,
        data: [75, 80, 85, 90],
      },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
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
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/temails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>                  
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/notifications" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
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

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, Teacher!</h2>
            <p className="text-gray-600">Manage your classes and students.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaUserGraduate className="text-blue-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{students}</h3>
                <p className="text-gray-600">Total Students</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaCalendarAlt className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{attendance}</h3>
                <p className="text-gray-600">Attendance Rate</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaChartLine className="text-yellow-500 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{grades}</h3>
                <p className="text-gray-600">Average Grade</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full mb-6 sm:mb-0" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Student Attendance</h3>
              <div className="h-80">
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Class Performance</h3>
              <div className="h-80">
                <Line data={lineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white p-6 shadow-lg rounded-lg mb-6" data-aos="fade-up">
            <h3 className="text-xl font-bold mb-4">Recent Attendance</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Student 1</td>
                  <td className="p-3">Jan 5, 2025</td>
                  <td className="p-3 text-green-600 font-semibold">Present</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Student 2</td>
                  <td className="p-3">Feb 12, 2025</td>
                  <td className="p-3 text-red-600 font-semibold">Absent</td>
                </tr>
                <tr>
                  <td className="p-3">Student 3</td>
                  <td className="p-3">Mar 20, 2025</td>
                  <td className="p-3 text-green-600 font-semibold">Present</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Teacherdb;