import React, { useState, useEffect } from 'react';
import { FaBell, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher, FaSchool, FaChartBar, FaClipboardList, FaEnvelope, FaCog, FaClock, FaFileInvoice, FaFile } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NotificationForm = () => {
  const [to, setTo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    fetchEmailCount();
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => clearInterval(emailInterval);
  }, []);

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
        alert('Notification sent successfully!');
        setTo('');
        setTitle('');
        setDescription('');
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
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/admindb" className="flex items-center space-x-2">
                  <FaSchool />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/timetableform" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
                </Link>
              </li>              
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/students" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Students</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/teachers" className="flex items-center space-x-2">
                  <FaChalkboardTeacher />
                  <span>Teachers</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/reports" className="flex items-center space-x-2">
                  <FaChartBar />
                  <span>Reports</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/eventform" className="flex items-center space-x-2">
                  <FaClipboardList />
                  <span>Event Management</span>
                </Link>
              </li>
             <li className="px-6 py-3 hover:bg-blue-700">
               <Link to="/documentsform" className="flex items-center space-x-2">
                 <FaFileInvoice />
                 <span>Documents</span>
               </Link>
             </li>    
            <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/recordform" className="flex items-center space-x-2">
                  <FaFile />
                  <span>Student Record</span>
                </Link>
            </li>       
            <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/teacherrecord" className="flex items-center space-x-2">
                  <FaFile />
                  <span>Teacher Record</span>
                </Link>
              </li>                    
              <li className="px-6 py-3 hover:bg-blue-700">
                <Link to="/notificationform" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-blue-700 relative">
                <Link to="/aemails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Send Notification</h2>
            <p className="text-gray-600">Send a notification to students or all users.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Notification Form */}
          <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">To:</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter email or 'all'"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter description"
                  required
                />
              </div>

              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Send Notification
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationForm;