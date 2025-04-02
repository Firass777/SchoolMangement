import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaSignOutAlt,
  FaBook,
  FaMoneyCheck,
  FaEnvelope,
  FaClock,
  FaIdCard,
  FaFileInvoice,
} from 'react-icons/fa';

const Documents = () => {
  const [certificates, setCertificates] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));
  const studentNIN = user.nin;

  // Fetch notification count
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

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  console.log('Logged-in Student NIN:', studentNIN); 

  // Fetch certificates for the logged-in student
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/certificates');
        console.log('API Response:', response.data); 

        // Filter certificates for the logged-in student
        const studentCertificates = response.data.data.filter(
          (cert) => cert.student_nin === studentNIN
        );

        setCertificates(studentCertificates);
        console.log('Certificates State:', studentCertificates); 
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };
    fetchCertificates();
  }, [studentNIN]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/studentdb" className="flex items-center space-x-2">
                <FaUserGraduate /> <span>Dashboard</span>
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
                <FaClock /> <span>Time-Table</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/gradesview" className="flex items-center space-x-2">
                <FaChartLine /> <span>Grades</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/attendanceview" className="flex items-center space-x-2">
                <FaCalendarAlt /> <span>Attendance</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/courseview" className="flex items-center space-x-2">
                <FaBook /> <span>Courses</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/studenteventview" className="flex items-center space-x-2">
                <FaCalendarAlt /> <span>Events</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/semails" className="flex items-center space-x-2">
                <FaEnvelope /> <span>Emails</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/documents" className="flex items-center space-x-2">
                <FaFileInvoice /> <span>Documents</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700 relative">
              <Link to="/notificationview" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-purple-700">
              <Link to="/seditprofile" className="flex items-center space-x-2">
                <FaIdCard /> <span>Profile</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-red-600">
              <Link to="/" className="flex items-center space-x-2">
                <FaSignOutAlt /> <span>Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">My Certificates</h2>

          {/* Certificates List */}
          {certificates.length > 0 ? (
            <div className="space-y-6">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-semibold text-purple-800 mb-4">Year: {cert.year}</h3>
                  <div className="space-y-4">
                    {cert.inscription_pdf && (
                      <a
                        href={`http://localhost:8000/storage/${cert.inscription_pdf}`}
                        download
                        className="block py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between"
                      >
                        <span>Inscription Certificate</span>
                        <span className="text-sm">Download</span>
                      </a>
                    )}
                    {cert.attendance_pdf && (
                      <a
                        href={`http://localhost:8000/storage/${cert.attendance_pdf}`}
                        download
                        className="block py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-between"
                      >
                        <span>Attendance Certificate</span>
                        <span className="text-sm">Download</span>
                      </a>
                    )}
                    {cert.success_pdf && (
                      <a
                        href={`http://localhost:8000/storage/${cert.success_pdf}`}
                        download
                        className="block py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-between"
                      >
                        <span>Success Certificate</span>
                        <span className="text-sm">Download</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No certificates found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Documents;