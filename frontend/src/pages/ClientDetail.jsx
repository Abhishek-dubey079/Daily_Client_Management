import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ClientForm from '../components/ClientForm';
import PaymentModal from '../components/PaymentModal';
import TaskCompletionModal from '../components/TaskCompletionModal';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const clientRes = await api.get(`/clients/${id}`);
      setClient(clientRes.data);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      alert('Failed to load client data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClose = () => {
    setShowEditForm(false);
    fetchClientData();
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    fetchClientData();
  };

  const handleMarkComplete = () => {
    setShowCompletionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Client not found</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Client Details</h1>
            </div>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h2>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  client.status
                )}`}
              >
                {client.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Record Payment
              </button>
              {client.status !== 'Completed' && (
                <button
                  onClick={handleMarkComplete}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => setShowEditForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit Client
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
              <div className="space-y-2">
                {client.mobile && (
                  <p className="text-sm">
                    <span className="font-medium">Mobile:</span> {client.mobile}
                  </p>
                )}
                {client.address && (
                  <p className="text-sm">
                    <span className="font-medium">Address:</span> {client.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Work Information</h3>
              <div className="space-y-2">
                {client.workDescription && (
                  <p className="text-sm">
                    <span className="font-medium">Description:</span> {client.workDescription}
                  </p>
                )}
                {client.workDate && (
                  <p className="text-sm">
                    <span className="font-medium">Work Date:</span>{' '}
                    {new Date(client.workDate).toLocaleDateString()}
                  </p>
                )}
                {client.nextWorkDate && (
                  <p className="text-sm">
                    <span className="font-medium">Next Work Date:</span>{' '}
                    {new Date(client.nextWorkDate).toLocaleDateString()}
                  </p>
                )}
                {client.repeatAfterDays > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Repeat After:</span> {client.repeatAfterDays} days
                  </p>
                )}
                {client.reminderTime && (
                  <p className="text-sm">
                    <span className="font-medium">Reminder Time:</span> {client.reminderTime}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Client History Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Work & Payment History</h3>
          <div className="space-y-4">
            {client.history && client.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...client.history].reverse().map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {item.type}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-semibold">
                          ₹{item.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 italic">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 italic">
                No history recorded yet.
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{new Date(client.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEditForm && (
        <ClientForm client={client} onClose={handleEditClose} />
      )}

      {showPaymentModal && (
        <PaymentModal client={client} onClose={handlePaymentClose} />
      )}

      {showCompletionModal && (
        <TaskCompletionModal
          client={client}
          onClose={() => setShowCompletionModal(false)}
          onComplete={fetchClientData}
        />
      )}
    </div>
  );
};

export default ClientDetail;

