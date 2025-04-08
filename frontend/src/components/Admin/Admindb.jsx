import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";

function Admindb() {
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
    latestPayments: []
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchDashboardData();
    fetchEmailCount();
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => clearInterval(emailInterval);
  }, []);

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

  const fetchDashboardData = async () => {
    try {
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
        weeklyRevenueResponse
      ] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/users"),
        fetch("http://127.0.0.1:8000/api/attendance"),
        fetch("http://127.0.0.1:8000/api/events/latest"),
        fetch("http://127.0.0.1:8000/api/users/latest/students"),
        fetch("http://127.0.0.1:8000/api/users/latest/teachers"),
        fetch("http://127.0.0.1:8000/api/courses/latest"),
        fetch("http://127.0.0.1:8000/api/get-all-payments"),
        fetch("http://127.0.0.1:8000/api/student-records"),
        fetch("http://127.0.0.1:8000/api/payments-by-month"),
        fetch("http://127.0.0.1:8000/api/payments-by-week")
      ]);

      const usersData = await usersResponse.json();
      const studentCount = usersData.filter((user) => user.role === "student").length;
      const teacherCount = usersData.filter((user) => user.role === "teacher").length;
      setStudents(studentCount);
      setTeachers(teacherCount);

      const attendanceData = await attendanceResponse.json();
      const presentCount = attendanceData?.attendances?.filter((a) => a.status === "Present").length || 0;
      const absentCount = attendanceData?.attendances?.filter((a) => a.status === "Absent").length || 0;
      const lateCount = attendanceData?.attendances?.filter((a) => a.status === "Late").length || 0;
      setAttendanceStats({ present: presentCount, absent: absentCount, late: lateCount });

      const eventsData = await eventsResponse.json();
      setLatestEvents(eventsData?.events || []);

      const studentsData = await studentsResponse.json();
      setLatestStudents(studentsData?.students || []);

      const teachersData = await teachersResponse.json();
      setLatestTeachers(teachersData?.teachers || []);

      const coursesData = await coursesResponse.json();
      setLatestCourses(coursesData?.courses || []);

      const paymentsData = await paymentsResponse.json();
      const studentRecordsData = await studentRecordsResponse.json();
      const monthlyRevenueData = await monthlyRevenueResponse.json();
      const weeklyRevenueData = await weeklyRevenueResponse.json();

      // Calculate total revenue from student records (sum of all payment_amount)
      const totalPaymentAmount = studentRecordsData.data.reduce((sum, record) => {
        const amount = parseFloat(record.payment_amount) || 0;
        return sum + amount;
      }, 0);
      setTotalRevenue(totalPaymentAmount);

      // Calculate payment stats
      const totalPaid = parseFloat(paymentsData.totalPayments) || 0;
      const totalUnpaid = Math.max(0, totalPaymentAmount - totalPaid);
      
      // Get latest 4 payments
      const latestPayments = paymentsData.payments?.slice(0, 4) || [];
      
      setPaymentStats({
        totalPaid,
        totalUnpaid,
        latestPayments
      });

      setMonthlyRevenue(monthlyRevenueData.months || []);
      setWeeklyRevenue(weeklyRevenueData.weeks?.slice(0, 4) || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
    labels: monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: "Monthly Revenue ($)",
        data: monthlyRevenue.map(item => item.amount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  };

  const weeklyRevenueChartData = {
    labels: weeklyRevenue.map(item => `Week ${item.week}`),
    datasets: [
      {
        label: "Weekly Revenue ($)",
        data: weeklyRevenue.map(item => item.amount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
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

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, Admin!</h2>
            <p className="text-gray-600">Manage your school efficiently.</p>
          </div>

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
                <h3 className="text-2xl font-semibold">${totalRevenue.toLocaleString()}</h3>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white p-6 shadow-lg rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800">Total Paid</h4>
                  <p className="text-2xl font-bold">${paymentStats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-red-800">Total Unpaid</h4>
                  <p className="text-2xl font-bold">${paymentStats.totalUnpaid.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-64">
                <Line 
                  data={monthlyRevenueChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Monthly Revenue',
                        font: {
                          size: 16
                        }
                      },
                    },
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Latest Payments</h4>
              {paymentStats.latestPayments.length > 0 ? (
                <div className="space-y-3">
                  {paymentStats.latestPayments.map((payment, index) => (
                    <div key={index} className="border-b pb-2">
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                      <p className={`text-sm ${
                        payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      } capitalize`}>
                        {payment.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No payments found</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-bold mb-4">Attendance Overview</h3>
              <div className="h-64 flex items-center justify-center">
                <Pie data={attendanceChartData} />
              </div>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-bold mb-4">Weekly Revenue</h3>
              <div className="h-64 flex items-center justify-center">
                <Bar 
                  data={weeklyRevenueChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Weekly Revenue (Last 4 Weeks)',
                        font: {
                          size: 16
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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