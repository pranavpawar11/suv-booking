import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiCalendar,
  FiUser,
  FiFileText,
} from 'react-icons/fi';
import paymentService from '../../../api/services/paymentService';
import Loader from '../../../components/common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentById(id);
      setPayment(response.data.payment);
      setRefundAmount(response.data.payment?.amount || '');
    } catch (error) {
      console.error('Error fetching payment:', error);
      toast.error('Failed to load payment details');
      navigate('/admin/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (!refundReason.trim()) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      setProcessing(true);
      await paymentService.initiateRefund(id, parseFloat(refundAmount), refundReason);
      toast.success('Refund initiated successfully!');
      setShowRefundModal(false);
      fetchPaymentDetails();
    } catch (error) {
      console.error('Error initiating refund:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate refund');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      created: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeColor = (type) => {
    const colors = {
      advance: 'bg-blue-500',
      remaining: 'bg-indigo-500',
      refund: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  if (!payment) return null;

  const canRefund = payment.status === 'paid' && payment.type !== 'refund';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/payments')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Payments
        </button>
        {canRefund && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Initiate Refund
          </button>
        )}
      </div>

      {/* Payment Header Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div
          className={`${getTypeColor(payment.type)} h-2`}
        ></div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{payment.paymentId}</h1>
              <p className="text-gray-600 mt-1">
                Created on {format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full border-2 ${getStatusColor(
                payment.status
              )}`}
            >
              {payment.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{payment.amount?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{payment.type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Method</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{payment.method}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Currency</p>
              <p className="text-lg font-semibold text-gray-900">{payment.currency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiUser className="mr-2" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{payment.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{payment.user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{payment.user?.phone}</p>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiFileText className="mr-2" />
            Booking Information
          </h2>
          {payment.booking ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-medium text-gray-900">{payment.booking.bookingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pickup Location</p>
                <p className="font-medium text-gray-900 text-sm">
                  {payment.booking.pickup?.address || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Drop Location</p>
                <p className="font-medium text-gray-900 text-sm">
                  {payment.booking.drop?.address || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/admin/bookings/${payment.booking._id}`)}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View Booking Details →
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No booking information available</p>
          )}
        </div>

        {/* Razorpay Details */}
        {payment.razorpay && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="mr-2" />
              Razorpay Details
            </h2>
            <div className="space-y-3">
              {payment.razorpay.orderId && (
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono text-sm text-gray-900">{payment.razorpay.orderId}</p>
                </div>
              )}
              {payment.razorpay.paymentId && (
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{payment.razorpay.paymentId}</p>
                </div>
              )}
              {payment.razorpay.signature && (
                <div>
                  <p className="text-sm text-gray-600">Signature</p>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {payment.razorpay.signature}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiCalendar className="mr-2" />
            Transaction Timeline
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FiFileText className="text-blue-600 text-sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>

            {payment.paidAt && (
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <FiCheckCircle className="text-green-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Paid</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(payment.paidAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
            )}

            {payment.refund?.processedAt && (
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <FiXCircle className="text-purple-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Refunded</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(payment.refund.processedAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Amount: ₹{payment.refund.amount}</p>
                  <p className="text-xs text-gray-600">Reason: {payment.refund.reason}</p>
                </div>
              </div>
            )}

            {payment.failureReason && (
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <FiXCircle className="text-red-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Failed</p>
                  <p className="text-xs text-red-600">{payment.failureReason.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Initiate Refund</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={payment.amount}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₹{payment.amount}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Enter reason for refund..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Initiate Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;