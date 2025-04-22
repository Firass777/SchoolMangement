import React, { useState, useEffect } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaSignOutAlt,
  FaEnvelope,
  FaIdCard,
  FaCreditCard,
  FaMoneyCheck,
  FaClock
} from 'react-icons/fa';
import { motion } from 'framer-motion'; 

const Gpayment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [children, setChildren] = useState([]);
  const [payments, setPayments] = useState([]); 
  const [allPayments, setAllPayments] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
      // Access Checking
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || userData.role !== "parent") {
        navigate("/access");
        return;
      }


    fetchNotificationCount();
    fetchEmailCount();
    
    if (user) {
      const childrenNin = JSON.parse(user.children_nin || '[]');
      if (childrenNin.length > 0) {
        axios.get(`http://localhost:8000/api/get-children?nins=${childrenNin.join(',')}`)
          .then(response => setChildren(response.data))
          .catch(error => console.error('Error fetching children:', error));
      }
      
      fetchPayments(currentPage);
      fetchAllPayments();
      fetchSummary();
    }

    // Set up polling for notifications and emails
    const interval = setInterval(() => {
      fetchNotificationCount();
      fetchEmailCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentPage , navigate]);

  const fetchNotificationCount = async () => {
    if (!user?.email) return;
    
    try {
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread-count/${user.email}`
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
    if (!user?.email) return;
    
    try {
      const response = await axios.get(
        `http://localhost:8000/api/emails/unread-count/${user.email}`
      );
      if (response.data) {
        setEmailCount(response.data.count);
        localStorage.setItem('emailCount', response.data.count.toString());
      }
    } catch (error) {
      console.error("Error fetching email count:", error);
    }
  };

  const fetchPayments = async (page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-parent-payments?page=${page}&user=${JSON.stringify(user)}`
      );
      
      if (response.data) {
        setPayments(response.data.payments.data);
        setTotalPages(response.data.payments.last_page);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAllPayments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-all-parent-payments?user=${JSON.stringify(user)}`
      );
      
      if (response.data) {
        setAllPayments(response.data.payments);
        setTotalPayments(response.data.totalPayments);
      }
    } catch (error) {
      console.error('Error fetching all payments:', error);
    }
  };
  
  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-parent-payment-summary?user=${JSON.stringify(user)}`
      );
      
      if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && !isLoading) {
      setCurrentPage(page);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      alert('Please log in to make a payment.');
      return;
    }
  
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!selectedChild) {
      alert('Please select a child to pay for.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/api/create-payment', {
        amount: amount,
        student_nin: selectedChild
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      const paymentDetails = {
        user_id: user.id,
        student_nin: selectedChild,
        amount: amount,
        created_at: new Date().toISOString(),
        stripe_payment_id: 'temp_id',
        status: 'pending',
      };
      localStorage.setItem('latestPayment', JSON.stringify(paymentDetails));
  
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const totalPaymentsCount = allPayments.length;
  const averagePaymentAmount = totalPaymentsCount > 0 ? (totalPayments / totalPaymentsCount).toFixed(2) : 0;
  const lastPaymentDate = totalPaymentsCount > 0 ? new Date(allPayments[0]?.created_at).toLocaleDateString() : 'N/A';

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
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

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Payment</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">Pay your children's school fees securely using Stripe.</p>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            className="bg-white shadow-md rounded-lg p-4 sm:p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Make a Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Child</label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a child</option>
                  {children.map(child => (
                    <option key={child.nin} value={child.nin}>
                      {child.full_name} (NIN: {child.nin})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                onClick={handlePayment}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <FaCreditCard className="mr-2" />
                Pay Now
              </button>
            </div>
          </motion.div>

          <motion.div
            className="bg-white shadow-md rounded-lg p-4 sm:p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Payment Total</h3>
            <div className="text-xl sm:text-2xl font-semibold text-orange-600">
              ${totalPayments.toFixed(2)}
            </div>
            <p className="text-gray-600 mt-2">Total amount paid for all children.</p>
          </motion.div>
        </div>

        {/* Mobile View for Make a Payment and Payment Total */}
        <div className="block sm:hidden space-y-6 mb-6">
          <motion.div
            className="bg-white shadow-md rounded-lg p-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Make a Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Child</label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a child</option>
                  {children.map(child => (
                    <option key={child.nin} value={child.nin}>
                      {child.full_name} (NIN: {child.nin})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                onClick={handlePayment}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <FaCreditCard className="mr-2" />
                Pay Now
              </button>
            </div>
          </motion.div>

          <motion.div
            className="bg-white shadow-md rounded-lg p-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Total</h3>
            <div className="text-xl font-semibold text-orange-600">
              ${totalPayments.toFixed(2)}
            </div>
            <p className="text-gray-600 mt-2">Total amount paid for all children.</p>
          </motion.div>
        </div>

        {summary && (
          // Desktop View for Summary and History
          <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              className="bg-white shadow-md rounded-lg p-4 sm:p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Children Payment Summary</h3>
              <div className="space-y-4">
                {summary.children.map((child, index) => (
                  <div key={index} className="border-b pb-4">
                    <h4 className="font-semibold text-orange-700">{child.name}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-sm text-gray-600">Total Paid:</span>
                        <p className="font-medium">${child.total_paid.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Amount Due:</span>
                        <p className="font-medium">${child.amount_due.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-white shadow-md rounded-lg p-4 sm:p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Payment History Summary</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Total Payments:</strong> {totalPaymentsCount}
                </p>
                <p>
                  <strong>Average Payment Amount:</strong> ${averagePaymentAmount}
                </p>
                <p>
                  <strong>Last Payment Date:</strong> {lastPaymentDate}
                </p>
                <p>
                  <strong>Total Amount Due:</strong> ${summary?.amount_due?.toFixed(2) || '0.00'}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {summary && (
          // Mobile View for Summary and History
          <div className="block sm:hidden space-y-6 mb-6">
            <motion.div
              className="bg-white shadow-md rounded-lg p-4"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Children Payment Summary</h3>
              <div className="space-y-4">
                {summary.children.map((child, index) => (
                  <div key={index} className="border-b pb-4">
                    <h4 className="font-semibold text-orange-700">{child.name}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-sm text-gray-600">Total Paid:</span>
                        <p className="font-medium">${child.total_paid.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Amount Due:</span>
                        <p className="font-medium">${child.amount_due.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-white shadow-md rounded-lg p-4"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment History Summary</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Total Payments:</strong> {totalPaymentsCount}
                </p>
                <p>
                  <strong>Average Payment Amount:</strong> ${averagePaymentAmount}
                </p>
                <p>
                  <strong>Last Payment Date:</strong> {lastPaymentDate}
                </p>
                <p>
                  <strong>Total Amount Due:</strong> ${summary?.amount_due?.toFixed(2) || '0.00'}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          className="mt-4 sm:mt-6 bg-white shadow-md rounded-lg p-4 sm:p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recent Payments</h3>
          {isLoading ? (
            <p className="text-gray-600">Loading payments...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <table className="hidden sm:table min-w-full table-auto">
                  <thead className="bg-orange-800 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Child</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        className="border-b"
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <td className="px-6 py-3 font-medium text-orange-700">
                          {payment.student_name || 'N/A'}
                        </td>
                        <td className="px-6 py-3">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">${payment.amount}</td>
                        <td className={`px-6 py-3 ${
                          payment.status === 'paid' ? 'text-green-600' : 
                          payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {payment.status}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile List View */}
                <div className="block sm:hidden space-y-4">
                  {payments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      className="border-b pb-4"
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <p className="font-medium text-orange-700">{payment.student_name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Date:</strong> {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Amount:</strong> ${payment.amount}
                      </p>
                      <p className={`text-sm ${
                        payment.status === 'paid' ? 'text-green-600' : 
                        payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        <strong>Status:</strong> {payment.status}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${
                      currentPage === page
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={isLoading || currentPage === page} 
                  >
                    {page}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Gpayment;