import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const Receipt = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [userType, setUserType] = useState('student');
  const user = JSON.parse(localStorage.getItem('user'));

  // Color scheme based on user type
  const colorScheme = {
    student: {
      primary: 'purple-900',
      secondary: 'purple-600',
      button: 'purple-600',
      buttonHover: 'purple-700'
    },
    parent: {
      primary: 'orange-700',
      secondary: 'orange-600',
      button: 'orange-600',
      buttonHover: 'orange-700'
    }
  };

  useEffect(() => {
    const latestPayment = JSON.parse(localStorage.getItem('latestPayment'));
    if (latestPayment) {
      setPaymentDetails(latestPayment);
      
      if (latestPayment.student_nin || user?.children_nin) {
        setUserType('parent');
      } else {
        setUserType('student');
      }
    }
  }, []);

  if (!paymentDetails) {
    return <div className="flex justify-center items-center h-screen">Loading receipt...</div>;
  }

  const handleDownloadPDF = () => {
    const element = document.getElementById('receipt');
    const options = {
      margin: 10,
      filename: `receipt_${user.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const downloadButton = document.querySelector('.download-button');
    const backLink = document.querySelector('.back-link');
    if (downloadButton) downloadButton.style.display = 'none';
    if (backLink) backLink.style.display = 'none';

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        if (downloadButton) downloadButton.style.display = 'flex';
        if (backLink) backLink.style.display = 'block';
      });
  };

  const currentColors = colorScheme[userType];
  const dashboardLink = userType === 'parent' ? '/guardiandb' : '/studentdb';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6`}>
      <div 
        id="receipt" 
        className={`bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl border-t-4 border-${currentColors.primary}`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="src/images/logo.JPG" alt="School Logo" className="h-25" />
        </div>

        {/* Receipt Header */}
        <h1 className={`text-3xl font-bold text-center text-${currentColors.primary} mb-6`}>
          Payment Receipt
        </h1>

        {/* Receipt Details */}
        <div className="space-y-4 mb-6">
          {userType === 'parent' && paymentDetails.student_nin && (
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Student NIN:</span>
              <span>{paymentDetails.student_nin}</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Name:</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">NIN:</span>
            <span>{user.nin}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Amount Paid:</span>
            <span>${paymentDetails.amount}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Payment Date:</span>
            <span>{new Date(paymentDetails.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Transaction Reference:</span>
            <span>School Fees Payment</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Payment Method:</span>
            <span>Credit/Debit Card</span>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-8 flex justify-end">
          <div className="text-center">
            <img src="src/images/signature.png" alt="Signature" className="h-20" />
            <p className="text-sm text-gray-600 mt-2">Authorized Signature</p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className={`mt-8 text-center text-${currentColors.primary} italic`}>
          <p>Thank you for your payment. This receipt confirms your transaction.</p>
          {userType === 'parent' && (
            <p className="mt-2">Payment made for your child's school fees.</p>
          )}
        </div>

        {/* Download PDF Button */}
        <div className="mt-8 flex justify-center download-button">
          <button
            onClick={handleDownloadPDF}
            className={`flex items-center px-4 py-2 bg-${currentColors.button} text-white rounded-md hover:bg-${currentColors.buttonHover}`}
          >
            <FaDownload className="mr-2" />
            Download PDF
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center back-link">
          <Link 
            to={dashboardLink} 
            className={`text-${currentColors.secondary} hover:underline`}
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Receipt;