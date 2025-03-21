import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaMoneyBillWave,
  FaCog,
  FaEnvelope,
  FaSchool,
  FaSignOutAlt,
  FaClipboardList,
  FaBell,
  FaClock,
  FaFileInvoice,
  FaFile,
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

function Admindb() {
  const [students, setStudents] = useState(0);
  const [teachers, setTeachers] = useState(0);
  const [revenue] = useState("$250,000");
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0 });
  const [latestEvents, setLatestEvents] = useState([]);
  const [latestStudents, setLatestStudents] = useState([]);
  const [latestTeachers, setLatestTeachers] = useState([]);
  const [latestCourses, setLatestCourses] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users (students and teachers)
      const usersResponse = await fetch("http://127.0.0.1:8000/api/users");
      const usersData = await usersResponse.json();
      const studentCount = usersData.filter((user) => user.role === "student").length;
      const teacherCount = usersData.filter((user) => user.role === "teacher").length;
      setStudents(studentCount);
      setTeachers(teacherCount);

      // Fetch attendance statistics
      const attendanceResponse = await fetch("http://127.0.0.1:8000/api/attendance");
      const attendanceData = await attendanceResponse.json();
      const presentCount = attendanceData?.attendances?.filter((a) => a.status === "Present").length || 0;
      const absentCount = attendanceData?.attendances?.filter((a) => a.status === "Absent").length || 0;
      const lateCount = attendanceData?.attendances?.filter((a) => a.status === "Late").length || 0;
      setAttendanceStats({ present: presentCount, absent: absentCount, late: lateCount });

      // Fetch latest events
      const eventsResponse = await fetch("http://127.0.0.1:8000/api/events/latest");
      const eventsData = await eventsResponse.json();
      setLatestEvents(eventsData?.events || []);

      // Fetch latest students
      const studentsResponse = await fetch("http://127.0.0.1:8000/api/users/latest/students");
      const studentsData = await studentsResponse.json();
      setLatestStudents(studentsData?.students || []);

      // Fetch latest teachers
      const teachersResponse = await fetch("http://127.0.0.1:8000/api/users/latest/teachers");
      const teachersData = await teachersResponse.json();
      setLatestTeachers(teachersData?.teachers || []);

      // Fetch latest courses
      const coursesResponse = await fetch("http://127.0.0.1:8000/api/courses/latest");
      const coursesData = await coursesResponse.json();
      setLatestCourses(coursesData?.courses || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Prepare data for the attendance chart
  const attendanceChartData = {
    labels: ["Present", "Absent", "Late"],
    datasets: [
      {
        label: "Attendance",
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.late],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)", "rgba(255, 206, 86, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)", "rgba(255, 206, 86, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the revenue chart
  const revenueChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [50000, 75000, 60000, 90000, 80000, 120000],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
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
                <Link to="/timetableform" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
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
                <Link to="/documentsform" className="flex items-center space-x-2">
                  <FaFileInvoice />
                  <span>Documents</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/recordform" className="flex items-center space-x-2">
                  <FaFile />
                  <span>Student Record</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/teacherrecord" className="flex items-center space-x-2">
                  <FaFile />
                  <span>Teacher Record</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/notifications" className="flex items-center space-x-2">
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
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, Admin!</h2>
            <p className="text-gray-600">Manage your school efficiently.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaUserGraduate className="text-blue-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{students}</h3>
                <p className="text-gray-600">Total Students</p>
              </div>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaChalkboardTeacher className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{teachers}</h3>
                <p className="text-gray-600">Total Teachers</p>
              </div>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaMoneyBillWave className="text-yellow-500 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{revenue}</h3>
                <p className="text-gray-600">Annual Revenue</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Attendance Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-bold mb-4">Attendance Overview</h3>
              <div className="h-64 flex items-center justify-center">
                <Pie data={attendanceChartData} />
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-bold mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-center justify-center">
                <Bar data={revenueChartData} />
              </div>
            </div>
          </div>

          {/* Latest Events */}
          <div className="bg-white p-6 shadow-lg rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Latest Events</h3>
            {latestEvents.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {latestEvents.map((event, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{event.name}</td>
                      <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="p-3">{event.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No events found.</p>
            )}
          </div>

          {/* Latest Students and Teachers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Latest Students */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-bold mb-4">Latest Students</h3>
              {latestStudents.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestStudents.map((student, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{student.name}</td>
                        <td className="p-3">{student.email}</td>
                        <td className="p-3">{new Date(student.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No students found.</p>
              )}
            </div>

            {/* Latest Teachers */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-bold mb-4">Latest Teachers</h3>
              {latestTeachers.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestTeachers.map((teacher, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{teacher.name}</td>
                        <td className="p-3">{teacher.email}</td>
                        <td className="p-3">{new Date(teacher.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No teachers found.</p>
              )}
            </div>
          </div>

          {/* Latest Courses */}
          <div className="bg-white p-6 shadow-lg rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Latest Courses</h3>
            {latestCourses.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Class</th>
                    <th className="p-3 text-left">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {latestCourses.map((course, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{course.name}</td>
                      <td className="p-3">{course.class}</td>
                      <td className="p-3">{course.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No courses found.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Admindb;