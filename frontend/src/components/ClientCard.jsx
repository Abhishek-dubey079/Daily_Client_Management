import { formatReminderDateTime, isReminderToday } from '../utils/reminderUtils';

const ClientCard = ({ client, onEdit, onDelete, onPayment, onTaskComplete, onView }) => {
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

  const hasUpcomingReminder = () => {
    if (!client.nextWorkDate || !client.reminderTime) return false;
    const reminderDate = new Date(client.nextWorkDate);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return reminderDate >= now && reminderDate <= tomorrow;
  };

  const isUrgent = () => {
    if (!client.nextWorkDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDate = new Date(client.nextWorkDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  const isReminderDue = hasUpcomingReminder() && isReminderToday(client.nextWorkDate);
  const urgent = isUrgent();

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 ${urgent ? 'ring-2 ring-red-500 bg-red-50' : isReminderDue ? 'ring-2 ring-yellow-400' : ''
      }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-semibold text-gray-900">{client.name}</h3>
            {isReminderDue && !urgent && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                🔔 Reminder
              </span>
            )}
            {urgent && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white animate-bounce">
                🚨 URGENT
              </span>
            )}
          </div>
          {client.mobile && (
            <p className="text-sm text-gray-600 mt-1">📱 {client.mobile}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            client.status
          )}`}
        >
          {client.status}
        </span>
      </div>

      {client.address && (
        <p className="text-sm text-gray-600 mb-2">📍 {client.address}</p>
      )}

      {client.workDescription && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {client.workDescription}
        </p>
      )}

      {client.nextWorkDate && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            📅 Next Work: {new Date(client.nextWorkDate).toLocaleDateString()}
          </p>
          {client.reminderTime && (
            <p className={`text-xs mt-1 ${isReminderDue ? 'text-yellow-600 font-semibold' : 'text-gray-500'}`}>
              🔔 Reminder: {formatReminderDateTime(client.nextWorkDate, client.reminderTime)}
            </p>
          )}
        </div>
      )}

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold">₹{client.totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Received:</span>
          <span className="text-green-600">₹{client.receivedAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-gray-700">Remaining:</span>
          <span className="text-red-600">₹{client.remainingAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mt-4 pt-4 border-t">
        <button
          onClick={onView}
          className="col-span-2 sm:col-span-1 sm:flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm transition-colors"
        >
          View
        </button>
        <button
          onClick={onPayment}
          className="col-span-1 sm:flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm transition-colors"
        >
          Payment
        </button>
        <button
          onClick={onTaskComplete}
          className="col-span-1 sm:flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 text-sm font-bold transition-colors"
        >
          Done
        </button>
        <button
          onClick={onEdit}
          className="col-span-1 sm:flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="col-span-1 sm:flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ClientCard;

