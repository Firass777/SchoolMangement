import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt, FaChartLine, FaBook, FaSignOutAlt, FaClipboardList, FaBell, FaEnvelope, FaPaperPlane, FaSearch, FaClock, FaIdCard } from 'react-icons/fa';

const TEmails = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [to, setTo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('inbox');
  const [notificationCount, setNotificationCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

  const userEmail = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')).email 
    : '';

  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      if (!token || !localRole || !userEmail) {
        localStorage.removeItem("user");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "teacher") {
        setIsVerifying(false);
        fetchEmails();
        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 30000);
        return () => clearInterval(interval);
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000,
        });

        if (
          response.data.status === "success" &&
          response.data.role === "teacher" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "teacher");
          setIsVerifying(false);
          fetchEmails();
          fetchNotificationCount();
          const interval = setInterval(fetchNotificationCount, 30000);
          return () => clearInterval(interval);
        } else {
          localStorage.removeItem("user");
          sessionStorage.removeItem("verifiedRole");
          navigate("/access", { replace: true });
        }
      } catch (error) {
        console.error("Error verifying role:", error);
        localStorage.removeItem("user");
        sessionStorage.removeItem("verifiedRole");
        navigate("/access", { replace: true });
      }
    };

    verifyUserAndInitialize();
  }, [navigate, userEmail]);

  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/emails', {
        params: { email: userEmail },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const sortedEmails = response.data.emails.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setEmails(sortedEmails);
      const inboxEmails = sortedEmails.filter(email => email.to === userEmail);
      setFilteredEmails(inboxEmails);
      setMessage('');
    } catch (error) {
      setMessage('No emails found.');
      setEmails([]);
      setFilteredEmails([]);
    }
  };

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/notifications/unread-count/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
    const filtered = emails.filter(
      (email) =>
        email.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (view === 'inbox') {
      setFilteredEmails(filtered.filter(email => email.to === userEmail));
    } else {
      setFilteredEmails(filtered.filter(email => email.from === userEmail));
    }
  }, [searchQuery, emails, view, userEmail]);

  const toggleView = (viewType) => {
    setView(viewType);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/emails/send', {
        from: userEmail,
        to,
        title,
        description,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessage('Email sent successfully!');
      setShowComposeForm(false);
      setTo('');
      setTitle('');
      setDescription('');
      fetchEmails();
    } catch (error) {
      setMessage('Failed to send email.');
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 sm:w-64 bg-green-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Teacher Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">TD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teacherdb" className="flex items-center space-x-2">
                <FaChalkboardTeacher className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/ttimetable" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/attendanceform" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Attendance</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/gradesform" className="flex items-center space-x-2">
                <FaChartLine className="text-xl" />
                <span className="hidden sm:block">Grades</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/courseform" className="flex items-center space-x-2">
                <FaBook className="text-xl" />
                <span className="hidden sm:block">Courses</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teachereventview" className="flex items-center space-x-2">
                <FaClipboardList className="text-xl" />
                <span className="hidden sm:block">Events</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
              <Link to="/temails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 relative flex justify-center sm:justify-start">
              <Link to="/tnotificationview" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-green-700 flex justify-center sm:justify-start">
              <Link to="/teditprofile" className="flex items-center space-x-2">
                <FaIdCard className="text-xl" />
                <span className="hidden sm:block">Profile</span>
              </Link>
            </li>
              <li className="px-3 sm:px-6 py-3 hover:bg-red-600 flex justify-center sm:justify-start">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    localStorage.clear();
                  }}
                >
                  <FaSignOutAlt className="text-xl" />
                  <span className="hidden sm:block">Logout</span>
                </Link>
              </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{view === 'inbox' ? 'Inbox' : 'Sent'}</h2>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/3 p-4 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-bold text-gray-800">Emails</h3>
              <button
                onClick={() => setShowComposeForm(true)}
                className="flex items-center px-3 py-1 bg-green-800 text-white rounded hover:bg-green-700"
              >
                <FaPaperPlane className="mr-2" />
                <span>Compose</span>
              </button>
            </div>

            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => toggleView('inbox')}
                className={`px-3 py-1 rounded text-sm ${view === 'inbox' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Inbox
              </button>
              <button
                onClick={() => toggleView('sent')}
                className={`px-3 py-1 rounded text-sm ${view === 'sent' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Sent
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                <FaSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-1 ml-2 outline-none text-sm"
                />
              </div>
            </div>

            {message && <p className="mt-2 text-green-600 text-sm">{message}</p>}

            <div className="space-y-3 h-[calc(100vh-300px)] md:h-[calc(100vh-250px)] overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedEmail?.id === email.id ? 'border-2 border-green-600' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <h3 className="text-base font-semibold text-gray-800 truncate">{email.title}</h3>
                  <p className="text-xs text-gray-600 truncate">{view === 'inbox' ? email.from : email.to}</p>
                  <p className="text-xs text-gray-600">{new Date(email.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/3 p-4 overflow-y-auto">
            {selectedEmail ? (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-3 truncate">{selectedEmail.title}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <p className="text-gray-600 break-words">{selectedEmail.from}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To:</span>
                    <p className="text-gray-600 break-words">{selectedEmail.to}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-600">{new Date(selectedEmail.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600 mt-1">{selectedEmail.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Select an email to view details.</p>
            )}
          </div>
        </div>
      </main>

      {showComposeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Compose Email</h3>
            <form onSubmit={handleSendEmail}>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm">From:</label>
                <input
                  type="email"
                  value={userEmail}
                  className="w-full p-2 border rounded text-sm"
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm">To:</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm">Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowComposeForm(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-800 text-white rounded hover:bg-green-700 text-sm"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TEmails;