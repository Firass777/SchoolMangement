import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaCreditCard, FaMoneyCheck } from 'react-icons/fa';
import { motion } from 'framer-motion'; 
import axios from 'axios';

const Spayment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [payments, setPayments] = useState([]); 
  const [totalPayments, setTotalPayments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

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
      if (cachedRole === "student") {
        setIsVerifying(false);
        if (user) {
          fetchPayments(currentPage);
        }
        fetchNotificationCount();
        fetchEmailCount();
        const notificationInterval = setInterval(fetchNotificationCount, 30000);
        const emailInterval = setInterval(fetchEmailCount, 30000);
        return () => {
          clearInterval(notificationInterval);
          clearInterval(emailInterval);
        };
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user-role", {
          params: { token },
          timeout: 3000,
        });

        if (
          response.data.status === "success" &&
          response.data.role === "student" &&
          response.data.role === localRole
        ) {
          sessionStorage.setItem("verifiedRole", "student");
          setIsVerifying(false);
          if (user) {
            fetchPayments(currentPage);
          }
          fetchNotificationCount();
          fetchEmailCount();
          const notificationInterval = setInterval(fetchNotificationCount, 30000);
          const emailInterval = setInterval(fetchEmailCount, 30000);
          return () => {
            clearInterval(notificationInterval);
            clearInterval(emailInterval);
          };
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
  }, [navigate, currentPage]);

  // Fetch notification count
  const fetchNotificationCount = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
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
    const userData = JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;
    
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

  // Fetch total paid and payment history from the new API
  const fetchPayments = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/user-payments?user_id=${user.id}&page=${page}&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Parse amounts to floats
        const parsedPayments = data.data.payments.data.map(payment => ({
          ...payment,
          amount: parseFloat(payment.amount) || 0
        }));
        setPayments(parsedPayments);
        setTotalPayments(parseFloat(data.data.total_paid) || 0);
        setTotalPages(data.data.payments.last_page);
      } else {
        alert('Failed to fetch payment data.');
        setPayments([]);
        setTotalPayments(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Error fetching payment data.');
      setPayments([]);
      setTotalPayments(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
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
  
    try {
      const response = await fetch('http://localhost:8000/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          amount: amount,
        }),
      });
  
      const { url } = await response.json();
      
      // Save payment details in local storage
      const paymentDetails = {
        user_id: user.id,
        amount: parseFloat(amount),
        created_at: new Date().toISOString(),
        stripe_payment_id: 'temp_id',
        status: 'pending',
      };
      localStorage.setItem('latestPayment', JSON.stringify(paymentDetails));
  
      // Redirect to payment URL
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Calculate payment statistics using payments
  const totalPaymentsCount = payments.length;
  const averagePaymentAmount = totalPaymentsCount > 0 ? (totalPayments / totalPaymentsCount).toFixed(2) : '0.00';
  const lastPaymentDate = totalPaymentsCount > 0 && payments[0]?.created_at 
    ? new Date(payments[0].created_at).toLocaleDateString() 
    : 'N/A';

  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 sm:w-64 bg-purple-800 text-white flex flex-col transition-all duration-300">
        <div className="p-4 sm:p-6 flex justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Student Dashboard</h1>
          <h1 className="text-xl font-bold block sm:hidden">SD</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/studentdb" className="flex items-center space-x-2">
                <FaUserGraduate className="text-xl" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/spayment" className="flex items-center space-x-2">
                <FaMoneyCheck className="text-xl" />
                <span className="hidden sm:block">Payment</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/stimetable" className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="hidden sm:block">Time-Table</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/gradesview" className="flex items-center space-x-2">
                <FaChartLine className="text-xl" />
                <span className="hidden sm:block">Grades</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/attendanceview" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Attendance</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/courseview" className="flex items-center space-x-2">
                <FaBook className="text-xl" />
                <span className="hidden sm:block">Courses</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/studenteventview" className="flex items-center space-x-2">
                <FaCalendarAlt className="text-xl" />
                <span className="hidden sm:block">Events</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 relative flex justify-center sm:justify-start">
              <Link to="/semails" className="flex items-center space-x-2">
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:block">Emails</span>
                {emailCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {emailCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/documents" className="flex items-center space-x-2">
                <FaFileInvoice className="text-xl" />
                <span className="hidden sm:block">Documents</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 relative flex justify-center sm:justify-start">
              <Link to="/notificationview" className="flex items-center space-x-2">
                <FaBell className="text-xl" />
                <span className="hidden sm:block">Notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-purple-700 flex justify-center sm:justify-start">
              <Link to="/seditprofile" className="flex items-center space-x-2">
                <FaIdCard className="text-xl" />
                <span className="hidden sm:block">Profile</span>
              </Link>
            </li>
            <li className="px-3 sm:px-6 py-3 hover:bg-red-600 flex justify-center sm:justify-start">
              <Link
                to="/"
                className="flex items-center space-x-2"
                onClick={() => {
                  localStorage.clear();
                }}
              >
                <FaSignOutAlt className="text-xl" />
                <span className="hidden sm:block">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Payment</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">Pay your school fees securely using Stripe.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
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
                <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                onClick={handlePayment}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <div className="text-xl sm:text-2xl font-semibold text-purple-600">
              ${totalPayments.toFixed(2)}
            </div>
            <p className="text-gray-600 mt-2">Total amount paid so far.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <motion.div
            className="bg-white shadow-md rounded-lg p-4 sm:p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Payment Instructions</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Step 1:</strong> Enter the amount you wish to pay in the input field above.
              </p>
              <p>
                <strong>Step 2:</strong> Click the "Pay Now" button to proceed to the secure Stripe payment page.
              </p>
              <p>
                <strong>Step 3:</strong> Complete your payment using your credit/debit card or other supported payment methods.
              </p>
              <p>
                <strong>Note:</strong> Payments are processed securely by Stripe. No payment information is stored on our servers.
              </p>
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
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-6 bg-white shadow-md rounded-lg p-4 sm:p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recent Payments</h3>
          {isLoading ? (
            <p className="text-gray-600">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="text-gray-600">No payments found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-purple-800 text-white">
                    <tr>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left">Date</th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left">Amount</th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left">Status</th>
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
                        <td className="px-4 sm:px-6 py-2 sm:py-3">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-2 sm:py-3">
                          ${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-4 sm:px-6 py-2 sm:py-3 text-green-600">
                          {payment.status || 'N/A'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap justify-center space-x-2 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
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

export default Spayment;