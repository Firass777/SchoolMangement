import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaChartBar, FaPaperPlane, FaUserFriends, FaEnvelope, FaSchool, FaSignOutAlt, FaClipboardList, FaBell, FaSearch, FaClock, FaFileInvoice, FaFile } from 'react-icons/fa';

const AEmails = () => {
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
  const [emailCount, setEmailCount] = useState(0);

  const userEmail = JSON.parse(localStorage.getItem('user'))?.email;

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
        initializeEmails();
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
          initializeEmails();
        } else {
          localStorage.removeItem("user"); 
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

    const initializeEmails = () => {
      fetchEmails();
      fetchEmailCount();
      const emailInterval = setInterval(fetchEmailCount, 30000);
      return () => clearInterval(emailInterval);
    };

    verifyUserAndInitialize();
  }, [navigate]);

  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/emails', {
        params: { email: userEmail },
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

  const fetchEmailCount = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/emails/unread-count/${userEmail}`
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
      const response = await axios.post('http://localhost:8000/api/emails/send', {
        from: userEmail,
        to,
        title,
        description,
      });

      setMessage('Email sent successfully!');
      setShowComposeForm(false);
      setTo('');
      setTitle('');
      setDescription('');
    } catch (error) {
      setMessage('Failed to send email.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 bg-blue-800 text-white flex-shrink-0">
        <div className="p-4 flex justify-center lg:justify-start">
          <h1 className="text-xl font-bold hidden lg:block">Admin Dashboard</h1>
          <h1 className="text-xl font-bold block lg:hidden">AD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/admindb" className="flex items-center space-x-2">
                <FaSchool className="text-xl" />
                <span className="hidden lg:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/timetableform" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden lg:block">Time-Table</span>
              </Link>
            </li>                        
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/students" className="flex items-center space-x-2">
                <FaUserGraduate className="text-xl" />
                <span className="hidden lg:block">Students</span>
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/teachers" className="flex items-center space-x-2">
                <FaChalkboardTeacher className="text-xl" />
                <span className="hidden lg:block">Teachers</span>
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/parent" className="flex items-center space-x-2">
                <FaUserFriends className="text-xl" />
                <span className="hidden lg:block">Parents</span>
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/reports" className="flex items-center space-x-2">
                <FaChartBar className="text-xl" />
                <span className="hidden lg:block">Reports</span>
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/eventform" className="flex items-center space-x-2">
                <FaClipboardList className="text-xl" />
                <span className="hidden lg:block">Event Management</span>
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/documentsform" className="flex items-center space-x-2">
                <FaFileInvoice className="text-xl" />
                <span className="hidden lg:block">Documents</span>
              </Link>
            </li>   
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/recordform" className="flex items-center space-x-2">
                <FaFile className="text-xl" />
                <span className="hidden lg:block">Student Record</span>
              </Link>
            </li>        
            <li className="px-4 py-3 hover:bg-blue-700 flex justify-center lg:justify-start">
              <Link to="/teacherrecord" className="flex items-center space-x-2">
                <FaFile className="text-xl" />
                <span className="hidden lg:block">Teacher Record</span>
              </Link>
            </li> 
            <li className="px-4 py-3 hover:bg-blue-700 relative flex justify-center lg:justify-start">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden lg:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-red-600 flex justify-center lg:justify-start">
              <Link to="/" className="flex items-center space-x-2">
                <FaSignOutAlt className="text-xl" />
                <span className="hidden lg:block">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
        </div>

        {/* Email List and Details */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Part: Email List */}
          <div className="w-full md:w-1/3 p-4 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-bold text-gray-800">Emails</h3>
              <button
                onClick={() => setShowComposeForm(true)}
                className="flex items-center px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700"
              >
                <FaPaperPlane className="mr-2" />
                <span>Compose</span>
              </button>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => toggleView('inbox')}
                className={`px-3 py-1 rounded text-sm ${view === 'inbox' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Inbox
              </button>
              <button
                onClick={() => toggleView('sent')}
                className={`px-3 py-1 rounded text-sm ${view === 'sent' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Sent
              </button>
            </div>

            {/* Search Bar */}
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

            {/* Email List Container */}
            <div className="space-y-3 h-[calc(100vh-300px)] md:h-[calc(100vh-250px)] overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedEmail?.id === email.id ? 'border-2 border-blue-600' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <h3 className="text-base font-semibold text-gray-800 truncate">{email.title}</h3>
                  <p className="text-xs text-gray-600 truncate">{email.from}</p>
                  <p className="text-xs text-gray-600">{new Date(email.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Part: Email Details */}
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

      {/* Compose Form */}
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
                  className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 text-sm"
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

export default AEmails;