import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaDownload, FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaMoneyCheck } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import html2pdf from 'html2pdf.js';



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GradesView = () => {
  const [grades, setGrades] = useState([]);

  // Fetch grades data
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
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: grades.map((grade) => grade.subject),
    datasets: [
      {
        label: 'Grades',
        data: grades.map((grade) => {
          // Convert grades to numerical values for the chart (e.g., A=4, B=3, etc.)
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

  // Function to download grades as PDF
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
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
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
            <h2 className="text-3xl font-bold text-gray-800">Your Grades</h2>
            <p className="text-lg text-gray-600 mt-2">View your grades and performance below:</p>
          </div>

          {/* Download Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700"
            >
              <FaDownload className="mr-2" />
              Download as PDF
            </button>
          </div>

          {/* Grades Table */}
          <div id="grades-table" className="mb-6 p-6 bg-white shadow-md rounded-lg">
            {grades.length === 0 ? (
              <p className="text-gray-500">No grade records found.</p>
            ) : (
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                  <thead className="bg-purple-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Subject</th>
                      <th className="px-6 py-3 text-left">Grade</th>
                      <th className="px-6 py-3 text-left">Class</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id} className="border-b">
                        <td className="px-6 py-3">{grade.subject}</td>
                        <td className="px-6 py-3">{grade.grade}</td>
                        <td className="px-6 py-3">{grade.class}</td>
                        <td className="px-6 py-3">{new Date(grade.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-6">
            {/* Grades Chart */}
            <div className="w-1/3 p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Grades Overview</h3>
              <div className="w-full h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Performance Summary */}
            <div className="w-1/3 p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Summary</h3>
              {grades.length > 0 ? (
                <>
                  <p className="text-gray-600">
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
                  <p className="text-gray-600 mt-2">
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
                <p className="text-gray-500">No grade records found.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GradesView;
