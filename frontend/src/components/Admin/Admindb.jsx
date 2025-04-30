import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaMoneyBillWave,
  FaUserFriends,
  FaEnvelope,
  FaSchool,
  FaSignOutAlt,
  FaClipboardList,
  FaBell,
  FaClock,
  FaFileInvoice,
  FaFile,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";

function Admindb() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(0);
  const [teachers, setTeachers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0 });
  const [latestEvents, setLatestEvents] = useState([]);
  const [latestStudents, setLatestStudents] = useState([]);
  const [latestTeachers, setLatestTeachers] = useState([]);
  const [latestCourses, setLatestCourses] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    latestPayments: [],
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      // Immediate redirect if no token or local role
      if (!token || !localRole) {
        localStorage.removeItem("user"); // Clear localStorage user data 
        navigate("/access", { replace: true });
        return;
      }

      // Check if role is already verified in session storage 
      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "admin") {
        initializeDashboard();
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000, 
        });

        if (
          response.data.status === "success" &&
          response.data.role === "admin" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "admin"); 
          initializeDashboard();
        } else {
          localStorage.removeItem("user"); 
          sessionStorage.removeItem("verifiedRole"); 
          navigate("/access", { replace: true });
        }
      } catch (error) {
        console.error("Error verifying role:", error);
        localStorage.removeItem("user");  // Clear localStorage user data 
        sessionStorage.removeItem("verifiedRole"); 
        navigate("/access", { replace: true });
      }
    };

    const initializeDashboard = () => {
      AOS.init({ duration: 1000 });
      fetchDashboardData();
      fetchEmailCount();
      const emailInterval = setInterval(fetchEmailCount, 30000);
      return () => clearInterval(emailInterval);
    };

    verifyUserAndInitialize();
  }, [navigate]);

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;

    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/emails/unread-count/${email}`,
        { timeout: 3000 }
      );
      if (response.data) {
        setEmailCount(response.data.count);
        localStorage.setItem("emailCount", response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [
        usersResponse,
        attendanceResponse,
        eventsResponse,
        studentsResponse,
        teachersResponse,
        coursesResponse,
        paymentsResponse,
        studentRecordsResponse,
        monthlyRevenueResponse,
        weeklyRevenueResponse,
      ] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/users", { headers }),
        axios.get("http://127.0.0.1:8000/api/attendance", { headers }),
        axios.get("http://127.0.0.1:8000/api/events/latest", { headers }),
        axios.get("http://127.0.0.1:8000/api/users/latest/students", { headers }),
        axios.get("http://127.0.0.1:8000/api/users/latest/teachers", { headers }),
        axios.get("http://127.0.0.1:8000/api/courses/latest", { headers }),
        axios.get("http://127.0.0.1:8000/api/get-all-payments", { headers }),
        axios.get("http://127.0.0.1:8000/api/student-records", { headers }),
        axios.get("http://127.0.0.1:8000/api/payments-by-month", { headers }),
        axios.get("http://127.0.0.1:8000/api/payments-by-week", { headers }),
      ]);

      const usersData = usersResponse.data;
      const studentCount = usersData.filter((user) => user.role === "student").length;
      const teacherCount = usersData.filter((user) => user.role === "teacher").length;
      setStudents(studentCount);
      setTeachers(teacherCount);

      const attendanceData = attendanceResponse.data;
      const presentCount = attendanceData?.attendances?.filter((a) => a.status === "Present").length || 0;
      const absentCount = attendanceData?.attendances?.filter((a) => a.status === "Absent").length || 0;
      const lateCount = attendanceData?.attendances?.filter((a) => a.status === "Late").length || 0;
      setAttendanceStats({ present: presentCount, absent: absentCount, late: lateCount });

      const eventsData = eventsResponse.data;
      setLatestEvents(eventsData?.events || []);

      const studentsData = studentsResponse.data;
      setLatestStudents(studentsData?.students || []);

      const teachersData = teachersResponse.data;
      setLatestTeachers(teachersData?.teachers || []);

      const coursesData = coursesResponse.data;
      setLatestCourses(coursesData?.courses || []);

      const paymentsData = paymentsResponse.data;
      const studentRecordsData = studentRecordsResponse.data;
      const monthlyRevenueData = monthlyRevenueResponse.data;
      const weeklyRevenueData = weeklyRevenueResponse.data;

      const totalPaymentAmount = studentRecordsData.data.reduce((sum, record) => {
        const amount = parseFloat(record.payment_amount) || 0;
        return sum + amount;
      }, 0);
      setTotalRevenue(totalPaymentAmount);

      const totalPaid = parseFloat(paymentsData.totalPayments) || 0;
      const totalUnpaid = Math.max(0, totalPaymentAmount - totalPaid);

      const latestPayments = paymentsData.payments?.slice(0, 4) || [];

      setPaymentStats({
        totalPaid,
        totalUnpaid,
        latestPayments,
      });

      setMonthlyRevenue(monthlyRevenueData.months || []);
      setWeeklyRevenue(weeklyRevenueData.weeks?.slice(0, 4) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("verifiedRole");
        navigate("/access", { replace: true });
      }
    }
  };

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

  const monthlyRevenueChartData = {
    labels: monthlyRevenue.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Revenue ($)",
        data: monthlyRevenue.map((item) => item.amount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        tension: 0.1,
      },
    ],
  };

  const weeklyRevenueChartData = {
    labels: weeklyRevenue.map((item) => `Week ${item.week}`),
    datasets: [
      {
        label: "Weekly Revenue ($)",
        data: weeklyRevenue.map((item) => item.amount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-1">
        <aside className="w-16 sm:w-64 bg-blue-800 text-white flex flex-col transition-all duration-300">
          <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
            <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Admin Dashboard</h1>
            <h1 className="text-xl font-bold block sm:hidden">AD</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/admindb" className="flex items-center space-x-2">
                  <FaSchool className="text-xl" />
                  <span className="hidden sm:block">Dashboard</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/timetableform" className="flex items-center space-x-2">
                  <FaClock className="text-xl" />
                  <span className="hidden sm:block">Time-Table</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/students" className="flex items-center space-x-2">
                  <FaUserGraduate className="text-xl" />
                  <span className="hidden sm:block">Students</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/teachers" className="flex items-center space-x-2">
                  <FaChalkboardTeacher className="text-xl" />
                  <span className="hidden sm:block">Teachers</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/parent" className="flex items-center space-x-2">
                  <FaUserFriends className="text-xl" />
                  <span className="hidden sm:block">Parents</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/reports" className="flex items-center space-x-2">
                  <FaChartBar className="text-xl" />
                  <span className="hidden sm:block">Reports</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/eventform" className="flex items-center space-x-2">
                  <FaClipboardList className="text-xl" />
                  <span className="hidden sm:block">Event Management</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/documentsform" className="flex items-center space-x-2">
                  <FaFileInvoice className="text-xl" />
                  <span className="hidden sm:block">Documents</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/recordform" className="flex items-center space-x-2">
                  <FaFile className="text-xl" />
                  <span className="hidden sm:block">Student Record</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/teacherrecord" className="flex items-center space-x-2">
                  <FaFile className="text-xl" />
                  <span className="hidden sm:block">Teacher Record</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
                <Link to="/notificationform" className="flex items-center space-x-2">
                  <FaBell className="text-xl" />
                  <span className="hidden sm:block">Notifications</span>
                </Link>
              </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 relative flex justify-center sm:justify-start">
                <Link to="/aemails" className="flex items-center space-x-2">
                  <FaEnvelope className="text-xl" />
                  <span className="hidden sm:block">Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-1 sm:right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
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

        <main className="flex-1 p-8 overflow-auto min-h-screen bg-gray-50">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500 mt-2">Efficiently manage your school operations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <FaUserGraduate className="text-blue-500 text-3xl mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{students}</h3>
                  <p className="text-gray-500">Total Students</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <FaChalkboardTeacher className="text-green-500 text-3xl mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{teachers}</h3>
                  <p className="text-gray-500">Total Teachers</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-yellow-500 text-3xl mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</h3>
                  <p className="text-gray-500">Total Revenue</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <FaEnvelope className="text-purple-500 text-3xl mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{emailCount}</h3>
                  <p className="text-gray-500">Unread Emails</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Overview</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800">Total Paid</h4>
                  <p className="text-2xl font-bold text-gray-900">${paymentStats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-red-800">Total Unpaid</h4>
                  <p className="text-2xl font-bold text-gray-900">${paymentStats.totalUnpaid.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-80">
                <Line
                  data={monthlyRevenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: "Monthly Revenue Trend",
                        font: { size: 16 },
                        padding: { bottom: 20 },
                      },
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Revenue ($)" },
                      },
                      x: {
                        title: { display: true, text: "Month" },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Payments</h3>
              {paymentStats.latestPayments.length > 0 ? (
                <div className="space-y-4">
                  {paymentStats.latestPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium text-gray-800">${payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          payment.status === "paid" ? "text-green-600" : "text-yellow-600"
                        } capitalize`}
                      >
                        {payment.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No payments found</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Attendance Overview</h3>
              <div className="h-64">
                <Pie
                  data={attendanceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Revenue</h3>
              <div className="h-64">
                <Bar
                  data={weeklyRevenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: "Last 4 Weeks Revenue",
                        font: { size: 16 },
                        padding: { bottom: 20 },
                      },
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Revenue ($)" },
                      },
                      x: {
                        title: { display: true, text: "Week" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {latestEvents.length > 0 ? (
                  latestEvents.map((event, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
                          <FaCalendarAlt />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{event.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                          <p className="text-xs text-indigo-600 mt-2">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No upcoming events</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">New Students</h2>
              </div>
              <div class repertoire-y divide-gray-100 >
                {latestStudents.length > 0 ? (
                  latestStudents.map((student, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium mr-4">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No new students</div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">New Teachers</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {latestTeachers.length > 0 ? (
                  latestTeachers.map((teacher, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-4">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{teacher.name}</h3>
                          <p className="text-sm text-gray-500">{teacher.email}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No new teachers</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Recent Courses</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {latestCourses.length > 0 ? (
                  latestCourses.map((course, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 mr-4">
                          <FaUsers />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{course.name}</h3>
                          <div className="flex mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-2">
                              {course.class}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {course.subject}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No recent courses</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Admindb;