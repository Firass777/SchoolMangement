import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaChalkboardTeacher, FaUserGraduate, FaChartLine, FaCalendarAlt, FaSignOutAlt, FaBook, FaClipboardList, FaEnvelope, FaClock, FaIdCard, FaBell } from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";

function Teacherdb() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    students: 0, 
    attendance: 0, 
    grades: 0 
  });
  const [barData, setBarData] = useState({ 
    labels: ['No data'], 
    datasets: [{
      label: "Student Attendance",
      backgroundColor: "#4F46E5",
      borderColor: "#4F46E5",
      borderWidth: 1,
      data: [0]
    }] 
  });
  const [lineData, setLineData] = useState({ 
    labels: ['No data'], 
    datasets: [{
      label: "Class Performance",
      backgroundColor: "#10B981",
      borderColor: "#10B981",
      borderWidth: 2,
      data: [0]
    }] 
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [nextClass, setNextClass] = useState({ 
    subject: 'No upcoming classes', 
    day: '', 
    time: '', 
    location: '' 
  });
  const [latestEvents, setLatestEvents] = useState([]);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      if (!token || !localRole || !userData?.email) {
        localStorage.removeItem("user");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "teacher") {
        setIsVerifying(false);
        AOS.init({ duration: 1000 });
        fetchData();
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
          AOS.init({ duration: 1000 });
          fetchData();
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
  }, [navigate]);

  const fetchNotificationCount = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      const email = userData?.email;
      
      if (!email) return;

      const response = await axios.get(
        `http://127.0.0.1:8000/api/notifications/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        setNotificationCount(response.data.count || 0);
        localStorage.setItem('notificationCount', (response.data.count || 0).toString());
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    }
  };

  const fetchEmailCount = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      const email = userData?.email;
      
      if (!email) return;

      const response = await axios.get(
        `http://127.0.0.1:8000/api/emails/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        setEmailCount(response.data.count || 0);
        localStorage.setItem('emailCount', (response.data.count || 0).toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
      setEmailCount(0);
    }
  };

  const fetchData = async () => {
    try {
      setError(null);

      if (!user || !user.nin) {
        throw new Error("User information not available");
      }

      const statsRes = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/attendance/students-count/${user.nin}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`http://127.0.0.1:8000/api/attendance/rate/${user.nin}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`http://127.0.0.1:8000/api/grades/average/${user.nin}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      const [studentsData, attendanceData, gradesData] = statsRes.map(res => res.data);

      setStats({
        students: studentsData.count || 0,
        attendance: attendanceData.attendance_rate || 0,
        grades: gradesData.average_grade || 0
      });

      try {
        const attendanceRes = await axios.get(`http://127.0.0.1:8000/api/attendance/last-7-days/${user.nin}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const attendanceChart = attendanceRes.data;
        
        setBarData({
          labels: attendanceChart.labels || ['No data'],
          datasets: [{
            label: "Student Attendance",
            backgroundColor: "#4F46E5",
            borderColor: "#4F46E5",
            borderWidth: 1,
            data: attendanceChart.data || [0]
          }]
        });
      } catch (err) {
        console.error("Error fetching attendance chart:", err);
        setBarData({
          labels: ['No data'],
          datasets: [{
            label: "Student Attendance",
            backgroundColor: "#4F46E5",
            borderColor: "#4F46E5",
            borderWidth: 1,
            data: [0]
          }]
        });
      }

      try {
        const gradesRes = await axios.get(`http://127.0.0.1:8000/api/grades/last-7-days/${user.nin}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const gradesChart = gradesRes.data;
        
        setLineData({
          labels: gradesChart.labels || ['No data'],
          datasets: [{
            label: "Class Performance",
            backgroundColor: "#10B981",
            borderColor: "#10B981",
            borderWidth: 2,
            data: gradesChart.data || [0]
          }]
        });
      } catch (err) {
        console.error("Error fetching grades chart:", err);
        setLineData({
          labels: ['No data'],
          datasets: [{
            label: "Class Performance",
            backgroundColor: "#10B981",
            borderColor: "#10B981",
            borderWidth: 2,
            data: [0]
          }]
        });
      }

      try {
        const recentRes = await axios.get(`http://127.0.0.1:8000/api/attendance/teacher/${user.nin}?limit=3`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRecentAttendance(recentRes.data.attendances || []);
      } catch (err) {
        console.error("Error fetching recent attendance:", err);
        setRecentAttendance([]);
      }

      try {
        const timetableRes = await axios.get(`http://127.0.0.1:8000/api/timetable/next-class/${user.email}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNextClass(timetableRes.data.nextClass || { 
          subject: 'No upcoming classes', 
          day: '', 
          time: '', 
          location: '' 
        });
      } catch (err) {
        console.error("Error fetching next class:", err);
        setNextClass({ 
          subject: 'No upcoming classes', 
          day: '', 
          time: '', 
          location: '' 
        });
      }

      try {
        const eventsRes = await axios.get(`http://127.0.0.1:8000/api/events/latest-for-teacher`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLatestEvents(eventsRes.data.events || []);
      } catch (err) {
        console.error("Error fetching latest events:", err);
        setLatestEvents([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    }
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="text-red-600 font-bold">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
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
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    localStorage.clear();
                  }}
                >
                  <FaSignOutAlt className="text-xl" />
                  <span className="hidden sm:block">Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto min-h-screen">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.name || 'Teacher'}!</h2>
            <p className="text-gray-600">Manage your classes and students.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaUserGraduate className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{stats.students}</h3>
                <p className="text-gray-600">Total Students</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaCalendarAlt className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{stats.attendance}%</h3>
                <p className="text-gray-600">Attendance Rate</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaChartLine className="text-yellow-500 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{stats.grades}</h3>
                <p className="text-gray-600">Average Grade</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaChalkboardTeacher className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Next Class</h3>
                <p className="text-gray-600">{nextClass?.subject || 'No Classes Yet'}</p>
                {nextClass?.time && (
                  <>
                    <p className="text-sm text-gray-500">{nextClass.day} {nextClass.time}</p>
                    <p className="text-sm text-gray-500">{nextClass.location}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-6 mb-6">
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full mb-6 sm:mb-0" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Student Attendance</h3>
              <div className="h-80">
                <Bar 
                  data={barData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: barData.datasets[0].data[0] === 0 ? 10 : undefined
                      }
                    }
                  }} 
                />
              </div>
              {barData.labels[0] === 'No data' && (
                <p className="text-center text-gray-500 mt-2">No attendance data available</p>
              )}
            </div>

            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Class Performance</h3>
              <div className="h-80">
                <Line 
                  data={lineData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: lineData.datasets[0].data[0] === 0 ? 10 : undefined
                      }
                    }
                  }} 
                />
              </div>
              {lineData.labels[0] === 'No data' && (
                <p className="text-center text-gray-500 mt-2">No performance data available</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-6 mb-6">
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full mb-6 sm:mb-0" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Recent Attendance</h3>
              {recentAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent attendance records found</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((att, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{att.student_name || 'Student'}</td>
                        <td className="p-3">{new Date(att.created_at).toLocaleDateString()}</td>
                        <td className={`p-3 font-semibold ${
                          att.status === 'Present' ? 'text-green-600' : 
                          att.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {att.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Latest Events</h3>
              {latestEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {latestEvents.map((event, index) => (
                    <div key={index} className="border-b pb-4">
                      <h4 className="text-lg font-semibold">{event.name}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{event.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Teacherdb;