import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaIdCard , FaMoneyCheck} from "react-icons/fa";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

function Guardiandb() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [attendance] = useState("95%");
  const [grades] = useState("A");
  const [schedule] = useState("Math, Science, English");

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Grades",
        backgroundColor: "#10B981",
        borderColor: "#10B981",
        borderWidth: 2,
        data: [85, 88, 90, 92],
      },
    ],
  };

  const pieData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [95, 5],
        backgroundColor: ["#4F46E5", "#E53E3E"],
        hoverBackgroundColor: ["#4338CA", "#C53030"],
      },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-orange-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Guardian Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/guardiandb" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/gpayment" className="flex items-center space-x-2">
                  <FaMoneyCheck />
                  <span>Payment</span>
                </Link>
              </li>              
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/ggrades" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/gattendance" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
             <li className="px-6 py-3 hover:bg-orange-700">
               <Link to="/gevent" className="flex items-center space-x-2">
                 <FaCalendarAlt /> <span>Events</span>
               </Link>
             </li>  
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/notifications" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/geditprofile" className="flex items-center space-x-2">
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

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, Guardian!</h2>
            <p className="text-gray-600">Track your child's progress.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaCalendarAlt className="text-blue-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{attendance}</h3>
                <p className="text-gray-600">Attendance Rate</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaChartLine className="text-green-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{grades}</h3>
                <p className="text-gray-600">Average Grade</p>
              </div>
            </div>
            <div data-aos="fade-up" className="bg-white shadow-lg p-6 rounded-lg flex items-center">
              <FaUserGraduate className="text-orange-600 text-4xl mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{schedule}</h3>
                <p className="text-gray-600">Today's Schedule</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 mb-6">
            {/* Line Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full mb-6 sm:mb-0" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Grades Over Time</h3>
              <div className="h-80">
                <Line data={lineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg sm:w-1/2 w-full" data-aos="fade-up">
              <h3 className="text-xl font-bold mb-4">Attendance Breakdown</h3>
              <div className="h-80">
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Guardiandb;