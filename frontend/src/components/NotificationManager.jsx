import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const NotificationManager = () => {
  const { isAuthenticated } = useAuth();
  const checkIntervalRef = useRef(null);
  const timeoutRefsRef = useRef([]);
  const notifiedClientsRef = useRef(new Set());
  const scheduledRemindersRef = useRef(new Map());

  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up if user logs out
      cleanup();
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }

    // Initialize reminder system
    initializeReminders();

    // Cleanup on unmount or auth change
    return () => {
      cleanup();
    };
  }, [isAuthenticated]);

  const cleanup = () => {
    // Clear interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // Clear all timeouts
    timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefsRef.current = [];

    // Clear scheduled reminders
    scheduledRemindersRef.current.clear();
  };

  const initializeReminders = async () => {
    try {
      // Fetch all clients
      const response = await api.get('/clients');
      const clients = response.data;

      // Clear previous scheduled reminders
      scheduledRemindersRef.current.clear();

      // Schedule reminders for each client
      clients.forEach(client => {
        if (client.nextWorkDate && client.reminderTime && client.isActive) {
          scheduleReminder(client);
        }
      });

      // Set up interval to check for new/updated clients every 5 minutes
      checkIntervalRef.current = setInterval(async () => {
        try {
          const response = await api.get('/clients');
          const clients = response.data;

          clients.forEach(client => {
            if (client.nextWorkDate && client.reminderTime && client.isActive) {
              const reminderKey = `${client._id}-${client.nextWorkDate}`;
              
              // Only schedule if not already scheduled
              if (!scheduledRemindersRef.current.has(reminderKey)) {
                scheduleReminder(client);
              }
            }
          });
        } catch (error) {
          console.error('Failed to refresh reminders:', error);
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

    } catch (error) {
      console.error('Failed to initialize reminders:', error);
    }
  };

  const scheduleReminder = (client) => {
    if (!client.nextWorkDate || !client.reminderTime) return;

    const reminderKey = `${client._id}-${client.nextWorkDate}`;
    
    // Don't schedule if already notified for this date
    if (notifiedClientsRef.current.has(reminderKey)) return;

    // Parse reminder date and time
    const reminderDate = new Date(client.nextWorkDate);
    const [reminderHour, reminderMinute] = client.reminderTime.split(':').map(Number);
    
    // Set the reminder time
    reminderDate.setHours(reminderHour, reminderMinute, 0, 0);

    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    // Only schedule if reminder is in the future (within next 24 hours)
    if (timeUntilReminder > 0 && timeUntilReminder <= 24 * 60 * 60 * 1000) {
      // Clear any existing timeout for this reminder
      const existingTimeout = scheduledRemindersRef.current.get(reminderKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Schedule the reminder
      const timeoutId = setTimeout(() => {
        triggerReminder(client);
      }, timeUntilReminder);

      scheduledRemindersRef.current.set(reminderKey, timeoutId);
      timeoutRefsRef.current.push(timeoutId);

      console.log(`Reminder scheduled for ${client.name} at ${reminderDate.toLocaleString()}`);
    } else if (timeUntilReminder <= 0) {
      // Reminder time has passed today, check if we should trigger immediately
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reminderDay = new Date(client.nextWorkDate);
      reminderDay.setHours(0, 0, 0, 0);

      // If reminder date is today and time hasn't passed by more than an hour, trigger
      if (reminderDay.getTime() === today.getTime()) {
        const hoursPassed = (now.getTime() - reminderDate.getTime()) / (1000 * 60 * 60);
        if (hoursPassed >= 0 && hoursPassed < 1) {
          triggerReminder(client);
        }
      }
    }
  };

  const triggerReminder = async (client) => {
    const reminderKey = `${client._id}-${client.nextWorkDate}`;
    
    // Check if already notified
    if (notifiedClientsRef.current.has(reminderKey)) return;

    // Mark as notified
    notifiedClientsRef.current.add(reminderKey);

    // Show browser notification
    showNotification(client);

    // Play alarm sound
    playAlarmSound();

    // Auto-reschedule if repeat is enabled
    if (client.repeatAfterDays > 0) {
      await rescheduleReminder(client);
    }

    // Remove from scheduled reminders
    scheduledRemindersRef.current.delete(reminderKey);
  };

  const showNotification = (client) => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification('🔔 Work Reminder', {
        body: `${client.name}\n${client.workDescription || 'Work due today'}\nAmount: ₹${client.totalAmount.toLocaleString()}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `reminder-${client._id}-${Date.now()}`,
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        // Optionally navigate to client detail page
        if (window.location.pathname !== `/client/${client._id}`) {
          window.location.href = `/client/${client._id}`;
        }
      };

      // Auto-close after 15 seconds
      setTimeout(() => {
        notification.close();
      }, 15000);
    } else if (Notification.permission !== 'denied') {
      // Request permission if not yet requested
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotification(client);
        }
      });
    }
  };

  const playAlarmSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a more noticeable alarm sound (3 beeps)
      let beepCount = 0;
      const playBeep = () => {
        if (beepCount >= 3) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Higher frequency for more noticeable sound
        oscillator.frequency.value = 800 + (beepCount * 100);
        oscillator.type = 'sine';

        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        beepCount++;
        
        // Schedule next beep
        if (beepCount < 3) {
          setTimeout(playBeep, 400);
        }
      };

      playBeep();
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
    }
  };

  const rescheduleReminder = async (client) => {
    try {
      if (client.repeatAfterDays > 0) {
        const currentDate = new Date(client.nextWorkDate);
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + client.repeatAfterDays);

        // Update client's next work date
        await api.put(`/clients/${client._id}`, {
          nextWorkDate: nextDate.toISOString()
        });

        // Schedule the new reminder
        const updatedClient = {
          ...client,
          nextWorkDate: nextDate.toISOString()
        };
        scheduleReminder(updatedClient);

        console.log(`Reminder rescheduled for ${client.name} to ${nextDate.toLocaleDateString()}`);
      }
    } catch (error) {
      console.error('Failed to reschedule reminder:', error);
    }
  };

  // Clear notified clients at midnight
  useEffect(() => {
    if (!isAuthenticated) return;

    const clearNotifiedAtMidnight = () => {
      notifiedClientsRef.current.clear();
      scheduledRemindersRef.current.clear();
      console.log('Cleared reminder notifications for new day');
    };

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      clearNotifiedAtMidnight();
      // Set up daily clearing
      const dailyInterval = setInterval(() => {
        clearNotifiedAtMidnight();
      }, 24 * 60 * 60 * 1000);
      
      timeoutRefsRef.current.push(dailyInterval);
    }, msUntilMidnight);

    timeoutRefsRef.current.push(midnightTimeout);

    return () => {
      clearTimeout(midnightTimeout);
    };
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
};

export default NotificationManager;
