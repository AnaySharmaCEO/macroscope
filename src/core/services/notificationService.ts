/**
 * MACROSCOPE PERFORMANCE OS - NOTIFICATION SERVICE
 * Manages daily scheduling and system alerts across platforms
 */

import { isElectron, isMobile } from '../utils/platform';

// For Mobile (Expo)
let Notifications: any = null;
if (isMobile) {
  // Extracting to a variable prevents Vite's static analyzer from crashing
  const expoPkg = 'expo-notifications';
  import(/* @vite-ignore */ expoPkg).then((mod) => {
    Notifications = mod;
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (e) {
      console.warn('Failed to set notification handler', e);
    }
  }).catch(() => {});
}

class NotificationService {
  /**
   * Request permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (isMobile && Notifications) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    }

    if (isElectron || typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Schedule daily performance protocol reminders
   */
  async scheduleDailyNotifications() {
    if (isMobile && Notifications) {
      // Clear existing to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Morning Review (08:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MORNING PROTOCOL',
          body: 'System review: Calibrate sleep and nutrition for optimal performance.',
          data: { screen: 'Sleep' },
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        },
      });

      // Afternoon Baseline (14:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SYSTEM UPDATE',
          body: 'Hydration and activity baseline check. Ensure protocols are met.',
          data: { screen: 'Activity' },
        },
        trigger: {
          hour: 14,
          minute: 0,
          repeats: true,
        },
      });

      // Evening Summary (20:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'EVENING RECOVERY',
          body: 'Final nutrition data required. Lock in your sleep window.',
          data: { screen: 'Nutrition' },
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
    } else {
      console.log('Daily scheduling not implemented for Web/Desktop yet (requires Service Workers or Main Process persistence)');
    }
  }

  /**
   * Push a system signal notification (Sticky for Critical)
   */
  async notifySignal(title: string, body: string, severity: 'high' | 'medium' | 'low') {
    const formattedTitle = `SIGNAL: ${title.toUpperCase()}`;

    if (isMobile && Notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: formattedTitle,
          body,
          sound: 'default',
          priority: severity === 'high' ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.DEFAULT,
          data: { screen: 'Alerts' },
        },
        trigger: null, // Immediate
      });
    } else if (isElectron && (window as any).electron) {
      // Use native Electron notification via bridge
      (window as any).electron.sendNotification({
        title: formattedTitle,
        body,
        silent: severity === 'low'
      });
    } else if (typeof Notification !== 'undefined') {
      // Standard Web Notification
      new Notification(formattedTitle, { body });
    }
  }

  /**
   * Test notification trigger
   */
  async testNotification() {
    const title = 'MACROSCOPE TEST';
    const body = 'Performance OS notification link verified.';

    if (isMobile && Notifications) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });
    } else if (isElectron && (window as any).electron) {
      (window as any).electron.sendNotification({ title, body });
    } else if (typeof Notification !== 'undefined') {
      new Notification(title, { body });
    }
  }
}

export const notificationService = new NotificationService();
