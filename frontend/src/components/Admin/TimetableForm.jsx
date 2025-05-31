import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaChartBar,
  FaEnvelope,
  FaUserFriends,
  FaSignOutAlt,
  FaBell,
  FaSchool,
  FaClipboardList,
  FaClock,
  FaFileInvoice,
  FaFile,
  FaPlus,
  FaFilter,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaSearch,
  FaTimes,
  FaList,
  FaUserTie
} from "react-icons/fa";
import axios from "axios";

function TimetableForm() {
  const [formData, setFormData] = useState({
    type: "student",
    class: "",
    teacher_email: "",
    day: "",
    subject: "",
    time: "",
    location: "",
  });

  const navigate = useNavigate();
  const [timetableData, setTimetableData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ type: "student", value: "" });
  const [editId, setEditId] = useState(null);
  const [emailCount, setEmailCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeTab, setActiveTab] = useState("visual"); 
  const [isVerifying, setIsVerifying] = useState(true);
  const formRef = useRef(null);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = [
    "08:30 - 10:00 AM",
    "10:05 - 11:35 AM",
    "12:00 - 13:30 PM",
    "13:35 - 15:00 PM",
    "15:05 - 17:00 PM",
  ];

  useEffect(() => {
    const verifyUserAndInitialize = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const localRole = userData?.role;

      if (!token || !localRole) {
        localStorage.removeItem("user");
        navigate("/access", { replace: true });
        return;
      }

      const cachedRole = sessionStorage.getItem("verifiedRole");
      if (cachedRole === "admin") {
        setIsVerifying(false);
        if (filter.value) {
          fetchTimetable();
        }
        fetchEmailCount();
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
          setIsVerifying(false);
          if (filter.value) {
            fetchTimetable();
          }
          fetchEmailCount();
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

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filter, navigate]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchEmailCount = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const email = userData?.email;
    
    if (!email) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/emails/unread-count/${email}`
      );
      const data = await response.json();
      if (data) {
        setEmailCount(data.count);
        localStorage.setItem('emailCount', data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editId ? 
      (formData.type === "student" ? `/api/student-timetable/update/${editId}` : `/api/teacher-timetable/update/${editId}`) :
      (formData.type === "student" ? "/api/student-timetable/add" : "/api/teacher-timetable/add");
    const method = editId ? "PUT" : "POST";
    try {
      const response = await axios({
        method,
        url: `http://127.0.0.1:8000${endpoint}`,
        headers: { "Content-Type": "application/json" },
        data: formData,
      });
      
      const event = new CustomEvent('showToast', {
        detail: {
          message: response.data.message,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
      
      fetchTimetable();
      setEditId(null);
      setFormData({
        type: "student",
        class: "",
        teacher_email: "",
        day: "",
        subject: "",
        time: "",
        location: "",
      });
      setShowForm(false);
    } catch (error) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: error.response?.data?.message || "Failed to submit timetable entry",
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  };

  const fetchTimetable = async () => {
    try {
      const endpoint = filter.type === "student" ? `/api/student-timetable/${filter.value}` : `/api/teacher-timetable/${filter.value}`;
      const response = await axios.get(`http://127.0.0.1:8000${endpoint}`);
      setTimetableData(response.data);
    } catch (error) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: "Failed to fetch timetable data",
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await customConfirm(
      "Delete Timetable Entry",
      "Are you sure you want to delete this timetable entry?",
      "Delete",
      "Cancel"
    );
    
    if (confirmDelete) {
      try {
        const endpoint = filter.type === "student" ? `/api/student-timetable/delete/${id}` : `/api/teacher-timetable/delete/${id}`;
        const response = await axios.delete(`http://127.0.0.1:8000${endpoint}`);
        
        const event = new CustomEvent('showToast', {
          detail: {
            message: response.data.message,
            type: 'success'
          }
        });
        window.dispatchEvent(event);
        
        fetchTimetable();
      } catch (error) {
        const event = new CustomEvent('showToast', {
          detail: {
            message: "Failed to delete entry",
            type: 'error'
          }
        });
        window.dispatchEvent(event);
      }
    }
  };

  const customConfirm = async (title, message, confirmText, cancelText) => {
    return new Promise(resolve => {
      const event = new CustomEvent('showConfirmation', {
        detail: {
          title,
          message,
          confirmText,
          cancelText,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        }
      });
      window.dispatchEvent(event);
    });
  };

  const handleEdit = (entry) => {
    setFormData({
      type: filter.type,
      class: entry.class || "",
      teacher_email: entry.teacher_email || "",
      day: entry.day,
      subject: entry.subject,
      time: entry.time,
      location: entry.location,
    });
    setEditId(entry.id);
    setShowForm(true);
    scrollToForm();
  };

  const groupTimetableData = () => {
    const grouped = {};
    
    daysOfWeek.forEach(day => {
      grouped[day] = {};
      timeSlots.forEach(time => {
        grouped[day][time] = [];
      });
    });

    timetableData.forEach(entry => {
      if (grouped[entry.day] && grouped[entry.day][entry.time]) {
        grouped[entry.day][entry.time].push(entry);
      }
    });

    return grouped;
  };

  const groupedTimetable = groupTimetableData();

  const subjectColors = {
    "Math": "bg-indigo-100 border-indigo-300 text-indigo-800",
    "French": "bg-emerald-100 border-emerald-300 text-emerald-800",
    "English": "bg-amber-100 border-amber-300 text-amber-800",
    "IoT": "bg-rose-100 border-rose-300 text-rose-800",
    "React": "bg-blue-100 border-blue-300 text-blue-800",
    "default": "bg-gray-100 border-gray-300 text-gray-800"
  };

  const getSubjectColor = (subject) => {
    const baseSubject = subject.split(' ')[0]; 
    return subjectColors[baseSubject] || subjectColors.default;
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-16 sm:w-64 bg-blue-800 text-white flex flex-col transition-all duration-300">
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Timetable Management</h1>
              <p className="text-gray-600 mt-1">
                {editId ? "Edit existing timetable entry" : "Create and manage class schedules"}
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (editId) {
                  setEditId(null);
                  setFormData({
                    type: "student",
                    class: "",
                    teacher_email: "",
                    day: "",
                    subject: "",
                    time: "",
                    location: "",
                  });
                }
                if (!showForm) {
                  scrollToForm();
                }
              }}
              className="mt-4 md:mt-0 flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaPlus className="mr-2" />
              {showForm ? "Cancel" : "Add New Entry"}
            </button>
          </div>

          {/* Form Section */}
          {showForm && (
            <div 
              ref={formRef} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-300 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaClock className="text-blue-600 mr-2" />
                {editId ? "Edit Timetable Entry" : "Create New Timetable Entry"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {formData.type === "student" ? (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Class</label>
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="e.g., Class 10A"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Teacher Email</label>
                      <input
                        type="email"
                        value={formData.teacher_email}
                        onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="teacher@example.com"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Day</label>
                    <div className="relative">
                      <select
                        value={formData.day}
                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="" disabled>Select a day</option>
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="e.g., Mathematics"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                    <div className="relative">
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="" disabled>Select a time slot</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="e.g., Room 101"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {editId ? "Update Entry" : "Create Entry"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaFilter className="text-blue-600 mr-2" />
              Filter Timetable
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => setFilter({ ...filter, value: e.target.value })}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={filter.type === "student" ? "Search by class (e.g., 10A)" : "Search by teacher email"}
                />
                {filter.value && (
                  <button
                    onClick={() => setFilter({ ...filter, value: "" })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaTimes className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <div className="w-full md:w-auto">
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="student">Student Timetable</option>
                  <option value="teacher">Teacher Timetable</option>
                </select>
              </div>
              <button
                onClick={fetchTimetable}
                className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "visual" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaClock className="mr-2" />
              Visual Timetable
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "list" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaList className="mr-2" />
              List View
            </button>
          </div>

          {/* Timetable Visualization Section */}
          {activeTab === "visual" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6">
                {timetableData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                      <FaClock className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      {filter.value ? "No timetable entries found" : "No data to display"}
                    </h3>
                    <p className="mt-1 text-gray-500">
                      {filter.value ? "Try adjusting your search or filter" : "Use the filter above to view timetable entries"}
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                        Add New Entry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {/* Timetable Header */}
                      <div className="grid grid-cols-8 border-b border-gray-200 text-sm font-medium text-gray-700 bg-gray-50">
                        <div className="col-span-1 p-3"></div>
                        {daysOfWeek.map(day => (
                          <div key={day} className="p-3 text-center">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Timetable Rows */}
                      {timeSlots.map(time => (
                        <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                          <div className="col-span-1 p-3 font-medium text-sm text-gray-700 bg-gray-50 border-r border-gray-200 flex flex-col justify-center">
                            <span className="font-semibold">{time.split(' - ')[0]}</span>
                            <span className="text-xs text-gray-500">{time.split(' - ')[1]}</span>
                          </div>
                          {daysOfWeek.map(day => (
                            <div key={`${day}-${time}`} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px]">
                              {groupedTimetable[day][time].map((entry, index) => (
                                <div 
                                  key={index} 
                                  className={`mb-2 last:mb-0 p-2 rounded-lg border ${getSubjectColor(entry.subject)} shadow-xs hover:shadow-sm transition-shadow`}
                                >
                                  <div className="font-medium text-sm">{entry.subject}</div>
                                  <div className="text-xs mt-1">{entry.location}</div>
                                  <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                      onClick={() => handleEdit(entry)}
                                      className="text-blue-600 hover:text-blue-800 text-xs p-1 rounded hover:bg-blue-100 transition-colors"
                                      title="Edit"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="text-red-600 hover:text-red-800 text-xs p-1 rounded hover:bg-red-100 transition-colors"
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timetableData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            {filter.value ? "No timetable entries found" : "No data to display"}
                          </td>
                        </tr>
                      ) : (
                        timetableData.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {entry.day}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {entry.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showScrollButton && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 z-10 flex items-center justify-center"
              aria-label="Scroll to top"
            >
              <FaArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default TimetableForm;