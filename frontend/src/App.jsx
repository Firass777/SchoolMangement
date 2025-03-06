import { Link, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Admindb from './components/Admin/Admindb';
import Student from './components/Admin/Student';  
import Teacher from './components/Admin/Teacher';
import Reports from './components/Admin/Reports';

import Teacherdb from './components/Teacher/Teacherdb'
import AttendanceForm from "./components/Teacher/AttendanceForm";

import Studentdb from './components/Student/Studentdb';
import AttendanceView from "./components/Student/AttendanceView";

import Guardindb from './components/Guardian/Guardiandb';

function App() {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 overflow-x-hidden flex flex-col" style={{ overflow: 'hidden' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-600">SchoolManager</h1>
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
          <Route path="/admindb" element={<Admindb />} />
          <Route path="/students" element={<Student />} /> 
          <Route path="/teachers" element={<Teacher />} /> 
          <Route path="/reports" element={<Reports />} />

          <Route path="/teacherdb" element={<Teacherdb />} />
          <Route path="/attendanceform" element={<AttendanceForm />} />

          <Route path="/guardiandb" element={<Guardindb />} />

          <Route path="/studentdb" element={<Studentdb />} />
          <Route path="/attendanceview" element={<AttendanceView />} />
          
        </Routes>
      </div>

      {/* Footer Section */}
      <footer className="py-6 bg-gray-800 text-white text-center mt-auto">
        <p>&copy; 2025 SchoolManager. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
