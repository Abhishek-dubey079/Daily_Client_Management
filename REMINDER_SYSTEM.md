# Reminder System Documentation

## Overview

The reminder system provides automatic browser notifications and sound alarms for client work reminders. It uses `setTimeout` and `setInterval` to schedule and check reminders efficiently.

## Features

✅ **Stores reminder date & time** - Stored in MongoDB (nextWorkDate + reminderTime)  
✅ **Uses setTimeout/setInterval** - Efficient scheduling with automatic cleanup  
✅ **Browser notifications** - Native browser notifications with click-to-focus  
✅ **Alarm sound** - 3-beep audio alarm using Web Audio API  
✅ **Auto-reschedule** - Automatically reschedules based on repeatAfterDays  

## How It Works

### 1. Data Storage

Reminders are stored in the `Client` model:
- `nextWorkDate` (Date) - The date when work is due
- `reminderTime` (String) - Time in "HH:MM" format (24-hour)
- `repeatAfterDays` (Number) - Days to repeat after (0 = no repeat)

### 2. Scheduling System

The `NotificationManager` component:

1. **Initialization**: On login, fetches all clients and schedules reminders
2. **setTimeout**: Each reminder gets its own `setTimeout` for precise timing
3. **setInterval**: Checks for new/updated clients every 5 minutes
4. **Cleanup**: Automatically clears timeouts on logout or component unmount

### 3. Reminder Trigger

When a reminder time arrives:
1. Browser notification is shown (if permission granted)
2. Alarm sound plays (3 beeps)
3. Client is marked as notified (prevents duplicates)
4. Auto-reschedules if `repeatAfterDays > 0`

### 4. Auto-Rescheduling

If `repeatAfterDays` is set:
- After triggering, calculates next date: `nextWorkDate + repeatAfterDays`
- Updates client in database
- Schedules new reminder automatically

## Usage

### Setting Up a Reminder

When creating/editing a client:

```javascript
{
  name: "John Doe",
  nextWorkDate: "2024-01-20",  // Date when work is due
  reminderTime: "09:00",        // Time to remind (24-hour format)
  repeatAfterDays: 7            // Repeat every 7 days (0 = no repeat)
}
```

### Browser Notifications

**Permission Request:**
- Automatically requests permission on first load
- User must grant permission for notifications to work
- Works even when browser tab is in background

**Notification Features:**
- Shows client name and work description
- Displays total amount
- Click notification to navigate to client detail page
- Auto-closes after 15 seconds

### Alarm Sound

- Uses Web Audio API (works in modern browsers)
- Plays 3 beeps with increasing frequency
- Volume: 30% (not too loud)
- Duration: ~1.2 seconds total

## API Endpoints

### Get Upcoming Reminders
```
GET /clients/reminders/upcoming
```
Returns clients with reminders in the next 24 hours.

### Update Client (for rescheduling)
```
PUT /clients/:id
{
  nextWorkDate: "2024-01-27T00:00:00.000Z"
}
```

## Technical Details

### Scheduling Algorithm

```javascript
// Calculate time until reminder
const reminderDate = new Date(client.nextWorkDate);
reminderDate.setHours(reminderHour, reminderMinute, 0, 0);
const timeUntilReminder = reminderDate.getTime() - now.getTime();

// Schedule if in next 24 hours
if (timeUntilReminder > 0 && timeUntilReminder <= 24 * 60 * 60 * 1000) {
  setTimeout(() => triggerReminder(client), timeUntilReminder);
}
```

### Memory Management

- Uses `useRef` to store timeout IDs
- Cleans up all timeouts on unmount
- Clears notified clients at midnight
- Prevents duplicate notifications with Set tracking

### Performance

- Only schedules reminders within 24 hours
- Checks for updates every 5 minutes (not every second)
- Uses Map for O(1) lookup of scheduled reminders
- Efficient date comparisons

## Testing

### Test Reminder Immediately

1. Create a client with:
   - `nextWorkDate`: Today's date
   - `reminderTime`: Current time + 1 minute (e.g., if it's 10:30, set to "10:31")
   - `repeatAfterDays`: 0 (for testing)

2. Wait for the reminder to trigger

3. Check:
   - Browser notification appears
   - Alarm sound plays
   - Console shows "Reminder scheduled" message

### Test Auto-Reschedule

1. Create a client with:
   - `nextWorkDate`: Today's date
   - `reminderTime`: Current time + 1 minute
   - `repeatAfterDays`: 7

2. Wait for reminder to trigger

3. Check:
   - Notification and alarm trigger
   - Client's `nextWorkDate` is updated to +7 days
   - New reminder is scheduled automatically

## Troubleshooting

### Notifications Not Showing

1. **Check Permission**: Browser may have denied permission
   - Chrome: Click lock icon → Site settings → Notifications
   - Firefox: Click lock icon → Permissions → Notifications

2. **Check Console**: Look for errors in browser console

3. **Verify Data**: Ensure `nextWorkDate` and `reminderTime` are set correctly

### Alarm Not Playing

1. **Browser Support**: Web Audio API may not be supported
   - Try Chrome, Firefox, or Edge (latest versions)

2. **Audio Context**: Some browsers require user interaction first
   - Try clicking on the page before reminder triggers

3. **Volume**: Check system volume and browser tab volume

### Reminders Not Rescheduling

1. **Check repeatAfterDays**: Must be > 0
2. **Check API**: Verify PUT request to `/clients/:id` succeeds
3. **Check Console**: Look for "Failed to reschedule reminder" errors

## Best Practices

1. **Set Realistic Times**: Don't set reminders in the past
2. **Use 24-hour Format**: Always use "HH:MM" format (e.g., "09:00", "14:30")
3. **Test First**: Test with a reminder 1-2 minutes in the future
4. **Monitor Console**: Check browser console for scheduling messages
5. **Grant Permissions**: Ensure notification permission is granted

## Future Enhancements

Possible improvements:
- Email notifications
- SMS notifications
- Multiple reminder times per client
- Custom alarm sounds
- Reminder history/log
- Snooze functionality



