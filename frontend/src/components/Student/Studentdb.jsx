import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt,
  FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaMoneyCheck,
  FaMoneyBillWave, FaMagic, FaRegClock
} from 'react-icons/fa';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
  import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement);

const DashboardCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 ${color} text-white rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-shadow duration-300`}>
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <Icon className="text-4xl opacity-75" />
  </div>
);

const StudentDB = () => {
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState({ total: 1500, pending: 500 });
  const [prediction, setPrediction] = useState('Loading...');
  const studentData = JSON.parse(localStorage.getItem('user'));
  const studentNIN = studentData?.nin;

  useEffect(() => {
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
    fetchPrediction();
  }, [studentNIN]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentNIN) return;

      try {
        const response = await fetch(`http://localhost:8000/api/attendance/${studentNIN}`);
        const data = await response.json();

        if (response.ok) {
          const sortedAttendance = data.attendances.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setAttendance(sortedAttendance);
        } else {
          alert(data.message || 'Failed to fetch attendance.');
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [studentNIN]);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentNIN) return;

      try {
        const response = await fetch(`http://localhost:8000/api/grades/${studentNIN}`);
        const data = await response.json();

        if (response.ok) {
          const sortedGrades = data.grades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setGrades(sortedGrades);
        } else {
          alert(data.message || 'Failed to fetch grades.');
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    fetchGrades();
  }, [studentNIN]);

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        label: 'Attendance',
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

  const gradesChartOptions = {
    responsive: true,
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

  return (
    <div className="flex flex-col h-full bg-gray-100 animate-fade-in">
      <div className="flex flex-1">
        <aside className="w-64 bg-purple-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studentdb" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/spayment" className="flex items-center space-x-2">
                  <FaMoneyCheck />
                  <span>Payment</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/stimetable" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/gradesview" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/attendanceview" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/courseview" className="flex items-center space-x-2">
                  <FaBook />
                  <span>Courses</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studenteventview" className="flex items-center space-x-2">
                  <FaCalendarAlt /> <span>Events</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/documents" className="flex items-center space-x-2">
                  <FaFileInvoice /> <span>Documents</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/seditprofile" className="flex items-center space-x-2">
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

        <main className="flex-1 p-6 overflow-auto min-h-screen">
            <motion.main
              className="flex-1 p-6 overflow-auto min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
             >
              <motion.div className="mb-6" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
                <h2 className="text-3xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
                <p className="text-lg text-gray-600 mt-2">Here's an overview of your performance:</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[{
                  title: "Total Payments", value: `$${payments.total}`, icon: FaMoneyBillWave,
                  color: "bg-gradient-to-r from-purple-800 via-purple-500 to-green-400 text-white"
                }, {
                  title: "Pending Payments", value: `$${payments.pending}`, icon: FaRegClock,
                  color: "bg-gradient-to-r from-purple-800 via-purple-500 to-yellow-300 text-white"
                }, {
                  title: "Performance Prediction", value: prediction, icon: FaMagic,
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div
                  className="p-6 bg-white shadow-md rounded-lg"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Attendance Overview</h3>
                  <div className="w-full h-96 flex items-center justify-center">
                    <Pie data={attendanceChartData} options={gradesChartOptions} />
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 bg-white shadow-md rounded-lg"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Grades Overview</h3>
                  <div className="w-full h-96">
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
                  className="mb-6 p-6 bg-white shadow-md rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h3>
                  {section.data.length === 0 ? (
                    <p className="text-gray-500">No records found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead className="bg-purple-800 text-white">
                          <tr>
                            {section.headers.map((header, idx) => (
                              <th key={idx} className="px-6 py-3 text-left">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.data.slice(0, 2).map((record) => (
                            <tr key={record.id} className="border-b">
                              <td className="px-6 py-3">{record.subject}</td>
                              <td className="px-6 py-3">{record.status || record.grade}</td>
                              <td className="px-6 py-3">{record.class}</td>
                              <td className="px-6 py-3">{new Date(record.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.main>

        </main>
      </div>
    </div>
  );
};

export default StudentDB;