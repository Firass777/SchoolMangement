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
} from 'react-icons/fa';

const DocumentsForm = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentNIN, setSelectedStudentNIN] = useState('');
  const [year, setYear] = useState('');
  const [inscriptionFile, setInscriptionFile] = useState(null);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [successFile, setSuccessFile] = useState(null);
  const [message, setMessage] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false); 
  const certificatesPerPage = 5;

  // Refs for file inputs
  const inscriptionFileRef = useRef(null);
  const attendanceFileRef = useRef(null);
  const successFileRef = useRef(null);

  // Fetch all students with the role 'student'
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users');
        const studentsData = response.data.filter((user) => user.role === 'student');
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  // Fetch all certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/certificates');
        setCertificates(response.data.data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };
    fetchCertificates();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('student_nin', selectedStudentNIN);
    formData.append('year', year);
    if (inscriptionFile) formData.append('inscription_pdf', inscriptionFile);
    if (attendanceFile) formData.append('attendance_pdf', attendanceFile);
    if (successFile) formData.append('success_pdf', successFile);

    try {
      const response = await axios.post('http://localhost:8000/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Certificates uploaded successfully!');
      setShowForm(false); // Hide the form after submission

      // Reset form fields
      setSelectedStudentNIN('');
      setYear('');
      setInscriptionFile(null);
      setAttendanceFile(null);
      setSuccessFile(null);

      // Reset file inputs
      if (inscriptionFileRef.current) inscriptionFileRef.current.value = '';
      if (attendanceFileRef.current) attendanceFileRef.current.value = '';
      if (successFileRef.current) successFileRef.current.value = '';

      // Refresh the certificates list
      const updatedCertificates = await axios.get('http://localhost:8000/api/certificates');
      setCertificates(updatedCertificates.data.data);
    } catch (error) {
      setMessage('Failed to upload certificates.');
      console.error('Error:', error);
    }
  };

  // Handle delete certificate
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/certificates/delete/${id}`);
      setMessage('Certificate deleted successfully!');
      // Refresh the certificates list
      const updatedCertificates = await axios.get('http://localhost:8000/api/certificates');
      setCertificates(updatedCertificates.data.data);
    } catch (error) {
      setMessage('Failed to delete certificate.');
      console.error('Error:', error);
    }
  };

  // Handle search
  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.student_nin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = filteredCertificates.slice(indexOfFirstCertificate, indexOfLastCertificate);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
              <Link to="/notifications" className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/aemails" className="flex items-center space-x-2">
                <FaEnvelope />
                <span>Emails</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-blue-700">
              <Link to="/settings" className="flex items-center space-x-2">
                <FaCog />
                <span>Settings</span>
              </Link>
            </li>
            <li className="px-6 py-3 hover:bg-red-600">
              <Link to="/logout" className="flex items-center space-x-2">
                <FaSignOutAlt />
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Certificates</h1>

          {/* Toggle Form Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FaPlus />
            <span>{showForm ? 'Hide Form' : 'Add Certificates'}</span>
          </button>

          {/* Upload Form */}
          {showForm && (
            <div className="mb-8">
              <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium mb-2">Select Student:</label>
                <select
                  value={selectedStudentNIN}
                  onChange={(e) => setSelectedStudentNIN(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.nin} value={student.nin}>
                      {student.name} ({student.nin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium mb-2">Year:</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter year (e.g., 2023)"
                  required
                />
              </div>

              <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium mb-2">Inscription Certificate (PDF):</label>
                <input
                  type="file"
                  onChange={(e) => setInscriptionFile(e.target.files[0])}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf"
                  ref={inscriptionFileRef}
                />
              </div>

              <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium mb-2">Attendance Certificate (PDF):</label>
                <input
                  type="file"
                  onChange={(e) => setAttendanceFile(e.target.files[0])}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf"
                  ref={attendanceFileRef}
                />
              </div>

              <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium mb-2">Success Certificate (PDF):</label>
                <input
                  type="file"
                  onChange={(e) => setSuccessFile(e.target.files[0])}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf"
                  ref={successFileRef}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Upload Certificates
              </button>

              {message && (
                <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                  <p>{message}</p>
                </div>
              )}
            </div>
          )}

          {/* Show All Certificates */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Certificates</h2>

            {/* Search Bar */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <FaSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by student NIN or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 ml-2 outline-none"
                />
              </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="px-6 py-3">Student NIN</th>
                    <th className="px-6 py-3">Year</th>
                    <th className="px-6 py-3">Inscription</th>
                    <th className="px-6 py-3">Attendance</th>
                    <th className="px-6 py-3">Success</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCertificates.map((cert) => (
                    <tr key={cert.id} className="border-b hover:bg-gray-100">
                      <td className="px-6 py-4">{cert.student_nin}</td>
                      <td className="px-6 py-4">{cert.year}</td>
                      <td className="px-6 py-4 text-center">
                        {cert.inscription_pdf && (
                          <a
                            href={`http://localhost:8000/storage/${cert.inscription_pdf}`}
                            download
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaDownload className="inline-block" />
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
                            <FaDownload className="inline-block" />
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
                            <FaDownload className="inline-block" />
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredCertificates.length > certificatesPerPage && (
              <div className="mt-6 flex justify-center space-x-2">
                {Array.from({ length: Math.ceil(filteredCertificates.length / certificatesPerPage) }).map(
                  (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 ${
                        currentPage === index + 1
                          ? 'bg-blue-800 text-white'
                          : 'bg-white text-blue-800'
                      } rounded-lg shadow-md hover:shadow-lg transition-shadow`}
                    >
                      {index + 1}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentsForm;