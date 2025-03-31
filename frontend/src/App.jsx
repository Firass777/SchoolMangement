import { Link, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react"; 
import AOS from "aos";
import "aos/dist/aos.css";

import Home from './components/Home';
import Login from './components/Login';
import AboutUs from "./components/Aboutus";

import Register from './components/Register';
import Admindb from './components/Admin/Admindb';
import Student from './components/Admin/Student';  
import Teacher from './components/Admin/Teacher';
import Reports from './components/Admin/Reports';
import EventForm from "./components/Admin/EventForm";
import AEmails from "./components/Admin/AEmails";
import NotificationForm from "./components/Admin/NotificationForm";
import TimetableForm from "./components/Admin/TimetableForm";
import DocumentsForm from "./components/Admin/DocumentsForm";
import RecordForm from "./components/Admin/RecordForm";
import TeacherRecord from "./components/Admin/TeacherRecord";


import Teacherdb from './components/Teacher/Teacherdb'
import AttendanceForm from "./components/Teacher/AttendanceForm";
import GradeForm from "./components/Teacher/GradesForm";
import CourseForm from "./components/Teacher/CourseForm";
import TeacherEventView from "./components/Teacher/TeacherEventView";
import TEmails from "./components/Teacher/TEmails";
import TNotificationView from "./components/Teacher/TNotificationView";
import TTimetable from "./components/Teacher/TTimetable";
import TEditProfile from "./components/Teacher/TEditProfile";

import Studentdb from './components/Student/Studentdb';
import AttendanceView from "./components/Student/AttendanceView";
import GradeView from "./components/Student/GradesView";
import CourseView from "./components/Student/CourseView";
import StudentEventView from "./components/Student/StudentEventView";
import SEmails from "./components/Student/SEmails";
import NotificationView from "./components/Student/NotificationView";
import STimetable from "./components/Student/STimetable";
import SEditprofile from "./components/Student/SEditProfile" ;
import Documents from "./components/Student/Documents";
import SPayment from "./components/Student/SPayment";
import Receipt from "./components/Student/Receipt";

import Guardindb from './components/Guardian/Guardiandb';
import GEditProfile from './components/Guardian/GEditProfile';
import GAttendance from "./components/Guardian/GAttendance";
import GGrades from "./components/Guardian/Ggrades";
import Gpayment from "./components/Guardian/Gpayment";
import GEvent from "./components/Guardian/GEvent";
import GEmails from "./components/Guardian/GEmails";
import GTimetable from "./components/Guardian/Gtimetable";
import GNotification from "./components/Guardian/GNotification";

function App() {
  const [scrollY, setScrollY] = useState(0); 

  useEffect(() => {
    AOS.init();

    const handleScroll = () => {
      setScrollY(window.scrollY); 
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Calculate opacity based on scroll position
  const navbarOpacity = Math.max(0, 1 - scrollY / 1000); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 overflow-x-hidden flex flex-col" style={{ overflow: 'hidden' }}>
      {/* Navbar */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-opacity duration-300"
        style={{ opacity: navbarOpacity }}
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo and SchoolManager Header */}
          <div className="flex items-center space-x-2">
            <img 
              src="src/images/logo.jpg" 
              alt="School Logo" 
              className="h-12 w-12" 
            />
            <h1 className="text-2xl font-bold text-blue-600">National University</h1>
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="text-gray-700 hover:text-blue-500 font-medium">
                Home
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-gray-700 hover:text-blue-500 font-medium">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-gray-700 hover:text-blue-500 font-medium">
                Register
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aboutus" element={<AboutUs />} />


          <Route path="/admindb" element={<Admindb />} />
          <Route path="/students" element={<Student />} /> 
          <Route path="/teachers" element={<Teacher />} /> 
          <Route path="/reports" element={<Reports />} />
          <Route path="/eventform" element={<EventForm />} />
          <Route path="/aemails" element={<AEmails />} />
          <Route path="/notificationform" element={<NotificationForm />} />
          <Route path="/timetableform" element={<TimetableForm />} />
          <Route path="/documentsform" element={<DocumentsForm />} />
          <Route path="/recordform" element={<RecordForm />} />
          <Route path="/teacherrecord" element={<TeacherRecord />} />

          <Route path="/teacherdb" element={<Teacherdb />} />
          <Route path="/attendanceform" element={<AttendanceForm />} />
          <Route path="/gradesform" element={<GradeForm />} />
          <Route path="/courseform" element={<CourseForm />} />
          <Route path="/teachereventview" element={<TeacherEventView />} />
          <Route path="/temails" element={<TEmails />} />
          <Route path="/tnotificationview" element={<TNotificationView />} />
          <Route path="/ttimetable" element={<TTimetable />} />
          <Route path="/teditprofile" element={<TEditProfile />} />

          <Route path="/studentdb" element={<Studentdb />} />
          <Route path="/attendanceview" element={<AttendanceView />} />
          <Route path="/gradesview" element={<GradeView />} />
          <Route path="/courseview" element={<CourseView />} />
          <Route path="/studenteventview" element={<StudentEventView />} />
          <Route path="/semails" element={<SEmails />} />
          <Route path="/notificationview" element={<NotificationView />} />
          <Route path="/stimetable" element={<STimetable />} />
          <Route path="/seditprofile" element={<SEditprofile />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/spayment" element={<SPayment />} />
          <Route path="/receipt" element={<Receipt />} />

          <Route path="/guardiandb" element={<Guardindb />} />
          <Route path="/geditprofile" element={<GEditProfile />} />
          <Route path="/gattendance" element={<GAttendance />} />
          <Route path="/ggrades" element={<GGrades />} />
          <Route path="/gpayment" element={<Gpayment />} />
          <Route path="/gevent" element={<GEvent />} />
          <Route path="/gemails" element={<GEmails />} />
          <Route path="/gtimetable" element={<GTimetable />} />
          <Route path="/gnotification" element={<GNotification />} />
          



        </Routes>
      </div>

      {/* Footer Section */}
      <footer className="py-6 bg-gray-800 text-white text-center mt-auto">
        <p>&copy; 2025 National University. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;