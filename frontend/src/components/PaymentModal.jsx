import { useState } from 'react';
import api from '../utils/api';

const PaymentModal = ({ client, onClose }) => {
  const [amount, setAmount] = useState('');
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFullPayment && (!amount || parseFloat(amount) <= 0)) {
      setError('Please enter a valid amount');
      return;
    }

    if (isFullPayment && client.remainingAmount <= 0) {
      setError('This client has already been paid in full');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/clients/${client._id}/payment`, {
        amount: isFullPayment ? undefined : parseFloat(amount),
        notes,
        isFullPayment
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Client</p>
            <p className="font-semibold text-gray-900">{client.name}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-semibold">₹{client.totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Received:</span>
                <span className="ml-2 text-green-600">₹{client.receivedAmount.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Remaining:</span>
                <span className="ml-2 font-semibold text-red-600">
                  ₹{client.remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFullPayment}
                onChange={(e) => {
                  setIsFullPayment(e.target.checked);
                  if (e.target.checked) {
                    setAmount(client.remainingAmount.toString());
                  }
                }}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as Full Payment (₹{client.remainingAmount.toLocaleString()})
              </span>
            </label>
          </div>

          {!isFullPayment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={client.remainingAmount}
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₹{client.remainingAmount.toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Add any notes about this payment"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;

