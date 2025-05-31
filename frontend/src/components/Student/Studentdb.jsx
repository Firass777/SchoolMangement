import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt,
  FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaMoneyCheck,
  FaMoneyBillWave, FaMagic, FaRegClock
} from 'react-icons/fa';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { motion } from "framer-motion";
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement);

const DashboardCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-4 sm:p-6 ${color} text-white rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-shadow duration-300`}>
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </div>
    <Icon className="text-3xl sm:text-4xl opacity-75" />
  </div>
);

const StudentDB = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState({ total: 0, pending: 0, amountDue: 0 });
  const [prediction, setPrediction] = useState('Loading...');
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);
  const studentData = JSON.parse(localStorage.getItem('user'));
  const studentNIN = studentData?.nin;

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
      if (cachedRole === "student") {
        setIsVerifying(false);
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
          response.data.role === "student" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "student");
          setIsVerifying(false);
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

    const fetchData = async () => {
      const fetchPrediction = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/predict?nin=${studentNIN}`);
          const data = await response.json();
          setPrediction(data.prediction || 'No prediction available');
        } catch (error) {
          console.error('Prediction fetch error:', error);
          setPrediction('Prediction unavailable');
        }
      };

      const fetchPayments = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/payment-summary?user_id=${studentData.id}`);
          const data = await response.json();
          
          if (response.ok) {
            setPayments({ 
              total: data.total_paid,
              pending: data.pending_payments,
              amountDue: data.amount_due
            });
          }
        } catch (error) {
          console.error('Payment fetch error:', error);
        }
      };

      const fetchAttendance = async () => {
        if (!studentNIN) return;

        try {
          const response = await fetch(`http://localhost:8000/api/attendance/${studentNIN}`);
          const data = await response.json();

          if (response.ok) {
            const sortedAttendance = data.attendances.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAttendance(sortedAttendance);
          }
        } catch (error) {
          console.error('Error fetching attendance:', error);
        }
      };

      const fetchGrades = async () => {
        if (!studentNIN) return;

        try {
          const response = await fetch(`http://localhost:8000/api/grades/${studentNIN}`);
          const data = await response.json();

          if (response.ok) {
            const sortedGrades = data.grades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setGrades(sortedGrades);
          }
        } catch (error) {
          console.error('Error fetching grades:', error);
        }
      };

      fetchPrediction();
      if (studentData?.id) {
        fetchPayments();
      }
      fetchAttendance();
      fetchGrades();
    };

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

    verifyUserAndInitialize();
  }, [navigate, studentNIN, studentData]);

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        label: 'Attendance Status',
        data: [
          attendance.filter((a) => a.status === 'Present').length,
          attendance.filter((a) => a.status === 'Absent').length,
          attendance.filter((a) => a.status === 'Late').length,
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const gradesChartData = {
    labels: grades.map((grade) => grade.subject),
    datasets: [
      {
        label: 'Grades',
        data: grades.map((grade) => {
          switch (grade.grade) {
            case 'A+': return 4.3;
            case 'A': return 4.0;
            case 'B': return 3.0;
            case 'C': return 2.0;
            default: return 0;
          }
        }),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
        fill: true,
      },
    ],
  };

  const attendanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance Status',
        font: {
          size: 16,
        },
      },
    },
  };

  const gradesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Grades Overview',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Subjects',
          font: {
            size: 14,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Grade Points',
          font: {
            size: 14,
          },
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 animate-fade-in">
      {/* Sidebar */}
      <aside className="w-16 sm:w-64 bg-purple-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Student Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">SD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/studentdb" className="flex items-center space-x-2">
                <FaUserGraduate className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/spayment" className="flex items-center space-x-2">
                <FaMoneyCheck className="text-xl" />
                <span className="hidden sm:block">Payment</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/stimetable" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/gradesview" className="flex items-center space-x-2">
                <FaChartLine className="text-xl" />
                <span className="hidden sm:block">Grades</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/attendanceview" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Attendance</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/courseview" className="flex items-center space-x-2">
                <FaBook className="text-xl" />
                <span className="hidden sm:block">Courses</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/studenteventview" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Events</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 relative flex justify-center sm:justify-start">
              <Link to="/semails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/documents" className="flex items-center space-x-2">
                <FaFileInvoice className="text-xl" />
                <span className="hidden sm:block">Documents</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 relative flex justify-center sm:justify-start">
              <Link to="/notificationview" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/seditprofile" className="flex items-center space-x-2">
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

      <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
        <motion.main
          className="flex-1 p-4 lg:p-6 overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className="mb-6" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
            <p className="text-base sm:text-lg text-gray-600 mt-2">Here's an overview of your performance:</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {[{
              title: "Total Payments", 
              value: `$${payments.total.toFixed(2)}`, 
              icon: FaMoneyBillWave,
              color: "bg-gradient-to-r from-purple-800 via-purple-500 to-green-400 text-white"
            }, {
              title: "Amount Due", 
              value: `$${payments.amountDue.toFixed(2)}`, 
              icon: FaRegClock,
              color: "bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-300 text-white"
            }, {
              title: "Performance Prediction", 
              value: prediction, 
              icon: FaMagic,
              color: prediction === "Likely to Pass"
                ? "bg-gradient-to-r from-green-600 via-green-500 to-red-400 text-white"
                : "bg-gradient-to-r from-red-600 via-red-500 to-green-400 text-white"
            }].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <DashboardCard {...card} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <motion.div
              className="p-4 sm:p-6 bg-white shadow-md rounded-lg"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">Attendance Overview</h3>
              <div className="w-full h-64 sm:h-96 flex items-center justify-center">
                <Pie data={attendanceChartData} options={attendanceChartOptions} />
              </div>
            </motion.div>

            <motion.div
              className="p-4 sm:p-6 bg-white shadow-md rounded-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Grades Overview</h3>
              <div className="w-full h-64 sm:h-96">
                <Line data={gradesChartData} options={gradesChartOptions} />
              </div>
            </motion.div>
          </div>

          {[{
            title: "Recent Attendance", data: attendance,
            headers: ["Subject", "Status", "Class", "Date"]
          }, {
            title: "Recent Grades", data: grades,
            headers: ["Subject", "Grade", "Class", "Date"]
          }].map((section, index) => (
            <motion.div
              key={index}
              className="mb-6 p-4 sm:p-6 bg-white shadow-md rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{section.title}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-purple-800 text-white">
                    <tr>
                      {section.headers.map((header, idx) => (
                        <th key={idx} className="px-4 sm:px-6 py-2 sm:py-3 text-left">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.data.slice(0, 2).map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="px-4 sm:px-6 py-2 sm:py-3">{record.subject}</td>
                        <td className="px-4 sm:px-6 py-2 sm:py-3">{record.status || record.grade}</td>
                        <td className="px-4 sm:px-6 py-2 sm:py-3">{record.class}</td>
                        <td className="px-4 سم:px-6 py-2 sm:py-3">{new Date(record.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </motion.main>
      </main>
    </div>
  );
};

export default StudentDB;