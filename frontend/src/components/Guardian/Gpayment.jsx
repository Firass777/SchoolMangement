import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaBell, FaSignOutAlt, FaEnvelope, FaIdCard, FaCreditCard, FaMoneyCheck } from 'react-icons/fa';
import { motion } from 'framer-motion'; 

const Gpayment = () => {
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

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      const childrenNin = JSON.parse(user.children_nin || '[]');
      if (childrenNin.length > 0) {
        fetch(`http://localhost:8000/api/get-children?nins=${childrenNin.join(',')}`)
          .then(response => response.json())
          .then(data => setChildren(data))
          .catch(error => console.error('Error fetching children:', error));
      }
      
      fetchPayments(currentPage);
      fetchAllPayments();
      fetchSummary();
    }
  }, [currentPage]);

  const fetchPayments = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/get-parent-payments?page=${page}&user=${JSON.stringify(user)}`);
      const data = await response.json();
  
      if (response.ok) {
        setPayments(data.payments.data);
        setTotalPages(data.payments.last_page);
      } else {
        alert(data.error || 'Failed to fetch payments.');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAllPayments = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/get-all-parent-payments?user=${JSON.stringify(user)}`);
      const data = await response.json();
  
      if (response.ok) {
        setAllPayments(data.payments);
        setTotalPayments(data.totalPayments);
      } else {
        alert(data.error || 'Failed to fetch all payments.');
      }
    } catch (error) {
      console.error('Error fetching all payments:', error);
    }
  };
  
  const fetchSummary = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/get-parent-payment-summary?user=${JSON.stringify(user)}`);
      const data = await response.json();
  
      if (response.ok) {
        setSummary(data);
      } else {
        alert(data.error || 'Failed to fetch payment summary.');
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
      const response = await fetch('http://localhost:8000/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: amount,
          student_nin: selectedChild
        }),
      });
  
      const { url } = await response.json();
      
      const paymentDetails = {
        user_id: user.id,
        student_nin: selectedChild,
        amount: amount,
        created_at: new Date().toISOString(),
        stripe_payment_id: 'temp_id',
        status: 'pending',
      };
      localStorage.setItem('latestPayment', JSON.stringify(paymentDetails));
  
      window.location.href = url;
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
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
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
              <li className="px-6 py-3 hover:bg-orange-700">
                <Link to="/notifications" className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
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

        <main className="flex-1 p-6 overflow-auto min-h-screen">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Payment </h2>
            <p className="text-lg text-gray-600 mt-2">Pay your children's school fees securely using Stripe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              className="bg-white shadow-md rounded-lg p-6"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Total</h3>
              <div className="text-2xl font-semibold text-orange-600">
                ${totalPayments.toFixed(2)}
              </div>
              <p className="text-gray-600 mt-2">Total amount paid for all children.</p>
            </motion.div>
          </div>

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                className="bg-white shadow-md rounded-lg p-6"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Children Payment Summary</h3>
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
                  <p>
                    <strong>Total Amount Due:</strong> ${summary?.amount_due?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

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
                </div>

                <div className="mt-4 flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md ${
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
    </div>
  );
};

export default Gpayment;