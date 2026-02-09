/**
 * Utility functions for reminder system
 */

/**
 * Calculate time until reminder in milliseconds
 * @param {Date} reminderDate - The date of the reminder
 * @param {string} reminderTime - Time in "HH:MM" format
 * @returns {number} Milliseconds until reminder, or null if invalid
 */
export const calculateTimeUntilReminder = (reminderDate, reminderTime) => {
  if (!reminderDate || !reminderTime) return null;

  try {
    const date = new Date(reminderDate);
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    date.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    return diff > 0 ? diff : null;
  } catch (error) {
    console.error('Error calculating reminder time:', error);
    return null;
  }
};

/**
 * Check if reminder date is today
 * @param {Date|string} reminderDate - The reminder date
 * @returns {boolean}
 */
export const isReminderToday = (reminderDate) => {
  if (!reminderDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminder = new Date(reminderDate);
  reminder.setHours(0, 0, 0, 0);

  return today.getTime() === reminder.getTime();
};

/**
 * Format reminder date and time for display
 * @param {Date|string} reminderDate - The reminder date
 * @param {string} reminderTime - Time in "HH:MM" format
 * @returns {string} Formatted string
 */
export const formatReminderDateTime = (reminderDate, reminderTime) => {
  if (!reminderDate || !reminderTime) return 'Not set';

  try {
    const date = new Date(reminderDate);
    const [hours, minutes] = reminderTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const isToday = isReminderToday(reminderDate);
    const isPast = date.getTime() < now.getTime();

    if (isToday && isPast) {
      return `Today at ${reminderTime} (passed)`;
    } else if (isToday) {
      return `Today at ${reminderTime}`;
    } else {
      return `${date.toLocaleDateString()} at ${reminderTime}`;
    }
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Calculate next reminder date based on repeat days
 * @param {Date|string} currentDate - Current reminder date
 * @param {number} repeatAfterDays - Number of days to repeat
 * @returns {Date} Next reminder date
 */
export const calculateNextReminderDate = (currentDate, repeatAfterDays) => {
  if (!currentDate || !repeatAfterDays || repeatAfterDays <= 0) {
    return null;
  }

  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + repeatAfterDays);
  return nextDate;
};



