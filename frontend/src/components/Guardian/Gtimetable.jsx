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

  useEffect(() => {
    fetchNotificationCount();
    fetchData();

    // Set up polling for notifications
    const interval = setInterval(fetchNotificationCount, 30000);
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
        <Sidebar notificationCount={notificationCount} />
        <div className="flex-1 p-6">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} />
        <div className="flex-1 p-6 text-red-500">{error}</div>
      </div>
    );
  }

  if (childrenTimetables.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar notificationCount={notificationCount} />
        <div className="flex-1 p-6">No children timetables found</div>
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
      <Sidebar notificationCount={notificationCount} />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Children's Timetables</h1>
          {childrenTimetables.length > 1 && (
            <div className="flex space-x-4">
              <button
                onClick={handlePrevChild}
                className="bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800 transition"
              >
                Previous 
              </button>
              <button
                onClick={handleNextChild}
                className="bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800 transition"
              >
                Next 
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-orange-800">
            {activeChild.name} - Class {activeChild.class}
            <span className="ml-4 text-sm text-gray-600">
              (Page {activeChildIndex + 1} of {childrenTimetables.length})
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="flex border border-gray-300 rounded-lg shadow-lg">
            <div className="w-48 flex-shrink-0 bg-gray-100">
              <div className="h-12"></div>
              {sortedTimeSlots.map((time) => (
                <div
                  key={time}
                  className="h-20 flex items-center justify-end pr-4 text-sm text-gray-700 border-b border-gray-300"
                >
                  {time}
                </div>
              ))}
            </div>
            {daysOfWeek.map((day) => (
              <div key={day} className="flex-1 min-w-40">
                <div className="h-12 flex items-center justify-center font-semibold text-white bg-orange-700 border-b border-gray-300">
                  {day}
                </div>
                {sortedTimeSlots.map((time) => {
                  const entry = groupedTimetable[day]?.[time];
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="h-20 p-2 border-b border-gray-400 bg-white hover:bg-gray-100 transition"
                    >
                      {entry ? (
                        <div className="bg-orange-100 p-2 rounded-lg shadow-sm border border-orange-200">
                          <p className="text-sm font-medium text-orange-900">{entry.subject}</p>
                          <p className="text-xs text-gray-600">{entry.location}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center mt-6">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Sidebar = ({ notificationCount }) => (
  <aside className="w-64 bg-orange-800 text-white flex flex-col">
    <div className="p-6">
      <h1 className="text-2xl font-bold">Guardian Dashboard</h1>
    </div>
    <nav className="mt-6">
      <ul>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/guardiandb" className="flex items-center space-x-2">
            <FaUserGraduate />
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gpayment" className="flex items-center space-x-2">
            <FaMoneyCheck />
            <span>Payment</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/ggrades" className="flex items-center space-x-2">
            <FaChartLine />
            <span>Grades</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gattendance" className="flex items-center space-x-2">
            <FaCalendarAlt />
            <span>Attendance</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gtimetable" className="flex items-center space-x-2">
            <FaClock />
            <span>Time-Table</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gevent" className="flex items-center space-x-2">
            <FaCalendarAlt />
            <span>Events</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/gemails" className="flex items-center space-x-2">
            <FaEnvelope />
            <span>Emails</span>
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700 relative">
          <Link to="/gnotification" className="flex items-center space-x-2">
            <FaBell />
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>
        </li>
        <li className="px-6 py-3 hover:bg-orange-700">
          <Link to="/geditprofile" className="flex items-center space-x-2">
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
);

export default Gtimetable;