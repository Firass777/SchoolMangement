import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaEnvelope,
  FaClock,
  FaIdCard,
  FaMoneyCheck
} from "react-icons/fa";

function Gtimetable() {
  const [childrenTimetables, setChildrenTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
    fetchEmailCount();
    fetchData();

    const interval = setInterval(() => {
      fetchNotificationCount();
      fetchEmailCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const email = user?.email;
    
    if (!email) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread-count/${email}`
      );
      if (response.data) {
        setNotificationCount(response.data.count);
        localStorage.setItem('notificationCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchEmailCount = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const email = user?.email;
    
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

  const fetchData = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setError("No user data found");
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      if (user.role !== "parent" || !user.children_nin) {
        setError("Not a parent account or no children data");
        setLoading(false);
        return;
      }

      let childrenNin = [];
      try {
        childrenNin = JSON.parse(user.children_nin);
        if (!Array.isArray(childrenNin)) {
          childrenNin = [childrenNin];
        }
      } catch (e) {
        setError("Invalid children data format");
        setLoading(false);
        return;
      }

      if (!childrenNin.length) {
        setError("No children registered");
        setLoading(false);
        return;
      }

      const childrenData = await Promise.all(
        childrenNin.map(async (nin) => {
          try {
            const response = await axios.get(`http://127.0.0.1:8000/api/user-by-nin/${nin}`);
            if (!response.data) return null;
            return { nin, name: response.data.name, class: response.data.class };
          } catch (error) {
            console.error(`Error fetching child data for NIN ${nin}:`, error);
            return null;
          }
        })
      );

      const validChildren = childrenData.filter(child => child && child.class);

      const timetablesPromises = validChildren.map(async (child) => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/student-timetable/${child.class}`);
          return { ...child, timetable: response.data || [] };
        } catch (error) {
          console.error(`Error fetching timetable for ${child.name}:`, error);
          return { ...child, timetable: [] };
        }
      });

      const timetables = await Promise.all(timetablesPromises);
      setChildrenTimetables(timetables);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const parseTime = (timeRange) => {
    const startTime = timeRange.split(" - ")[0];
    const [time, modifier] = startTime.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(Number(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return new Date(`1970-01-01 ${hours}:${minutes}:00`);
  };

  const handleNextChild = () => {
    setActiveChildIndex((prevIndex) => 
      prevIndex < childrenTimetables.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrevChild = () => {
    setActiveChildIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : childrenTimetables.length - 1
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
        <div className="flex-1 p-4 sm:p-6">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
        <div className="flex-1 p-4 sm:p-6 text-red-500">{error}</div>
      </div>
    );
  }

  if (childrenTimetables.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
        <div className="flex-1 p-4 sm:p-6">No children timetables found</div>
      </div>
    );
  }

  const activeChild = childrenTimetables[activeChildIndex];
  const timeSlots = [...new Set(activeChild.timetable.map((entry) => entry.time))];
  const sortedTimeSlots = timeSlots.sort((a, b) => parseTime(a) - parseTime(b));
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const groupedTimetable = activeChild.timetable.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = {};
    acc[entry.day][entry.time] = entry;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar notificationCount={notificationCount} emailCount={emailCount} />
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Children's Timetables</h1>
          {childrenTimetables.length > 1 && (
            <div className="flex space-x-4 w-full sm:w-auto">
              <button
                onClick={handlePrevChild}
                className="flex-1 sm:flex-none bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800 transition"
              >
                Previous
              </button>
              <button
                onClick={handleNextChild}
                className="flex-1 sm:flex-none bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-orange-800">
            {activeChild.name} - Class {activeChild.class}
            <span className="ml-2 sm:ml-4 text-sm text-gray-600">
              (Page {activeChildIndex + 1} of {childrenTimetables.length})
            </span>
          </h2>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="flex border border-gray-300 rounded-lg shadow-lg">
            <div className="w-32 sm:w-48 flex-shrink-0 bg-gray-100">
              <div className="h-12"></div>
              {sortedTimeSlots.map((time) => (
                <div
                  key={time}
                  className="h-20 flex items-center justify-end pr-2 sm:pr-4 text-xs sm:text-sm text-gray-700 border-b border-gray-300"
                >
                  {time}
                </div>
              ))}
            </div>
            {daysOfWeek.map((day) => (
              <div key={day} className="flex-1 min-w-32 sm:min-w-40">
                <div className="h-12 flex items-center justify-center font-semibold text-white bg-orange-700 border-b border-gray-300 text-xs sm:text-base">
                  {day}
                </div>
                {sortedTimeSlots.map((time) => {
                  const entry = groupedTimetable[day]?.[time];
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="h-20 p-1 sm:p-2 border-b border-gray-400 bg-white hover:bg-gray-100 transition"
                    >
                      {entry ? (
                        <div className="bg-orange-100 p-1 sm:p-2 rounded-lg shadow-sm border border-orange-200">
                          <p className="text-xs sm:text-sm font-medium text-orange-900">{entry.subject}</p>
                          <p className="text-xs text-gray-600">{entry.location}</p>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-400 text-center mt-4 sm:mt-6">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-orange-700 mb-4">{day}</h2>
              <div className="space-y-4">
                {sortedTimeSlots.map((time) => {
                  const entry = groupedTimetable[day]?.[time];
                  return (
                    <div key={`${day}-${time}`} className="flex flex-col border-b border-gray-200 pb-2">
                      <p className="text-sm font-medium text-gray-700">{time}</p>
                      {entry ? (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-orange-900">{entry.subject}</p>
                          <p className="text-xs text-gray-600">{entry.location}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Sidebar = ({ notificationCount, emailCount }) => (
  <aside className="w-16 sm:w-64 bg-orange-800 text-white flex flex-col transition-all duration-300">
    <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
      <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Guardian Dashboard</h1>
      <h1 className="text-xl font-bold block sm:hidden">GD</h1>
    </div>
    <nav className="mt-6">
      <ul>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/guardiandb" className="flex items-center space-x-2">
            <FaUserGraduate className="text-xl" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gpayment" className="flex items-center space-x-2">
            <FaMoneyCheck className="text-xl" />
            <span className="hidden sm:block">Payment</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/ggrades" className="flex items-center space-x-2">
            <FaChartLine className="text-xl" />
            <span className="hidden sm:block">Grades</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gattendance" className="flex items-center space-x-2">
            <FaCalendarAlt className="text-xl" />
            <span className="hidden sm:block">Attendance</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gtimetable" className="flex items-center space-x-2">
            <FaClock className="text-xl" />
            <span className="hidden sm:block">Time-Table</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/gevent" className="flex items-center space-x-2">
            <FaCalendarAlt className="text-xl" />
            <span className="hidden sm:block">Events</span>
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 relative flex justify-center sm:justify-start">
          <Link to="/gemails" className="flex items-center space-x-2">
            <FaEnvelope className="text-xl" />
            <span className="hidden sm:block">Emails</span>
            {emailCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {emailCount}
              </span>
            )}
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 relative flex justify-center sm:justify-start">
          <Link to="/gnotification" className="flex items-center space-x-2">
            <FaBell className="text-xl" />
            <span className="hidden sm:block">Notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>
        </li>
        <li className="px-3 sm:px-6 py-3 hover:bg-orange-700 flex justify-center sm:justify-start">
          <Link to="/geditprofile" className="flex items-center space-x-2">
            <FaIdCard className="text-xl" />
            <span className="hidden sm:block">Profile</span>
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
);

export default Gtimetable;