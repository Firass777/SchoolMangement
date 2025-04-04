import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaClipboardList, FaEnvelope, FaClock, FaIdCard, FaSearch, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const AddCourseForm = () => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const coursesPerPage = 5;

  const user = JSON.parse(localStorage.getItem('user'));
  const teacherNin = user?.nin;

  useEffect(() => {
    fetchCourses();
    fetchNotificationCount();
    fetchEmailCount();
    const notificationInterval = setInterval(fetchNotificationCount, 30000);
    const emailInterval = setInterval(fetchEmailCount, 30000);
    return () => {
      clearInterval(notificationInterval);
      clearInterval(emailInterval);
    };
  }, [teacherNin]);

  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread-count/${email}`
      );
      if (response.data) {
        setNotificationCount(response.data.count || 0);
        localStorage.setItem('notificationCount', (response.data.count || 0).toString());
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/emails/unread-count/${email}`
      );
      if (response.data) {
        setEmailCount(response.data.count || 0);
        localStorage.setItem('emailCount', (response.data.count || 0).toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/courses/teacher/${teacherNin}`);
      setCourses(response.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Failed to fetch courses.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('class', className);
    formData.append('subject', subject);
    formData.append('file', file);
    formData.append('teacher_nin', teacherNin);

    try {
      const response = await axios.post('http://localhost:8000/api/courses/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Course added successfully!');
      // Refresh the courses list after adding
      await fetchCourses();
      // Reset form
      setName('');
      setClassName('');
      setSubject('');
      setFile(null);
      setShowAddForm(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add course.');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`http://localhost:8000/api/courses/delete/${id}`);
      
      if (response.status === 200) {
        setMessage('Course deleted successfully!');
        // Optimistically update the UI by filtering out the deleted course
        setCourses(prev => prev.filter(course => course.id !== id));
      } else {
        setMessage('Failed to delete course.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses
    .filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        <aside className="w-64 bg-green-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teacherdb" className="flex items-center space-x-2">
                  <FaChalkboardTeacher />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/ttimetable" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/attendanceform" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/gradesform" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/courseform" className="flex items-center space-x-2">
                  <FaBook />
                  <span>Courses</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teachereventview" className="flex items-center space-x-2">
                  <FaClipboardList /> <span>Events</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700 relative">
                <Link to="/temails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                  {emailCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {emailCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700 relative">
                <Link to="/tnotificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-green-700">
                <Link to="/teditprofile" className="flex items-center space-x-2">
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

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Courses</h2>

          <div className="mb-6">
            <div className="flex items-center bg-white rounded-lg shadow-md p-2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 ml-2 outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-6 py-2 px-4 bg-green-800 text-white rounded hover:bg-green-700 flex items-center"
          >
            {showAddForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
            {showAddForm ? 'Hide Add Form' : 'Add New Course'}
          </button>

          {showAddForm && (
            <div className="p-6 bg-white shadow-md rounded-lg mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Course Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Class:</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Subject:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Teacher NIN:</label>
                  <input
                    type="text"
                    value={teacherNin}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Upload PDF:</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full p-2 border rounded"
                    accept=".pdf"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-green-800 text-white rounded hover:bg-green-700">
                  Add Course
                </button>
              </form>
              {message && (
                <p className={`mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Courses</h3>
            {currentCourses.length > 0 ? (
              <>
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-green-800 text-white">
                      <th className="px-4 py-2">Course Name</th>
                      <th className="px-4 py-2">Class</th>
                      <th className="px-4 py-2">Subject</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCourses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{course.name}</td>
                        <td className="px-4 py-2">{course.class}</td>
                        <td className="px-4 py-2">{course.subject}</td>
                        <td className="px-4 py-2">
                          <a
                            href={`http://localhost:8000/api/courses/download/${course.id}`}
                            className="text-green-500 hover:underline mr-2"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isDeleting}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-center mt-6">
                  {Array.from({ length: Math.ceil(filteredCourses.length / coursesPerPage) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`mx-1 px-4 py-2 rounded ${
                        currentPage === i + 1 ? 'bg-green-800 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-gray-500">No courses found.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCourseForm;