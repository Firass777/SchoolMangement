import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaChartLine, 
  FaBell, 
  FaSignOutAlt, 
  FaEnvelope, 
  FaPaperPlane, 
  FaSearch, 
  FaIdCard, 
  FaMoneyCheck, 
  FaClock 
} from 'react-icons/fa';

const GEmails = () => {
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

  const userEmail = JSON.parse(localStorage.getItem('user')).email;

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    fetchEmails();
    return () => clearInterval(interval);
  }, [userEmail]);

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread-count/${userEmail}`
      );
      if (response.data) {
        setNotificationCount(response.data.count);
        localStorage.setItem('notificationCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

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
      await axios.post('http://localhost:8000/api/emails/send', {
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
      fetchEmails();
    } catch (error) {
      setMessage('Failed to send email.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar notificationCount={notificationCount} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Inbox</h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 p-6 border-r border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Emails</h3>
              <button
                onClick={() => setShowComposeForm(true)}
                className="flex items-center px-4 py-2 bg-orange-800 text-white rounded hover:bg-orange-700"
              >
                <FaPaperPlane className="mr-2" />
                <span>Compose</span>
              </button>
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => toggleView('inbox')}
                className={`px-4 py-2 rounded ${view === 'inbox' ? 'bg-orange-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Inbox
              </button>
              <button
                onClick={() => toggleView('sent')}
                className={`px-4 py-2 rounded ${view === 'sent' ? 'bg-orange-800 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Sent
              </button>
            </div>

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

            <div className="space-y-4 h-[calc(100vh-300px)] overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedEmail?.id === email.id ? 'border-2 border-orange-600' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <h3 className="text-lg font-semibold text-gray-800">{email.title}</h3>
                  <p className="text-sm text-gray-600">{view === 'inbox' ? email.from : email.to}</p>
                  <p className="text-sm text-gray-600">{new Date(email.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

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
                    <p className="text-gray-600">{new Date(selectedEmail.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600 mt-2 whitespace-pre-line">{selectedEmail.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Select an email to view details.</p>
            )}
          </div>
        </div>
      </main>

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
                  rows="5"
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
                  className="px-4 py-2 bg-orange-800 text-white rounded hover:bg-orange-700"
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

const Sidebar = ({ notificationCount }) => (
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
          <Link to="/gtimetable" className="flex items-center space-x-2">
            <FaClock />
            <span>Time-Table</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gevent" className="flex items-center space-x-2">
            <FaCalendarAlt />
            <span>Events</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gemails" className="flex items-center space-x-2">
            <FaEnvelope />
            <span>Emails</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700 relative">
          <Link to="/gnotification" className="flex items-center space-x-2">
            <FaBell />
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
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
);

export default GEmails;