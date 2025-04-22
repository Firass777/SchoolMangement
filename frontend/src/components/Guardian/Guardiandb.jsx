import { useEffect, useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaSignOutAlt,
  FaIdCard,
  FaMoneyCheck,
  FaEnvelope,
  FaClock,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Guardiandb() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [childrenGrades, setChildrenGrades] = useState({});
  const [childrenAttendances, setChildrenAttendances] = useState({});
  const [expandedSection, setExpandedSection] = useState({
    payment: true,
    grades: true,
    attendance: true
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
      // Access Checking
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || userData.role !== "parent") {
        navigate("/access");
        return;
      }

    fetchData();
    fetchNotificationCount();
    fetchEmailCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
      fetchEmailCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

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

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      const childrenNin = JSON.parse(user.children_nin || '[]');
      if (childrenNin.length > 0) {
        const childrenResponse = await axios.get(
          `http://localhost:8000/api/get-children?nins=${childrenNin.join(',')}`
        );
        setChildren(childrenResponse.data);

        const gradesPromises = childrenResponse.data.map(child => 
          axios.get(`http://localhost:8000/api/grades/recent/${child.nin}`)
            .then(res => ({ nin: child.nin, name: child.name, grades: res.data.grades }))
            .catch(() => ({ nin: child.nin, name: child.name, grades: [] }))
        );

        const attendancePromises = childrenResponse.data.map(child =>
          axios.get(`http://localhost:8000/api/attendance/recent/${child.nin}`)
            .then(res => ({ nin: child.nin, name: child.name, attendances: res.data.attendances }))
            .catch(() => ({ nin: child.nin, name: child.name, attendances: [] }))
        );

        const [gradesResults, attendanceResults] = await Promise.all([
          Promise.all(gradesPromises),
          Promise.all(attendancePromises)
        ]);

        setChildrenGrades(gradesResults.reduce((acc, curr) => ({
          ...acc,
          [curr.nin]: { name: curr.name, grades: curr.grades || [] }
        }), {}));

        setChildrenAttendances(attendanceResults.reduce((acc, curr) => ({
          ...acc,
          [curr.nin]: { name: curr.name, attendances: curr.attendances || [] }
        }), {}));
      }

      const summaryResponse = await axios.get(
        `http://localhost:8000/api/get-parent-payment-summary`,
        { params: { user: JSON.stringify(user) } }
      );
      setSummary(summaryResponse.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-800";
      case "B": return "bg-blue-100 text-blue-800";
      case "C": return "bg-yellow-100 text-yellow-800";
      case "D": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-800";
      case "Absent": return "bg-red-100 text-red-800";
      case "Late": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 sm:w-64 bg-orange-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Guardian Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">GD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/guardiandb" className="flex items-center space-x-2">
                <FaUserGraduate className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/gpayment" className="flex items-center space-x-2">
                <FaMoneyCheck className="text-xl" />
                <span className="hidden sm:block">Payment</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/ggrades" className="flex items-center space-x-2">
                <FaChartLine className="text-xl" />
                <span className="hidden sm:block">Grades</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/gattendance" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Attendance</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/gtimetable" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/gevent" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Events</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 relative flex justify-center sm:justify-start">
              <Link to="/gemails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 relative flex justify-center sm:justify-start">
              <Link to="/gnotification" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
              <Link to="/geditprofile" className="flex items-center space-x-2">
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

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Guardian Dashboard</h2>
          <p className="text-lg text-gray-600 mt-2">
            {children && children.length === 1
              ? `Tracking ${children[0]?.name || 'your child'} Progress`
              : children && children.length > 1
              ? `Managing ${children.length} Students`
              : "Loading your dashboard..."}
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-lg"
            >
              <div 
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => toggleSection('payment')}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  Financial Overview
                </h2>
                {expandedSection.payment ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </div>

              <AnimatePresence>
                {expandedSection.payment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    {summary ? (
                      <div className={`grid gap-6 ${
                        children.length === 1 
                          ? "grid-cols-1"
                          : children.length === 2
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      }`}>
                        {summary.children.map((child, index) => (
                          <motion.div
                            key={child.nin}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md"
                          >
                            <div className="flex items-center mb-4">
                              <div className="bg-orange-100 p-3 rounded-lg mr-3">
                                <FaUserGraduate className="text-orange-600 text-xl" />
                              </div>
                              <h3 className="text-lg font-semibold">{child.name}</h3>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Paid</span>
                                <span className="font-medium text-green-600">
                                  ${child.total_paid.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Amount Due</span>
                                <span className="font-medium text-red-600">
                                  ${child.amount_due.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Status</span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    child.amount_due > 0
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {child.amount_due > 0 ? "Payment Due" : "Paid in Full"}
                                </span>
                              </div>
                            </div>
                            <Link
                              to="/gpayment"
                              className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-800"
                            >
                              View details
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No payment information available
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-lg"
            >
              <div 
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => toggleSection('grades')}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  Academic Performance
                </h2>
                {expandedSection.grades ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </div>

              <AnimatePresence>
                {expandedSection.grades && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    {children.length > 0 ? (
                      <div className={`grid gap-6 ${
                        children.length === 1
                          ? "grid-cols-1"
                          : "grid-cols-1 md:grid-cols-2"
                      }`}>
                        {children.map((child, index) => (
                          <motion.div
                            key={`grades-${child.nin}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md"
                          >
                            <div className="flex items-center mb-4">
                              <div className="bg-blue-100 p-3 rounded-lg mr-3">
                                <FaChartLine className="text-blue-600 text-xl" />
                              </div>
                              <h3 className="text-lg font-semibold">
                                {childrenGrades[child.nin]?.name || child.name} Grades
                              </h3>
                            </div>
                            {childrenGrades[child.nin]?.grades?.length > 0 ? (
                              <div className="space-y-3">
                                {childrenGrades[child.nin].grades.map(
                                  (grade, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-700">
                                          {grade.subject}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {grade.class}
                                        </p>
                                      </div>
                                      <div className="flex items-center">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(
                                            grade.grade
                                          )}`}
                                        >
                                          {grade.grade}
                                        </span>
                                      </div>
                                    </motion.div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                No grades available for this period
                              </div>
                            )}
                            <Link
                              to="/ggrades"
                              className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-800"
                            >
                              View all grades
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No student information available
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-lg"
            >
              <div 
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => toggleSection('attendance')}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  Attendance Records
                </h2>
                {expandedSection.attendance ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </div>

              <AnimatePresence>
                {expandedSection.attendance && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    {children.length > 0 ? (
                      <div className={`grid gap-6 ${
                        children.length === 1
                          ? "grid-cols-1"
                          : "grid-cols-1 md:grid-cols-2"
                      }`}>
                        {children.map((child, index) => (
                          <motion.div
                            key={`attendance-${child.nin}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md"
                          >
                            <div className="flex items-center mb-4">
                              <div className="bg-green-100 p-3 rounded-lg mr-3">
                                <FaCalendarAlt className="text-green-600 text-xl" />
                              </div>
                              <h3 className="text-lg font-semibold">
                                {childrenAttendances[child.nin]?.name || child.name} Attendance
                              </h3>
                            </div>
                            {childrenAttendances[child.nin]?.attendances?.length > 0 ? (
                              <div className="space-y-3">
                                {childrenAttendances[child.nin].attendances.map(
                                  (attendance, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-700">
                                          {new Date(
                                            attendance.created_at
                                          ).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {attendance.class}
                                        </p>
                                        {attendance.notes && (
                                          <p className="text-xs text-gray-400 mt-1">
                                            Note: {attendance.notes}
                                          </p>
                                        )}
                                      </div>
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceColor(
                                          attendance.status
                                        )}`}
                                      >
                                        {attendance.status}
                                      </span>
                                    </motion.div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                No attendance records for this period
                              </div>
                            )}
                            <Link
                              to="/gattendance"
                              className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-800"
                            >
                              View all attendance
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No student information available
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Guardiandb;