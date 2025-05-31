import React, { useState, useEffect } from 'react';
import { FaBell, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher,FaUserTie , FaSchool, FaChartBar, FaClipboardList, FaEnvelope, FaUserFriends, FaClock, FaFileInvoice, FaFile } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationForm = () => {
  const navigate = useNavigate();
  const [to, setTo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [emailCount, setEmailCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Role verification and initialization
  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      // Immediate redirect if no token or local role
      if (!token || !localRole) {
        localStorage.removeItem("user"); // Clear localStorage user data 
        navigate("/access", { replace: true });
        return;
      }

      // Check if role is already verified in session storage
      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "admin") {
        initializeNotifications();
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000, 
        });

        if (
          response.data.status === "success" &&
          response.data.role === "admin" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "admin"); 
          initializeNotifications();
        } else {
          localStorage.removeItem("user"); // Clear localStorage user data 
          sessionStorage.removeItem("verifiedRole"); 
          navigate("/access", { replace: true });
        }
      } catch (error) {
        console.error("Error verifying role:", error);
        localStorage.removeItem("user"); // Clear localStorage user data 
        sessionStorage.removeItem("verifiedRole"); 
        navigate("/access", { replace: true });
      }
    };

    const initializeNotifications = () => {
      fetchEmailCount();
      const emailInterval = setInterval(fetchEmailCount, 30000);
      return () => clearInterval(emailInterval);
    };

    verifyUserAndInitialize();
  }, [navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/notification/send', {
        to,
        title,
        description,
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setTo('');
        setTitle('');
        setDescription('');
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Failed to send notification.');
      } else if (error.request) {
        setError('No response from the server. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-16 sm:w-64 bg-blue-800 text-white flex-shrink-0">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Admin Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">AD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/admindb" className="flex items-center space-x-2">
                <FaSchool className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/timetableform" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>  
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/admins" className="flex items-center space-x-2">
                <FaUserTie className="text-xl" />
                <span className="hidden sm:block">Admins</span>
              </Link>
            </li>                      
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/students" className="flex items-center space-x-2">
                <FaUserGraduate className="text-xl" />
                <span className="hidden sm:block">Students</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/teachers" className="flex items-center space-x-2">
                <FaChalkboardTeacher className="text-xl" />
                <span className="hidden sm:block">Teachers</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/parent" className="flex items-center space-x-2">
                <FaUserFriends className="text-xl" />
                <span className="hidden sm:block">Parents</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/reports" className="flex items-center space-x-2">
                <FaChartBar className="text-xl" />
                <span className="hidden sm:block">Reports</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/eventform" className="flex items-center space-x-2">
                <FaClipboardList className="text-xl" />
                <span className="hidden sm:block">Event Management</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/documentsform" className="flex items-center space-x-2">
                <FaFileInvoice className="text-xl" />
                <span className="hidden sm:block">Documents</span>
              </Link>
            </li>   
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/recordform" className="flex items-center space-x-2">
                <FaFile className="text-xl" />
                <span className="hidden sm:block">Student Record</span>
              </Link>
            </li>        
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/teacherrecord" className="flex items-center space-x-2">
                <FaFile className="text-xl" />
                <span className="hidden sm:block">Teacher Record</span>
              </Link>
            </li> 
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 flex justify-center sm:justify-start">
              <Link to="/notificationform" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-blue-700 relative flex justify-center sm:justify-start">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
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

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Notification Center</h1>
            <p className="text-gray-600">Send important updates and announcements to users</p>
          </div>

          {isSuccess && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Notification sent successfully!</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Create New Notification</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address or 'all' for all users"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Use 'all' to send to all users</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notification title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="5"
                    placeholder="Write your notification message here..."
                    required
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send Notification
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationForm;