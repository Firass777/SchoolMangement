import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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
  FaCog,
  FaSignOutAlt,
  FaTrash,
  FaDownload,
  FaSearch,
  FaPlus,
  FaFile,
  FaUpload,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

const DocumentsForm = () => {
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

  // Load students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const usersRes = await axios.get('http://localhost:8000/api/users');
        setStudents(usersRes.data.filter(user => user.role === 'student'));
      } catch (error) {
        console.error('Error loading students:', error);
      }
    };
    fetchStudents();
  }, []);

  // Load certificates data
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const certRes = await axios.get('http://localhost:8000/api/certificates');
        setCertificates(certRes.data.data);
      } catch (error) {
        console.error('Error loading certificates:', error);
      }
    };
    fetchCertificates();
  }, []);

  // Load documents data
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docsRes = await axios.get('http://localhost:8000/api/documents');
        processDocuments(docsRes.data.documents);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  // Email count
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

  const processDocuments = (docs) => {
    setDocuments(docs.map(doc => ({
      ...doc,
      prediction: doc.prediction || { status: 'processing', category: null, confidence: null }
    })));
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/documents');
      processDocuments(response.data.documents);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
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
    <div className="flex h-screen bg-gray-100">
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
            <li className="px-6 py-3 bg-blue-700">
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

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Document Management</h1>
            <div className="flex gap-1 bg-white p-1 rounded-full shadow-md">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  activeTab === 'certificates' 
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
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
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 border-l-4 border-red-500' 
                : 'bg-green-100 text-green-700 border-l-4 border-green-500'
            }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'certificates' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowCertForm(!showCertForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showCertForm ? <FaTimes /> : <FaPlus />}
                  {showCertForm ? 'Close Form' : 'Add Certificates'}
                </button>
                <div className="relative w-64">
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
                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                  <form ref={certFormRef} onSubmit={handleCertificateUpload} className="space-y-4">
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
                <table className="w-full">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Student NIN</th>
                      <th className="px-6 py-3 text-left">Year</th>
                      <th className="px-6 py-3 text-center">Inscription</th>
                      <th className="px-6 py-3 text-center">Attendance</th>
                      <th className="px-6 py-3 text-center">Success</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCertificates.length > 0 ? (
                      currentCertificates.map((cert) => (
                        <tr key={cert.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">{cert.student_nin}</td>
                          <td className="px-6 py-4">{cert.year}</td>
                          <td className="px-6 py-4 text-center">
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
                          <td className="px-6 py-4 text-center">
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
                          <td className="px-6 py-4 text-center">
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
                          <td className="px-6 py-4 text-center">
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
                        <td colSpan="6" className="p-4 text-center text-gray-500">
                          No certificates found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredCertificates.length > certificatesPerPage && (
                <div className="mt-4 flex justify-center space-x-2">
                  {Array.from({ length: Math.ceil(filteredCertificates.length / certificatesPerPage) }).map(
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded ${
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
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDocForm(!showDocForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showDocForm ? <FaTimes /> : <FaUpload />}
                  {showDocForm ? 'Close Form' : 'Upload Document'}
                </button>
              </div>

              {showDocForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                  <form ref={formRef} onSubmit={handleDocumentUpload} className="space-y-4">
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

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Document Classification{' '}
                  <span className="text-sm font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                    [IA-Powered]
                  </span>
                </h2>
                
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-blue-800 text-white">
                      <tr>
                        <th className="p-3 text-left">File Name</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Uploaded By</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentDocuments.length > 0 ? (
                        currentDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="p-3 max-w-xs truncate">{doc.file_name}</td>
                            <td className="p-3">
                              {renderStatusBadge(doc)}
                            </td>
                            <td className="p-3">{doc.uploaded_by}</td>
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
                          <td colSpan="4" className="p-4 text-center text-gray-500">
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
                          className={`px-3 py-1 rounded ${
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