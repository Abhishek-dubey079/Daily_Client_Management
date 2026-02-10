import { useState } from 'react';
import api from '../utils/api';

const TaskCompletionModal = ({ client, onClose, onComplete }) => {
    const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isFullPayment, setIsFullPayment] = useState(true);
    const [notes, setNotes] = useState('');
    const [nextTotalAmount, setNextTotalAmount] = useState(client.totalAmount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post(`/clients/${client._id}/complete-cycle`, {
                completionDate,
                paymentAmount: isFullPayment ? client.totalAmount : parseFloat(paymentAmount),
                notes,
                isFullPayment,
                nextTotalAmount
            });
            onComplete();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Task Completed</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-200">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Completion
                        </label>
                        <input
                            type="date"
                            value={completionDate}
                            onChange={(e) => setCompletionDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Payment for this cycle</p>
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="isFull"
                                checked={isFullPayment}
                                onChange={(e) => {
                                    setIsFullPayment(e.target.checked);
                                    if (e.target.checked) setPaymentAmount(client.totalAmount);
                                }}
                                className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <label htmlFor="isFull" className="text-sm text-gray-700">Full Payment (₹{client.totalAmount})</label>
                        </div>

                        {!isFullPayment && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Amount Received (₹)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            {isFullPayment ? 'Marked as Green' : 'Marked as Partial'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Next Cycle Amount (optional)
                        </label>
                        <input
                            type="number"
                            value={nextTotalAmount}
                            onChange={(e) => setNextTotalAmount(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Keep same or change"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Work History Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            rows="2"
                            placeholder="e.g. Completed maintenance, pending filter change"
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-md"
                        >
                            {loading ? 'Saving...' : 'Confirm Completed'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskCompletionModal;
