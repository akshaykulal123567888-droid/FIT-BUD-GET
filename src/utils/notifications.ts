import { NotificationSettings } from '../../server/db';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: string;
  read: boolean;
  type: 'meal' | 'workout' | 'water' | 'checkin' | 'sleep' | 'progress';
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Dispatches a notification via Browser API (if granted) and returns in-app fallback
 */
export function sendNotification(title: string, body: string, icon = '💪'): InAppNotification {
  const notif: InAppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    body,
    icon,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    type: 'meal',
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.warn('System notification failed, falling back to in-app toast:', e);
    }
  }

  return notif;
}

/**
 * Checks scheduled reminders against current local time and triggers alerts
 */
export function checkScheduledReminders(
  settings: NotificationSettings | undefined,
  alreadyTriggeredToday: Set<string>,
  onTrigger: (notif: InAppNotification, reminderKey: string) => void
): void {
  if (!settings || !settings.enabled) return;

  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  const dateStr = now.toISOString().split('T')[0];

  const check = (
    key: string,
    enabled: boolean,
    targetTime: string,
    title: string,
    body: string,
    icon: string,
    type: InAppNotification['type']
  ) => {
    if (!enabled || !targetTime) return;
    const triggerId = `${dateStr}-${key}-${targetTime}`;
    if (alreadyTriggeredToday.has(triggerId)) return;

    // Trigger within a 2-minute matching window
    if (targetTime === currentTime) {
      alreadyTriggeredToday.add(triggerId);
      const notif = sendNotification(title, body, icon);
      notif.type = type;
      onTrigger(notif, triggerId);
    }
  };

  check('breakfast', settings.breakfastReminder, settings.breakfastTime, '🍳 Breakfast Reminder', 'Time for your energizing, budget-friendly breakfast!', '🍳', 'meal');
  check('lunch', settings.lunchReminder, settings.lunchTime, '🥗 Lunch Time', 'Your planned nutritious lunch is coming up.', '🥗', 'meal');
  check('dinner', settings.dinnerReminder, settings.dinnerTime, '🍲 Dinner Reminder', 'Time for dinner! Keep it balanced and within your calorie target.', '🍲', 'meal');
  check('workout', settings.workoutReminder, settings.workoutTime, '🏋️ Workout Reminder', 'Your workout is scheduled now! Lace up and get ready.', '🏋️', 'workout');
  check('checkin', settings.checkInReminder, settings.checkInTime, '📊 Daily Check-in', 'Take 30 seconds to log today’s meals, water, and workout wins!', '📊', 'checkin');
  check('sleep', settings.sleepReminder, settings.sleepTime, '😴 Rest & Recovery Reminder', 'Your planned sleep time is approaching. Dim screens and wind down.', '😴', 'sleep');
}
