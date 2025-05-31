import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSchool,
  FaClock,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaClipboardList,
  FaFileInvoice,
  FaBell,
  FaEnvelope,
  FaUserFriends,
  FaSignOutAlt,
  FaTrash,
  FaDownload,
  FaSearch,
  FaPlus,
  FaFile,
  FaUpload,
  FaSpinner,
  FaTimes,
  FaUserTie
} from 'react-icons/fa';

const DocumentsForm = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudentNIN, setSelectedStudentNIN] = useState('');
  const [year, setYear] = useState('');
  const [inscriptionFile, setInscriptionFile] = useState(null);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [successFile, setSuccessFile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCertForm, setShowCertForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadedBy] = useState(localStorage.getItem('userName') || 'Admin');
  const [activeTab, setActiveTab] = useState('documents');
  const certificatesPerPage = 5;
  const docsPerPage = 7;
  const [docCurrentPage, setDocCurrentPage] = useState(1);
  const [emailCount, setEmailCount] = useState(0);

  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const certFormRef = useRef(null);

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
        initializeDocuments();
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
          initializeDocuments();
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

    const initializeDocuments = () => {
      fetchStudents();
      fetchCertificates();
      fetchDocuments();
      fetchEmailCount();
      const emailInterval = setInterval(fetchEmailCount, 30000);
      return () => clearInterval(emailInterval);
    };

    verifyUserAndInitialize();
  }, [navigate]);

  // Load students data
  const fetchStudents = async () => {
    try {
      const usersRes = await axios.get('http://localhost:8000/api/users');
      setStudents(usersRes.data.filter(user => user.role === 'student'));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Load certificates data
  const fetchCertificates = async () => {
    try {
      const certRes = await axios.get('http://localhost:8000/api/certificates');
      setCertificates(certRes.data.data);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  // Load documents data
  const fetchDocuments = async () => {
    try {
      const docsRes = await axios.get('http://localhost:8000/api/documents');
      processDocuments(docsRes.data.documents);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Email count
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

  const processDocuments = (docs) => {
    setDocuments(docs.map(doc => ({
      ...doc,
      prediction: doc.prediction || { status: 'processing', category: null, confidence: null }
    })));
  };

  const handleCertificateUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('student_nin', selectedStudentNIN);
    formData.append('year', year);
    if (inscriptionFile) formData.append('inscription_pdf', inscriptionFile);
    if (attendanceFile) formData.append('attendance_pdf', attendanceFile);
    if (successFile) formData.append('success_pdf', successFile);

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/certificates/upload', formData);
      setMessage({ text: 'Certificates uploaded successfully!', type: 'success' });
      setShowCertForm(false);
      setSelectedStudentNIN('');
      setYear('');
      setInscriptionFile(null);
      setAttendanceFile(null);
      setSuccessFile(null);
      certFormRef.current.reset();
      const updatedCertificates = await axios.get('http://localhost:8000/api/certificates');
      setCertificates(updatedCertificates.data.data);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Please select a file', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('uploaded_by', uploadedBy);

      await axios.post('http://localhost:8000/api/documents', formData);
      setMessage({ text: 'Document uploaded successfully!', type: 'success' });
      setFile(null);
      setShowDocForm(false);
      fileInputRef.current.value = '';
      fetchDocuments();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/certificates/delete/${id}`);
      setMessage({ text: 'Certificate deleted', type: 'success' });
      setCertificates(certificates.filter(cert => cert.id !== id));
    } catch (error) {
      setMessage({ text: 'Delete failed', type: 'error' });
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/documents/${id}`);
      setMessage({ text: 'Document deleted', type: 'success' });
      fetchDocuments();
    } catch (error) {
      setMessage({ text: 'Delete failed', type: 'error' });
    }
  };

  const renderStatusBadge = (doc) => {
    const status = doc.prediction?.confidence === 0 ? 'uncertain' : 
                 doc.prediction?.status || 'processing';
    const confidence = doc.prediction?.confidence;
    const category = doc.prediction?.category;

    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status.toLowerCase()) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1">
            <span className={`${baseClasses} bg-green-100 text-green-800`}>
              {category}
            </span>
            <span className="text-sm text-gray-600">
              ({Math.round(confidence)}%)
            </span>
          </div>
        );
      case 'pending':
      case 'uncertain':  
        return (
          <div className="flex items-center gap-1">
            <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
              {status === 'uncertain' ? 'Uncertain' : 'Needs Review'}
            </span>
            <span className="text-sm text-gray-600">
              ({Math.round(confidence)}%)
            </span>
          </div>
        );
      default:
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Processing...
          </span>
        );
    }
  };

  const filteredCertificates = certificates.filter(
    cert => cert.student_nin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.prediction?.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = filteredCertificates.slice(indexOfFirstCertificate, indexOfLastCertificate);

  const indexOfLastDoc = docCurrentPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const paginateDocs = (pageNumber) => setDocCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
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
                  <span className="absolute top-1 right-1 sm:right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
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

      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
            <div className="flex gap-1 bg-white p-1 rounded-full shadow-md w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`flex-1 sm:flex-none px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === 'certificates' 
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 sm:flex-none px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === 'documents'
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Document Classification
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 border-l-4 border-red-500' 
                : 'bg-green-100 text-green-700 border-l-4 border-green-500'
            }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'certificates' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <button
                  onClick={() => setShowCertForm(!showCertForm)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                >
                  {showCertForm ? <FaTimes /> : <FaPlus />}
                  {showCertForm ? 'Close Form' : 'Add Certificates'}
                </button>
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {showCertForm && (
                <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100">
                  <form ref={certFormRef} onSubmit={handleCertificateUpload} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student:</label>
                      <select
                        value={selectedStudentNIN}
                        onChange={(e) => setSelectedStudentNIN(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select student</option>
                        {students.map((student) => (
                          <option key={student.nin} value={student.nin}>
                            {student.name} ({student.nin})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year:</label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter year"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inscription PDF:</label>
                      <input
                        type="file"
                        onChange={(e) => setInscriptionFile(e.target.files[0])}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        accept=".pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attendance PDF:</label>
                      <input
                        type="file"
                        onChange={(e) => setAttendanceFile(e.target.files[0])}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        accept=".pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Success PDF:</label>
                      <input
                        type="file"
                        onChange={(e) => setSuccessFile(e.target.files[0])}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        accept=".pdf"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Upload Certificates'}
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm">Student NIN</th>
                        <th className="px-4 py-2 text-left text-sm">Year</th>
                        <th className="px-4 py-2 text-center text-sm">Inscription</th>
                        <th className="px-4 py-2 text-center text-sm">Attendance</th>
                        <th className="px-4 py-2 text-center text-sm">Success</th>
                        <th className="px-4 py-2 text-center text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCertificates.length > 0 ? (
                        currentCertificates.map((cert) => (
                          <tr key={cert.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{cert.student_nin}</td>
                            <td className="px-4 py-3 text-sm">{cert.year}</td>
                            <td className="px-4 py-3 text-center">
                              {cert.inscription_pdf && (
                                <a
                                  href={`http://localhost:8000/storage/${cert.inscription_pdf}`}
                                  download
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaDownload />
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {cert.attendance_pdf && (
                                <a
                                  href={`http://localhost:8000/storage/${cert.attendance_pdf}`}
                                  download
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaDownload />
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {cert.success_pdf && (
                                <a
                                  href={`http://localhost:8000/storage/${cert.success_pdf}`}
                                  download
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaDownload />
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDeleteCertificate(cert.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-gray-500 text-sm">
                            No certificates found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredCertificates.length > certificatesPerPage && (
                <div className="mt-4 flex justify-center space-x-2">
                  {Array.from({ length: Math.ceil(filteredCertificates.length / certificatesPerPage) }).map(
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-800 border border-blue-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDocForm(!showDocForm)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showDocForm ? <FaTimes /> : <FaUpload />}
                  {showDocForm ? 'Close Form' : 'Upload Document'}
                </button>
              </div>

              {showDocForm && (
                <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100">
                  <form ref={formRef} onSubmit={handleDocumentUpload} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uploader: <span className="font-semibold">{uploadedBy}</span>
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        accept=".pdf"
                        ref={fileInputRef}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Upload Document'}
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg font-semibold">
                    Document Classification{' '}
                    <span className="text-sm font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                      [IA-Powered]
                    </span>
                  </h2>
                
                  <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="p-3 text-left text-sm">File Name</th>
                        <th className="p-3 text-left text-sm">Status</th>
                        <th className="p-3 text-left text-sm">Uploaded By</th>
                        <th className="p-3 text-left text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentDocuments.length > 0 ? (
                        currentDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="p-3 max-w-xs truncate text-sm">{doc.file_name}</td>
                            <td className="p-3 text-sm">
                              {renderStatusBadge(doc)}
                            </td>
                            <td className="p-3 text-sm">{doc.uploaded_by}</td>
                            <td className="p-3">
                              <div className="flex space-x-4">
                                <a
                                  href={`http://localhost:8000/api/documents/${doc.id}/download`}
                                  className="text-blue-600 hover:text-blue-800"
                                  download
                                >
                                  <FaDownload />
                                </a>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">
                            No documents found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredDocuments.length > docsPerPage && (
                  <div className="mt-4 flex justify-center space-x-2">
                    {Array.from({ length: Math.ceil(filteredDocuments.length / docsPerPage) }).map(
                      (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => paginateDocs(index + 1)}
                          className={`px-3 py-1 rounded text-sm ${
                            docCurrentPage === index + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-blue-800 border border-blue-200'
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsForm;