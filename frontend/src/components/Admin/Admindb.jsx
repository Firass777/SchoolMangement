import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaUserGraduate, FaChalkboardTeacher, FaChartBar, FaMoneyBillWave, FaCog, FaEnvelope, FaSchool, FaSignOutAlt, FaClipboardList, FaBell } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

function Admindb() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [students, setStudents] = useState(0);
  const [teachers, setTeachers] = useState(0);
  const [revenue] = useState("$250,000");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users")
      .then((response) => response.json())
      .then((data) => {
        const studentCount = data.filter((user) => user.role === "student").length;
        const teacherCount = data.filter((user) => user.role === "teacher").length;
        setStudents(studentCount);
        setTeachers(teacherCount);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Student Registrations",
        backgroundColor: "#4F46E5",
        borderColor: "#4F46E5",
        borderWidth: 1,
        hoverBackgroundColor: "#4338CA",
        hoverBorderColor: "#4338CA",
        data: [100, 200, 150, 300, 250, 400],
      },
    ],
  };

  const pieData = {
    labels: ["Paid", "Overdue", "Pending"],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: ["#4F46E5", "#E53E3E", "#FBBF24"],
        hoverBackgroundColor: ["#4338CA", "#C53030", "#F59E0B"],
      },
    ],
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
                <Link to="/eventform" className="flex items-center space-x-2">
                  <FaClipboardList />
                  <span>Event Management</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/notificationform" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/aemails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
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

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, Admin!</h2>
            <p className="text-gray-600">Manage your school efficiently.</p>
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
              <FaChalkboardTeacher className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{teachers}</h3>
                <p className="text-gray-600">Total Teachers</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaMoneyBillWave className="text-yellow-500 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{revenue}</h3>
                <p className="text-gray-600">Annual Revenue</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full mb-6 sm:mb-0" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Student Attendances (Last 6 Months)</h3>
              <div className="h-80">
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Student Payment Status</h3>
              <div className="h-80">
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white p-6 shadow-lg rounded-lg mb-6" data-aos="fade-up">
            <h3 className="text-xl font-bold mb-4">Recent Student Admissions</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Grade</th>
                  <th className="p-3 text-left">Enrollment Date</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Student 1</td>
                  <td className="p-3">10th</td>
                  <td className="p-3">Jan 5, 2025</td>
                  <td className="p-3 text-green-600 font-semibold">Active</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Student 2</td>
                  <td className="p-3">9th</td>
                  <td className="p-3">Feb 12, 2025</td>
                  <td className="p-3 text-green-600 font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="p-3">Student 3</td>
                  <td className="p-3">11th</td>
                  <td className="p-3">Mar 20, 2025</td>
                  <td className="p-3 text-red-600 font-semibold">Inactive</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white p-6 shadow-lg rounded-lg mb-6" data-aos="fade-up">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <ul>
              <li className="border-b p-3">New student "Student 1" registered.</li>
              <li className="border-b p-3">Teacher "Student 2" updated his profile.</li>
              <li className="border-b p-3">New course "Laraval 101" added.</li>
              <li className="p-3">Student "Student 1" completed the course "React".</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Admindb;
