import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaBook, FaEnvelope, FaClock, FaIdCard, FaFileInvoice, FaCreditCard, FaMoneyCheck } from 'react-icons/fa';
import { motion } from 'framer-motion'; 

const Spayment = () => {
  const [amount, setAmount] = useState('');
  const [payments, setPayments] = useState([]); 
  const [allPayments, setAllPayments] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch paginated payments from the backend
  const fetchPayments = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/get-payments?user_id=${user.id}&page=${page}`);
      const data = await response.json();

      if (response.ok) {
        setPayments(data.payments.data);
        setTotalPages(data.payments.last_page);
      } else {
        alert('Failed to fetch payments.');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all payments for the summary
  const fetchAllPayments = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/get-all-payments?user_id=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setAllPayments(data.payments);
        setTotalPayments(data.totalPayments);
      } else {
        alert('Failed to fetch all payments.');
      }
    } catch (error) {
      console.error('Error fetching all payments:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && !isLoading) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments(currentPage);
      fetchAllPayments(); 
    }
  }, [currentPage]);

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
        amount: amount,
        created_at: new Date().toISOString(),
        stripe_payment_id: 'temp_id', // Replace with actual ID after payment
        status: 'pending',
      };
      localStorage.setItem('latestPayment', JSON.stringify(paymentDetails));
  
      // Redirect to payment URL
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Calculate payment statistics using all payments
  const totalPaymentsCount = allPayments.length;
  const averagePaymentAmount = totalPaymentsCount > 0 ? (totalPayments / totalPaymentsCount).toFixed(2) : 0;
  const lastPaymentDate = totalPaymentsCount > 0 ? new Date(allPayments[0].created_at).toLocaleDateString() : 'N/A';

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

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-purple-800 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <nav className="mt-6">
            <ul>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studentdb" className="flex items-center space-x-2">
                  <FaUserGraduate />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/spayment" className="flex items-center space-x-2">
                  <FaMoneyCheck />
                  <span>Payment</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/stimetable" className="flex items-center space-x-2">
                  <FaClock />
                  <span>Time-Table</span>
                </Link>
              </li>              
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/gradesview" className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Grades</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/attendanceview" className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Attendance</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/courseview" className="flex items-center space-x-2">
                  <FaBook  />
                  <span>Courses</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/studenteventview" className="flex items-center space-x-2">
                  <FaCalendarAlt /> <span>Events</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/semails" className="flex items-center space-x-2">
                  <FaEnvelope />
                  <span>Emails</span>
                </Link>
              </li>     
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/documents" className="flex items-center space-x-2">
                  <FaFileInvoice /> <span>Documents</span>
                </Link>
              </li>                                   
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/notificationview" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
              <li className="px-6 py-3 hover:bg-purple-700">
                <Link to="/seditprofile" className="flex items-center space-x-2">
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

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Payment Portal</h2>
            <p className="text-lg text-gray-600 mt-2">Pay your school fees securely using Stripe.</p>
          </div>

          {/* Grid Layout for Payment Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Make a Payment Section */}
            <motion.div
              className="bg-white shadow-md rounded-lg p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Make a Payment</h3>
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

            {/* Payment Total Section */}
            <motion.div
              className="bg-white shadow-md rounded-lg p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Total</h3>
              <div className="text-2xl font-semibold text-purple-600">
                ${totalPayments.toFixed(2)}
              </div>
              <p className="text-gray-600 mt-2">Total amount paid so far.</p>
            </motion.div>
          </div>

          {/* Grid Layout for Payment Instructions and Payment History Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Payment Instructions Section */}
            <motion.div
              className="bg-white shadow-md rounded-lg p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Instructions</h3>
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

            {/* Payment History Summary Section */}
            <motion.div
              className="bg-white shadow-md rounded-lg p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment History Summary</h3>
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

          {/* Recent Payments Section */}
          <motion.div
            className="mt-6 bg-white shadow-md rounded-lg p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Payments</h3>
            {isLoading ? (
              <p className="text-gray-600">Loading payments...</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-purple-800 text-white">
                      <tr>
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
                          <td className="px-6 py-3">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3">${payment.amount}</td>
                          <td className="px-6 py-3 text-green-600">{payment.status}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center space-x-2">
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
    </div>
  );
};

export default Spayment;