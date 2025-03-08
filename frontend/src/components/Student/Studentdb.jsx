import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaEnvelope  } from 'react-icons/fa';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const StudentDB = () => {
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      const studentData = JSON.parse(localStorage.getItem('user'));
      const studentNIN = studentData?.nin;

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
  }, []);

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

  // Prepare data for the attendance chart
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

  // Prepare data for the grades chart (Line Chart)
  const gradesChartData = {
    labels: grades.map((grade) => grade.subject),
    datasets: [
      {
        label: 'Grades',
        data: grades.map((grade) => {
          // Convert grades to numerical values for the chart
          switch (grade.grade) {
            case 'A+': return 4.3;
            case 'A': return 4.0;
            case 'B': return 3.0;
            case 'C': return 2.0;
            default: return 0;
          }
        }),
        borderColor: 'rgba(153, 102, 255, 1)', // Purple line
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Light purple fill
        borderWidth: 2,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)', // Purple points
        pointBorderColor: '#fff', // White border for points
        pointHoverBackgroundColor: '#fff', // White hover background
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)', // Purple hover border
        fill: true, // Fill area under the line
      },
    ],
  };

  // Custom options for the Line Chart
  const gradesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
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
          display: false, // Hide x-axis grid lines
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
          color: 'rgba(0, 0, 0, 0.1)', // Light gray grid lines
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
          stepSize: 1, // Show ticks in increments of 1
        },
      },
    },
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
                  <FaBook  />
                  <span>Courses</span>
                </Link>
              </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/studenteventview" className="flex items-center space-x-2">
                <FaCalendarAlt /> <span>Events</span>
              </Link>
            </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>                          
              <li className="px-6 py-3 hover:bg-purple-700">
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
            <h2 className="text-3xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
            <p className="text-lg text-gray-600 mt-2">Here's an overview of your performance:</p>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Attendance Chart */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance Overview</h3>
              <div className="w-full h-96"> {/* Increased height */}
                <Pie data={attendanceChartData} options={gradesChartOptions} />
              </div>
            </div>

            {/* Grades Chart */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Grades Overview</h3>
              <div className="w-full h-96"> {/* Increased height */}
                <Line data={gradesChartData} options={gradesChartOptions} />
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Attendance</h3>
            {attendance.length === 0 ? (
              <p className="text-gray-500">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-purple-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Subject</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Class</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 2).map((record) => ( // Show only last 2 records
                      <tr key={record.id} className="border-b">
                        <td className="px-6 py-3">{record.subject}</td>
                        <td className="px-6 py-3">{record.status}</td>
                        <td className="px-6 py-3">{record.class}</td>
                        <td className="px-6 py-3">{new Date(record.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Grades */}
          <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Grades</h3>
            {grades.length === 0 ? (
              <p className="text-gray-500">No grade records found.</p>
            ) : (
              <div className="overflow-x-auto">
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
                    {grades.slice(0, 2).map((grade) => ( // Show only last 2 records
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
        </main>
      </div>
    </div>
  );
};

export default StudentDB;