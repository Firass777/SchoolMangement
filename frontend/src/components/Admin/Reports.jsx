import { useEffect, useState } from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { FaChartLine, FaRegCalendarCheck, FaMoneyBillWave, FaUserGraduate, FaUsers } from "react-icons/fa";
import "chart.js/auto";
import { Link } from 'react-router-dom';

function Reports() {
  const [reportData, setReportData] = useState({});

  // Academic Performance Data Chart
  const academicData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Student Performance",
        backgroundColor: "#3B82F6", 
        borderColor: "#3B82F6", 
        fill: true,
        tension: 0.4,
        data: [75, 80, 85, 90, 88, 92],
      },
    ],
  };

  // Payment Data Chart
  const paymentData = {
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        label: "Payment Status",
        backgroundColor: ["#34D399", "#F59E0B", "#F87171"], 
        borderColor: "#10B981", 
        borderWidth: 1,
        hoverBackgroundColor: ["#059669", "#D97706", "#EF4444"], 
        data: [3000, 1000, 500],
      },
    ],
  };

  // Attendance Data Chart
  const attendanceData = {
    labels: ["Present", "Absent", "Late"],
    datasets: [
      {
        data: [90, 5, 5],
        backgroundColor: ["#34D399", "#F87171", "#F59E0B"], 
        hoverBackgroundColor: ["#059669", "#EF4444", "#D97706"],
      },
    ],
  };

  // Financial Overview Data Chart
  const financialData = {
    labels: ["Paid", "Outstanding", "Scholarships"],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ["#34D399", "#F59E0B", "#3B82F6"],
        hoverBackgroundColor: ["#059669", "#D97706", "#3B82F6"],
      },
    ],
  };

  // Recent Activities Table 
  const recentActivities = [
    { name: "Math Exam", date: "Feb 10, 2025", status: "Completed", details: "View Results" },
    { name: "History Assignment", date: "Feb 12, 2025", status: "In Progress", details: "Submit Assignment" },
    { name: "School Event", date: "Feb 15, 2025", status: "Upcoming", details: "View Event Details" },
  ];

  useEffect(() => {
    // Fetch report data from API
    fetch("http://127.0.0.1:8000/api/reports")
      .then((response) => response.json())
      .then((data) => setReportData(data));
  }, []);

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">School Performance Reports</h2>
        <div>
          <Link to="/admindb" className="flex items-center text-teal-600 hover:text-teal-800">
            <FaRegCalendarCheck className="mr-2" />
            Go to Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Attendance Report */}
        <div className="bg-white p-6 shadow-xl rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Attendance Overview</h3>
          <div className="h-72">
            <Pie data={attendanceData} options={{animation: {duration: 2000, }, maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white p-6 shadow-xl rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Financial Overview</h3>
          <div className="h-72">
            <Doughnut data={financialData} options={{animation: {duration: 2000, }, maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-white p-6 shadow-xl rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Academic Performance (Last 6 Months)</h3>
          <div className="h-72">
            <Line data={academicData} options={{animation: {duration: 2000, }, maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white p-6 shadow-xl rounded-lg mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Payment Status Overview</h3>
        <div className="h-72">
          <Bar data={paymentData} options={{ animation: {duration: 2000, },maintainAspectRatio: false, responsive: true }} />
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white p-6 shadow-xl rounded-lg mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left text-sm font-medium text-gray-600">Activity Name</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((activity, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{activity.name}</td>
                <td className="p-4">{activity.date}</td>
                <td className="p-4 text-green-600 font-semibold">{activity.status}</td>
                <td className="p-4">
                  <button className="text-teal-600 hover:underline">{activity.details}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Performance by Subject Chart */}
      <div className="bg-white p-6 shadow-xl rounded-lg mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Subject-wise Performance</h3>
        <div className="h-72">
          <Bar
            data={{
              labels: ["Math", "Science", "English", "History", "Art"],
              datasets: [
                {
                  label: "Scores",
                  backgroundColor: "#3B82F6",
                  borderColor: "#3B82F6",
                  data: [85, 90, 88, 80, 75],
                },
              ],
            }}
            options={{animation: {duration: 2000, }, maintainAspectRatio: false, responsive: true }}
          />
        </div>
      </div>
    </div>
  );
}

export default Reports;
