import React, { useState, useEffect } from 'react';
import { FaSchool, FaUserGraduate, FaChalkboardTeacher, FaChartBar, FaClipboardList, FaBell, FaEnvelope, FaCog, FaSignOutAlt, FaDownload, FaClock, FaFileInvoice, FaFile, FaCalendarAlt, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

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

  useEffect(() => {
    fetchDashboardData();
    fetchLastMonthEvents();
    fetchUpcomingEvents();
    fetchEventCounts();
    fetchMonthlyEvents();
    fetchTeacherStatistics();
    fetchTeacherChartData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersResponse = await axios.get('http://127.0.0.1:8000/api/users');
      const usersData = usersResponse.data;
      const studentCount = usersData.filter((user) => user.role === 'student').length;
      const teacherCount = usersData.filter((user) => user.role === 'teacher').length;
      setStudents(studentCount);
      setTeachers(teacherCount);

      const attendanceResponse = await axios.get('http://127.0.0.1:8000/api/attendance-rate');
      setAttendanceRate(attendanceResponse.data.attendance_rate);

      const studentRecordsResponse = await axios.get('http://127.0.0.1:8000/api/student-records');
      const records = studentRecordsResponse.data.data;

      const maleCount = records.filter((record) => record.gender === 'Male').length;
      const femaleCount = records.filter((record) => record.gender === 'Female').length;
      setGenderData({ male: maleCount, female: femaleCount });

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

      const attendanceDataResponse = await axios.get('http://127.0.0.1:8000/api/attendance');
      const attendanceData = attendanceDataResponse.data.attendances || [];

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

      const dailyTrendsResponse = await axios.get('http://127.0.0.1:8000/api/daily-attendance-trends');
      setDailyAttendanceTrends({
        labels: dailyTrendsResponse.data.labels,
        data: dailyTrendsResponse.data.data,
      });

      const gradesResponse = await axios.get('http://127.0.0.1:8000/api/grades-with-names');
      const grades = gradesResponse.data.grades;

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchTeacherStatistics = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/teacher-records');
      const teachers = response.data.data;

      const genderCount = { male: 0, female: 0 };
      const subjectCount = {};
      const classCount = {};

      teachers.forEach((teacher) => {
        // Count gender
        if (teacher.gender === 'Male') genderCount.male++;
        if (teacher.gender === 'Female') genderCount.female++;

        // Count subjects
        const subjects = teacher.subjects_assigned.split(',').map(s => s.trim());
        subjects.forEach((subject) => {
          if (!subjectCount[subject]) subjectCount[subject] = 0;
          subjectCount[subject]++;
        });

        // Count classes
        const classes = teacher.class_section_allocation.split(',').map(c => c.trim());
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
    } catch (error) {
      console.error('Error fetching teacher statistics:', error);
    }
  };

  const fetchTeacherChartData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/teacher-records');
      const teachers = response.data.data;

      const subjectCount = {};
      const classCount = {};

      teachers.forEach((teacher) => {
        // Count subjects
        const subjects = teacher.subjects_assigned.split(',').map(s => s.trim());
        subjects.forEach((subject) => {
          if (!subjectCount[subject]) subjectCount[subject] = 0;
          subjectCount[subject]++;
        });

        // Count classes
        const classes = teacher.class_section_allocation.split(',').map(c => c.trim());
        classes.forEach((cls) => {
          if (!classCount[cls]) classCount[cls] = 0;
          classCount[cls]++;
        });
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
    } catch (error) {
      console.error('Error fetching teacher chart data:', error);
    }
  };

  const fetchLastMonthEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/events/last-month');
      setLastMonthEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching last month events:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/events/upcoming');
      setUpcomingEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  const fetchEventCounts = async () => {
    try {
      const allResponse = await axios.get('http://127.0.0.1:8000/api/events/count/all');
      setAllEventsCount(allResponse.data.count);

      const upcomingResponse = await axios.get('http://127.0.0.1:8000/api/events/count/upcoming');
      setUpcomingEventsCount(upcomingResponse.data.count);
    } catch (error) {
      console.error('Error fetching event counts:', error);
    }
  };

  const fetchMonthlyEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/events/monthly');
      setMonthlyEventsData({
        labels: response.data.labels,
        data: response.data.data,
      });
    } catch (error) {
      console.error('Error fetching monthly events:', error);
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

  const downloadPDF = () => {
    const input = document.getElementById('report-content');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(22);
      pdf.text('School Management System Report', 10, 20);

      pdf.addImage(imgData, 'PNG', 10, 30, imgWidth - 20, imgHeight - 20);

      pdf.save('school_report.pdf');
    });
  };

  return (
    <div className="flex">
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

      <main className="flex-1 p-8 bg-gray-100">
        <div id="report-content">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">School Reports</h1>
            <button
              onClick={downloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <FaDownload />
              <span>Download as PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Total Students</h2>
              <p className="text-3xl font-bold">{students}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Total Teachers</h2>
              <p className="text-3xl font-bold">{teachers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Attendance Today</h2>
              <p className="text-3xl font-bold">{attendanceRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <p className="text-3xl font-bold">{upcomingEventsCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold mb-4">Gender Distribution</h2>
              <div style={{ width: '100%', maxWidth: '300px', height: '300px' }}>
                <Pie data={studentGenderData} />
              </div>
            </div>

            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold text-center mb-4">Class-wise Distribution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                  {Object.entries(classDistribution).map(([className, count]) => (
                    <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold">{className}</h3>
                      <p className="text-2xl font-bold">{count} Student{count !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-4">Class Gender Distribution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                  {Object.entries(classGenderDistribution).map(([className, genderCount]) => (
                    <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold">{className}</h3>
                      <p>Male: {genderCount.male}</p>
                      <p>Female: {genderCount.female}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Average Student Attendance For Each Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {Object.entries(classAttendance).map(([className, attendanceRate]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">{className}</h3>
                    <p className="text-2xl font-bold">{attendanceRate}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Daily Attendance Trends (Last 7 Days)</h2>
              <Bar data={dailyAttendanceData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Average Grades for Each Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {Object.entries(gradesData.averageGrades).map(([className, averageGrade]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">{className}</h3>
                    <p className="text-2xl font-bold">{averageGrade}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Average Grades for the Whole School</h2>
              <p className="text-3xl font-bold">{gradesData.schoolAverage}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Weak Graders in Each Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {Object.entries(gradesData.weakGraders).map(([className, weakStudent]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">{className}</h3>
                    <p className="text-sm">{weakStudent.student_name}: {weakStudent.grade}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Top Grades in Each Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {Object.entries(gradesData.topGrades).map(([className, topStudent]) => (
                  <div key={className} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">{className}</h3>
                    <p className="text-sm">{topStudent.student_name}: {topStudent.grade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Teacher Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Gender Distribution</h3>
                <div className="space-y-2">
                  <p className="text-sm">Male: {teacherStats.gender.male}</p>
                  <p className="text-sm">Female: {teacherStats.gender.female}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Subjects Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(teacherStats.subjects).map(([subject, count]) => (
                    <p key={subject} className="text-sm">
                      {subject}: {count}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Class Allocation</h3>
                <div className="space-y-2">
                  {Object.entries(teacherStats.classes).map(([className, count]) => (
                    <p key={className} className="text-sm">
                      {className}: {count}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Teacher Subject Distribution</h2>
              <div style={{ width: '100%', height: '300px' }}>
                <Doughnut
                  data={{
                    labels: teacherSubjectChartData.labels,
                    datasets: [
                      {
                        data: teacherSubjectChartData.datasets[0].data,
                        backgroundColor: teacherSubjectChartData.datasets[0].backgroundColor,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Teacher Class Allocation</h2>
              <div style={{ width: '100%', height: '300px' }}>
                <Line
                  data={{
                    labels: teacherClassChartData.labels,
                    datasets: [
                      {
                        label: 'Teachers per Class',
                        data: teacherClassChartData.datasets[0].data,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Teachers',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Class',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-4">Monthly Events (This Year)</h2>
              <Bar data={monthlyEventsChartData} />
            </div>

            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">All Events Count (This Year)</h2>
                <p className="text-3xl font-bold">{allEventsCount}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
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
                        Visible to: {event.visible_to.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;