import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaDownload, FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaMoneyCheck } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GradesView = () => {
  const [grades, setGrades] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

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

  useEffect(() => {
    const fetchGrades = async () => {
      const studentData = JSON.parse(localStorage.getItem('user'));
      const studentNIN = studentData?.nin;

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
    fetchNotificationCount();
    fetchEmailCount();
    const notificationInterval = setInterval(fetchNotificationCount, 30000);
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => {
      clearInterval(notificationInterval);
      clearInterval(emailInterval);
    };
  }, []);

  const chartData = {
    labels: grades.map((grade) => grade.subject),
    datasets: [
      {
        label: 'Grades',
        data: grades.map((grade) => {
          switch (grade.grade) {
            case 'A': return 4;
            case 'B': return 3;
            case 'C': return 2;
            case 'D': return 1;
            default: return 0;
          }
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Grades Overview',
      },
    },
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('grades-table');
    const opt = {
      margin: 10,
      filename: 'grades_report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
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
              <Link to="/" className="flex items-center space-x-2">
                <FaSignOutAlt className="text-xl" />
                <span className="hidden sm:block">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Grades</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">View your grades and performance below:</p>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700"
          >
            <FaDownload className="mr-2" /> Download as PDF
          </button>
        </div>

        <div id="grades-table" className="mb-6 p-4 sm:p-6 bg-white shadow-md rounded-lg">
          {grades.length === 0 ? (
            <p className="text-gray-500">No grade records found.</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-purple-800 text-white">
                  <tr>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm">Subject</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm">Grade</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm">Class</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b">
                      <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">{grade.subject}</td>
                      <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">{grade.grade}</td>
                      <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">{grade.class}</td>
                      <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">{new Date(grade.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-6">
          <div className="w-full sm:w-1/2 p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Grades Overview</h3>
            <div className="w-full h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Performance Summary</h3>
            {grades.length > 0 ? (
              <>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your average grade is{' '}
                  <span className="font-semibold text-purple-800">
                    {(
                      grades.reduce((acc, grade) => {
                        switch (grade.grade) {
                          case 'A': return acc + 4;
                          case 'B': return acc + 3;
                          case 'C': return acc + 2;
                          case 'D': return acc + 1;
                          default: return acc;
                        }
                      }, 0) / grades.length
                    ).toFixed(2)}
                  </span>
                  .
                </p>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {grades.some((g) => g.grade === 'A') ? (
                    "Great job! Keep up the excellent work!"
                  ) : grades.some((g) => g.grade === 'D') ? (
                    "Consider reviewing your weaker subjects to improve."
                  ) : (
                    "You're doing well, keep pushing forward!"
                  )}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">No grade records found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradesView;