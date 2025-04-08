import React, { useState, useEffect } from 'react';
import { FaSchool, FaUserGraduate, FaChalkboardTeacher, FaChartBar, FaClipboardList, FaBell, FaUserFriends, FaEnvelope, FaSignOutAlt, FaDownload, FaClock, FaFileInvoice, FaFile, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AdminReports = () => {
  const [students, setStudents] = useState(0);
  const [teachers, setTeachers] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [genderData, setGenderData] = useState({ male: 0, female: 0 });
  const [classDistribution, setClassDistribution] = useState({});
  const [classGenderDistribution, setClassGenderDistribution] = useState({});
  const [classAttendance, setClassAttendance] = useState({});
  const [dailyAttendanceTrends, setDailyAttendanceTrends] = useState({ labels: [], data: [] });
  const [gradesData, setGradesData] = useState({
    averageGrades: {},
    topGrades: {},
    weakGraders: {},
    schoolAverage: 0,
  });
  const [lastMonthEvents, setLastMonthEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allEventsCount, setAllEventsCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [monthlyEventsData, setMonthlyEventsData] = useState({ labels: [], data: [] });
  const [teacherStats, setTeacherStats] = useState({
    gender: { male: 0, female: 0 },
    subjects: {},
    classes: {},
  });
  const [teacherSubjectChartData, setTeacherSubjectChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  });
  const [teacherClassChartData, setTeacherClassChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: '#3b82f6' }],
  });
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    latestPayments: [],
    monthlyRevenue: [],
    weeklyRevenue: []
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Create an array of all API calls with error handling for each
      const apiCalls = [
        { key: 'users', call: axios.get('http://127.0.0.1:8000/api/users') },
        { key: 'attendanceRate', call: axios.get('http://127.0.0.1:8000/api/attendance-rate').catch(() => ({ data: { attendance_rate: 0 } })) },
        { key: 'studentRecords', call: axios.get('http://127.0.0.1:8000/api/student-records').catch(() => ({ data: { data: [] } })) },
        { key: 'attendance', call: axios.get('http://127.0.0.1:8000/api/attendance').catch(() => ({ data: { attendances: [] } })) },
        { key: 'dailyTrends', call: axios.get('http://127.0.0.1:8000/api/daily-attendance-trends').catch(() => ({ data: { labels: [], data: [] } })) },
        { key: 'grades', call: axios.get('http://127.0.0.1:8000/api/grades-with-names').catch(() => ({ data: { grades: [] } })) },
        { key: 'lastMonthEvents', call: axios.get('http://127.0.0.1:8000/api/events/last-month').catch(() => ({ data: { events: [] } })) },
        { key: 'upcomingEvents', call: axios.get('http://127.0.0.1:8000/api/events/upcoming').catch(() => ({ data: { events: [] } })) },
        { key: 'eventCounts', call: axios.get('http://127.0.0.1:8000/api/events/count/all').catch(() => ({ data: { count: 0 } })) },
        { key: 'monthlyEvents', call: axios.get('http://127.0.0.1:8000/api/events/monthly').catch(() => ({ data: { labels: [], data: [] } })) },
        { key: 'teacherRecords', call: axios.get('http://127.0.0.1:8000/api/teacher-records').catch(() => ({ data: { data: [] } })) },
        { key: 'payments', call: axios.get('http://127.0.0.1:8000/api/get-all-payments').catch(() => ({ data: { totalPayments: 0, payments: [] } })) },
        { key: 'studentRecordsRevenue', call: axios.get('http://127.0.0.1:8000/api/student-records').catch(() => ({ data: { data: [] } })) },
        { key: 'monthlyRevenue', call: axios.get('http://127.0.0.1:8000/api/payments-by-month').catch(() => ({ data: { months: [] } })) },
        { key: 'weeklyRevenue', call: axios.get('http://127.0.0.1:8000/api/payments-by-week').catch(() => ({ data: { weeks: [] } })) }
      ];

      // Execute all API calls in parallel
      const responses = await Promise.all(apiCalls.map(item => item.call));
      
      // Create a results object with proper error handling
      const results = {};
      apiCalls.forEach((item, index) => {
        results[item.key] = responses[index].data;
      });

      // Process users data
      const usersData = results.users;
      const studentCount = usersData.filter((user) => user.role === 'student').length;
      const teacherCount = usersData.filter((user) => user.role === 'teacher').length;
      setStudents(studentCount);
      setTeachers(teacherCount);

      // Process attendance data
      setAttendanceRate(results.attendanceRate.attendance_rate);

      // Process student records
      const records = results.studentRecords.data;
      const maleCount = records.filter((record) => record.gender === 'Male').length;
      const femaleCount = records.filter((record) => record.gender === 'Female').length;
      setGenderData({ male: maleCount, female: femaleCount });

      // Process class distribution
      const classCounts = {};
      const classGenderCounts = {};
      records.forEach((record) => {
        const className = `Class ${record.grade_class}`;
        if (className) {
          if (classCounts[className]) {
            classCounts[className] += 1;
          } else {
            classCounts[className] = 1;
          }

          if (!classGenderCounts[className]) {
            classGenderCounts[className] = { male: 0, female: 0 };
          }
          if (record.gender === 'Male') {
            classGenderCounts[className].male += 1;
          } else if (record.gender === 'Female') {
            classGenderCounts[className].female += 1;
          }
        }
      });
      setClassDistribution(classCounts);
      setClassGenderDistribution(classGenderCounts);

      // Process attendance data
      const attendanceData = results.attendance.attendances || [];
      const classAttendanceRates = {};
      attendanceData.forEach((attendance) => {
        const className = `Class ${attendance.class}`;
        if (!classAttendanceRates[className]) {
          classAttendanceRates[className] = { present: 0, total: 0 };
        }
        classAttendanceRates[className].total += 1;
        if (attendance.status === 'Present') {
          classAttendanceRates[className].present += 1;
        }
      });

      const classAttendancePercentages = {};
      Object.keys(classAttendanceRates).forEach((className) => {
        const { present, total } = classAttendanceRates[className];
        classAttendancePercentages[className] = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
      });
      setClassAttendance(classAttendancePercentages);

      // Process daily attendance trends
      setDailyAttendanceTrends({
        labels: results.dailyTrends.labels,
        data: results.dailyTrends.data,
      });

      // Process grades data
      const grades = results.grades.grades;
      const averageGrades = {};
      const topGrades = {};
      const weakGraders = {};
      const gradeValues = { A: 4, B: 3, C: 2, D: 1 };

      grades.forEach((grade) => {
        const className = `Class ${grade.class}`;
        if (!averageGrades[className]) {
          averageGrades[className] = { total: 0, count: 0 };
        }
        averageGrades[className].total += gradeValues[grade.grade] || 0;
        averageGrades[className].count += 1;

        if (!topGrades[className] || gradeValues[grade.grade] > gradeValues[topGrades[className].grade]) {
          topGrades[className] = grade;
        }

        if (!weakGraders[className] || gradeValues[grade.grade] < gradeValues[weakGraders[className].grade]) {
          weakGraders[className] = grade;
        }
      });

      const formattedAverageGrades = {};
      Object.keys(averageGrades).forEach((className) => {
        formattedAverageGrades[className] = (averageGrades[className].total / averageGrades[className].count).toFixed(2);
      });

      const schoolTotal = Object.values(averageGrades).reduce((acc, { total, count }) => acc + total, 0);
      const schoolCount = Object.values(averageGrades).reduce((acc, { count }) => acc + count, 0);
      const schoolAverage = schoolCount > 0 ? (schoolTotal / schoolCount).toFixed(2) : 0;

      setGradesData({
        averageGrades: formattedAverageGrades,
        topGrades,
        weakGraders,
        schoolAverage,
      });

      // Process events data
      setLastMonthEvents(results.lastMonthEvents.events || []);
      setUpcomingEvents(results.upcomingEvents.events || []);
      setAllEventsCount(results.eventCounts.count || 0);
      setUpcomingEventsCount(results.upcomingEvents.events?.length || 0);
      setMonthlyEventsData({
        labels: results.monthlyEvents.labels || [],
        data: results.monthlyEvents.data || [],
      });

      // Process teacher data
      const teachers = results.teacherRecords.data || [];
      const genderCount = { male: 0, female: 0 };
      const subjectCount = {};
      const classCount = {};

      teachers.forEach((teacher) => {
        if (teacher.gender === 'Male') genderCount.male++;
        if (teacher.gender === 'Female') genderCount.female++;

        const subjects = teacher.subjects_assigned?.split(',').map(s => s.trim()) || [];
        subjects.forEach((subject) => {
          if (!subjectCount[subject]) subjectCount[subject] = 0;
          subjectCount[subject]++;
        });

        const classes = teacher.class_section_allocation?.split(',').map(c => c.trim()) || [];
        classes.forEach((cls) => {
          if (!classCount[cls]) classCount[cls] = 0;
          classCount[cls]++;
        });
      });

      setTeacherStats({
        gender: genderCount,
        subjects: subjectCount,
        classes: classCount,
      });

      const subjectLabels = Object.keys(subjectCount);
      const subjectData = Object.values(subjectCount);
      const subjectColors = subjectLabels.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

      setTeacherSubjectChartData({
        labels: subjectLabels,
        datasets: [{ data: subjectData, backgroundColor: subjectColors }],
      });

      const classLabels = Object.keys(classCount);
      const classData = Object.values(classCount);

      setTeacherClassChartData({
        labels: classLabels,
        datasets: [{ data: classData, backgroundColor: '#3b82f6' }],
      });

      // Process payment data
      const paymentsData = results.payments;
      const studentRecordsData = results.studentRecordsRevenue.data || [];
      const monthlyRevenueData = results.monthlyRevenue;
      const weeklyRevenueData = results.weeklyRevenue;

      const totalPaymentAmount = studentRecordsData.reduce((sum, record) => {
        const amount = parseFloat(record.payment_amount) || 0;
        return sum + amount;
      }, 0);
      setTotalRevenue(totalPaymentAmount);

      const totalPaid = parseFloat(paymentsData.totalPayments) || 0;
      const totalUnpaid = Math.max(0, totalPaymentAmount - totalPaid);
      
      const latestPayments = paymentsData.payments?.slice(0, 4) || [];
      
      setPaymentStats({
        totalPaid,
        totalUnpaid,
        latestPayments,
        monthlyRevenue: monthlyRevenueData.months || [],
        weeklyRevenue: weeklyRevenueData.weeks?.slice(0, 4) || []
      });

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchAllData:', error);
      setLoading(false);
    }
  };

  const studentGenderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Students',
        data: [genderData.male, genderData.female],
        backgroundColor: ['#3b82f6', '#ec4899'],
      },
    ],
  };

  const dailyAttendanceData = {
    labels: dailyAttendanceTrends.labels,
    datasets: [
      {
        label: 'Daily Attendance Rate',
        data: dailyAttendanceTrends.data,
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const monthlyEventsChartData = {
    labels: monthlyEventsData.labels,
    datasets: [
      {
        label: 'Events',
        data: monthlyEventsData.data,
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const monthlyRevenueChartData = {
    labels: paymentStats.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: "Monthly Revenue ($)",
        data: paymentStats.monthlyRevenue.map(item => item.amount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  };

  const weeklyRevenueChartData = {
    labels: paymentStats.weeklyRevenue.map(item => `Week ${item.week}`),
    datasets: [
      {
        label: "Weekly Revenue ($)",
        data: paymentStats.weeklyRevenue.map(item => item.amount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.1
      },
    ],
  };


 const downloadPDF = async () => {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  overlay.innerHTML = `
    <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <p style="margin-top: 20px; font-size: 18px; color: #333;">Generating PDF...</p>
  `;
  document.body.appendChild(overlay);
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      

      pdf.setFontSize(28);
      pdf.setTextColor(40, 53, 147); 
      pdf.text('School Management System Report', pageWidth / 2, 60, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 90, { align: 'center' });
      

      pdf.setFontSize(14);
      pdf.text('Summary Statistics', 40, 140);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(40, 145, pageWidth - 40, 145);
      
      pdf.setFontSize(12);
      pdf.text(`Total Students: ${students}`, 40, 170);
      pdf.text(`Total Teachers: ${teachers}`, 40, 190);
      pdf.text(`Attendance Rate: ${attendanceRate}%`, 40, 210);
      pdf.text(`Upcoming Events: ${upcomingEventsCount}`, 40, 230);
      
      // Capture each section separately for better quality
      const sections = [
        { id: 'payment-section', title: 'Payment Analytics' },
        { id: 'student-section', title: 'Student Statistics' },
        { id: 'attendance-section', title: 'Attendance Analysis' },
        { id: 'grades-section', title: 'Academic Performance' },
        { id: 'teacher-section', title: 'Teacher Workforce' },
        { id: 'events-section', title: 'Events Overview' }
      ];
      
      let currentY = 260;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        
        // Add new page if needed
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = 40;
        }
        
        // Add section title
        pdf.setFontSize(18);
        pdf.setTextColor(40, 53, 147);
        pdf.text(section.title, 40, currentY);
        currentY += 30;
        
        const canvas = await html2canvas(element, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add new page if image doesn't fit
        if (currentY + imgHeight > pageHeight - 40) {
          pdf.addPage();
          currentY = 40;
        }
        
        pdf.addImage(imgData, 'PNG', 40, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 40;
      }
      
      // Add footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      }
      
      pdf.save('school_management_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      document.body.removeChild(overlay);
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
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

      <main className="flex-1 p-8 bg-gray-100">
        <div id="report-content">
          <div className="flex justify-between items-center mb-8" data-aos="fade-down">
            <h1 className="text-3xl font-bold">School Reports</h1>
            <button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
              data-aos="zoom-in"
            >
              {pdfLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FaDownload />
                  <span>Download as PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-indigo-100" data-aos="fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Total Students</h2>
                  <p className="text-3xl font-bold text-indigo-600">{students}</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                  <FaUserGraduate className="text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-indigo-100" data-aos="fade-up" data-aos-delay="100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Total Teachers</h2>
                  <p className="text-3xl font-bold text-purple-600">{teachers}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                  <FaChalkboardTeacher className="text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-indigo-100" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Attendance Rate</h2>
                  <p className="text-3xl font-bold text-blue-600">{attendanceRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <FaClipboardList className="text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-indigo-100" data-aos="fade-up" data-aos-delay="300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Upcoming Events</h2>
                  <p className="text-3xl font-bold text-pink-600">{upcomingEventsCount}</p>
                </div>
                <div className="p-3 rounded-full bg-pink-50 text-pink-600">
                  <FaCalendarAlt className="text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div id="payment-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" data-aos="fade-right">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg transition-all duration-300 hover:bg-blue-100">
                  <h4 className="text-lg font-semibold text-blue-800">Total Paid</h4>
                  <p className="text-2xl font-bold">${paymentStats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg transition-all duration-300 hover:bg-red-100">
                  <h4 className="text-lg font-semibold text-red-800">Total Unpaid</h4>
                  <p className="text-2xl font-bold">${paymentStats.totalUnpaid.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-64">
                <Line 
                  data={monthlyRevenueChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Monthly Revenue',
                        font: {
                          size: 16
                        }
                      },
                    },
                  }} 
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" data-aos="fade-left">
              <h3 className="text-xl font-bold mb-4">Weekly Revenue</h3>
              <div className="h-64 flex items-center justify-center">
                <Bar 
                  data={weeklyRevenueChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Weekly Revenue (Last 4 Weeks)',
                        font: {
                          size: 16
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Student Section */}
          <div id="student-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md" data-aos="zoom-in">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Student Gender Distribution</h2>
              <div className="h-80 flex items-center justify-center">
                <Pie 
                  data={studentGenderData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md" data-aos="fade-up">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Class Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(classDistribution).map(([className, count]) => (
                    <div key={className} className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                      <h3 className="text-lg font-semibold text-indigo-700">{className}</h3>
                      <p className="text-2xl font-bold">{count} <span className="text-sm font-normal text-gray-500">Students</span></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md" data-aos="fade-up" data-aos-delay="100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Class Gender Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(classGenderDistribution).map(([className, genderCount]) => (
                    <div key={className} className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                      <h3 className="text-lg font-semibold text-purple-700">{className}</h3>
                      <div className="flex justify-between mt-2">
                        <span className="text-blue-600 font-medium">♂ {genderCount.male}</span>
                        <span className="text-pink-600 font-medium">♀ {genderCount.female}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div id="attendance-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-lg" data-aos="fade-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black-800">Class Attendance Rates</h2>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">High</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Medium</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(classAttendance).map(([className, attendanceRate]) => (
                  <div key={className} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {className}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attendanceRate > 90 ? 'bg-green-100 text-green-800' : 
                        attendanceRate > 75 ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendanceRate > 90 ? 'Excellent' : attendanceRate > 75 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Attendance</span>
                        <span className="font-medium">{attendanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            attendanceRate > 90 ? 'bg-green-500' : 
                            attendanceRate > 75 ? 'bg-blue-500' : 
                            'bg-yellow-500'
                          }`} 
                          style={{ width: `${attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-center">
                  <p className="text-xs text-gray-500 font-semibold mt-2 text-center">
                  {attendanceRate > 90
                    ? 'Excellent attendance maintained.'
                    : attendanceRate > 75
                    ? 'Satisfactory attendance .'
                    : attendanceRate > 50
                    ? 'Attendance is moderate. Improvement needed.'
                    : 'Attendance is below expected levels. Immediate action required.'}
                 </p>
                </div>
              </div>

            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md" data-aos="fade-left">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Attendance Trends</h2>
              <div className="h-80">
                <Bar 
                  data={dailyAttendanceData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return context.raw + '%';
                          }
                        }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Grades Section */}
          <div id="grades-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md" data-aos="fade-up">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Class Average Grades</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(gradesData.averageGrades).map(([className, averageGrade]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                    <h3 className="text-lg font-semibold text-indigo-700">{className}</h3>
                    <div className="flex items-end mt-2">
                      <p className="text-2xl font-bold">{averageGrade}</p>
                      <span className="text-sm text-gray-500 ml-1">GPA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md" data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">School Academic Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">School Average</h3>
                  <p className="text-3xl font-bold text-indigo-600">{gradesData.schoolAverage}</p>
                  <p className="text-sm text-indigo-500 mt-1">GPA across all classes</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-green-800 mb-1">Top Students</h3>
                    {Object.entries(gradesData.topGrades).slice(0, 2).map(([className, topStudent]) => (
                      <p key={className} className="text-sm text-gray-700">
                        {topStudent.student_name} <span className="font-medium">({topStudent.grade})</span>
                      </p>
                    ))}
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-yellow-800 mb-1">Weak Students</h3>
                    {Object.entries(gradesData.weakGraders).slice(0, 2).map(([className, weakStudent]) => (
                      <p key={className} className="text-sm text-gray-700">
                        {weakStudent.student_name} <span className="font-medium">({weakStudent.grade})</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          

            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-xl font-bold mb-4">Weak Graders in Each Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {Object.entries(gradesData.weakGraders).map(([className, weakStudent]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-300 hover:bg-gray-100">
                    <h3 className="text-lg font-semibold">{className}</h3>
                    <p className="text-sm">{weakStudent.student_name}: {weakStudent.grade}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="300">
              <h2 className="text-xl font-bold mb-4">Top Grades in Each Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {Object.entries(gradesData.topGrades).map(([className, topStudent]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-300 hover:bg-gray-100">
                    <h3 className="text-lg font-semibold">{className}</h3>
                    <p className="text-sm">{topStudent.student_name}: {topStudent.grade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher Section */}
          <div id="teacher-section" className="bg-white p-6 rounded-2xl shadow-md border mb-10 border-gray-100 transition-all duration-300 hover:shadow-lg" data-aos="zoom-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Teacher Workforce Analytics</h2>
                <p className="text-sm text-gray-500 mt-1">Comprehensive breakdown of teaching staff distribution</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Subjects</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span>Classes</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gender Distribution Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Gender Distribution
                  </h3>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-center">
                    <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-blue-600">{teacherStats.gender.male}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Male Teachers</p>
                  </div>
                  <div className="text-center">
                    <div className="h-24 w-24 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-pink-600">{teacherStats.gender.female}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Female Teachers</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Total: {teacherStats.gender.male + teacherStats.gender.female} teachers
                  </p>
                </div>
              </div>

              {/* Subject Allocation Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Subject Allocation
                  </h3>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {Object.keys(teacherStats.subjects).length} subjects
                  </span>
                </div>
                <div className="h-60">
                  <Doughnut
                    data={{
                      labels: teacherSubjectChartData.labels,
                      datasets: [{
                        ...teacherSubjectChartData.datasets[0],
                        borderWidth: 0,
                        borderRadius: 4,
                        spacing: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 12,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return ` ${context.label}: ${context.raw} teachers`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Class Allocation Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-purple-200 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    Class Allocation
                  </h3>
                  <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {Object.keys(teacherStats.classes).length} classes
                  </span>
                </div>
                <div className="h-60">
                  <Line
                    data={{
                      labels: teacherClassChartData.labels,
                      datasets: [{
                        ...teacherClassChartData.datasets[0],
                        fill: true,
                        tension: 0.3,
                        pointHoverRadius: 6,
                        pointBorderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return ` ${context.dataset.label}: ${context.raw}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            drawTicks: false,
                            color: '#f3f4f6'
                          },
                          ticks: {
                            precision: 0
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last analyzed: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>          

          {/* Events Section */}
          <div id="events-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 transition-all duration-300 hover:shadow-lg" data-aos="fade-up">
              <h2 className="text-xl font-bold mb-4">Monthly Events (This Year)</h2>
              <Bar data={monthlyEventsChartData} />
            </div>

            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="100">
                <h2 className="text-xl font-bold mb-4">All Events Count (This Year)</h2>
                <p className="text-3xl font-bold">{allEventsCount}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mb-8 transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="200">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                {upcomingEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-300 hover:bg-gray-100">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        <p className="text-sm text-gray-600">
                          <FaCalendarAlt className="inline-block mr-2" />
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <FaMapMarkerAlt className="inline-block mr-2" />
                          {event.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <FaClipboardList className="inline-block mr-2" />
                          {event.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <FaEye className="inline-block mr-2" />
                          Visible to: {event.visible_to?.join(', ') || 'All'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;