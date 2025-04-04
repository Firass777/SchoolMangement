import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaChartBar, FaPaperPlane, FaCog, FaEnvelope, FaSchool, FaSignOutAlt, FaClipboardList, FaBell, FaSearch, FaClock, FaFileInvoice, FaFile } from 'react-icons/fa';

const AEmails = () => {
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

  const userEmail = JSON.parse(localStorage.getItem('user')).email;

  // Fetch emails and filter based on the default view
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/emails', {
          params: { email: userEmail },
        });

        // Sort emails by date 
        const sortedEmails = response.data.emails.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setEmails(sortedEmails);

        // Filter emails based on the default view (inbox)
        const inboxEmails = sortedEmails.filter(email => email.to === userEmail);
        setFilteredEmails(inboxEmails); // Set filtered emails to inbox emails by default

        setMessage('');
      } catch (error) {
        setMessage('No emails found.');
        setEmails([]);
        setFilteredEmails([]);
      }
    };
    
    fetchEmails();
    fetchEmailCount();
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => clearInterval(emailInterval);
  }, [userEmail]);

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

  // Handle search
  useEffect(() => {
    const filtered = emails.filter(
      (email) =>
        email.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply view filter on top of search results
    if (view === 'inbox') {
      setFilteredEmails(filtered.filter(email => email.to === userEmail));
    } else {
      setFilteredEmails(filtered.filter(email => email.from === userEmail));
    }
  }, [searchQuery, emails, view, userEmail]);

  // Toggle between inbox and sent views
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
    <div className="flex h-screen bg-gray-100">
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Inbox</h2>
        </div>

        {/* Email List and Details */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Part: Email List */}
          <div className="w-1/3 p-6 border-r border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Emails</h3>
              <button
                onClick={() => setShowComposeForm(true)}
                className="flex items-center px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
              >
                <FaPaperPlane className="mr-2" />
                <span>Compose</span>
              </button>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => toggleView('inbox')}
                className={`px-4 py-2 rounded ${view === 'inbox' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Inbox
              </button>
              <button
                onClick={() => toggleView('sent')}
                className={`px-4 py-2 rounded ${view === 'sent' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Sent
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                <FaSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 ml-2 outline-none"
                />
              </div>
            </div>

            {message && <p className="mt-4 text-green-600">{message}</p>}

            {/* Email List Container */}
            <div className="space-y-4 h-[calc(100vh-300px)] overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedEmail?.id === email.id ? 'border-2 border-blue-600' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <h3 className="text-lg font-semibold text-gray-800">{email.title}</h3>
                  <p className="text-sm text-gray-600">{email.from}</p>
                  <p className="text-sm text-gray-600">{new Date(email.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Part: Email Details */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {selectedEmail ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedEmail.title}</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <p className="text-gray-600">{selectedEmail.from}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To:</span>
                    <p className="text-gray-600">{selectedEmail.to}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-600">{new Date(selectedEmail.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600 mt-2">{selectedEmail.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Select an email to view details.</p>
            )}
          </div>
        </div>
      </main>

      {/* Compose Form */}
      {showComposeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Compose Email</h3>
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label className="block text-gray-700">From:</label>
                <input
                  type="email"
                  value={userEmail}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">To:</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full p-2 border rounded"
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
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowComposeForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
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