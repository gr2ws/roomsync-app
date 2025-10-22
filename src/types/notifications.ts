/**
 * Notification Types and Message Generator
 *
 * This file defines the notification types and provides utility functions
 * to generate user-friendly messages for each notification type.
 */

export type NotificationType =
  | 'rental_application_rejected'
  | 'rental_application_cancelled'
  | 'rental_application_accepted'
  | 'rental_application_completed'
  | 'user_account_warned'
  | 'user_account_verified'
  | 'rental_ended'
  | 'new_rental_application'
  | 'property_verified'
  | 'new_review'
  | 'new_property_submission'
  | 'new_report'
  | 'new_registration';

export interface Notification {
  notif_id: number;
  notif_type: NotificationType;
  created_at: string;
  user_auth_id: string;
}

/**
 * Notification message configuration for each notification type
 */
export const notificationMessages: Record<
  NotificationType,
  {
    title: string;
    message: string;
    icon: string; // Can be used with lucide-react-native icons
  }
> = {
  rental_application_rejected: {
    title: 'Application Rejected',
    message: 'Your rental application has been rejected by the property owner.',
    icon: 'XCircle',
  },
  rental_application_cancelled: {
    title: 'Application Cancelled',
    message: 'A rental application has been cancelled.',
    icon: 'Ban',
  },
  rental_application_accepted: {
    title: 'Application Accepted!',
    message: 'Congratulations! Your rental application has been approved.',
    icon: 'CheckCircle',
  },
  rental_application_completed: {
    title: 'Rental Completed',
    message: 'Your rental period has been completed.',
    icon: 'CheckCheck',
  },
  user_account_warned: {
    title: 'Account Warning',
    message: 'Your account has received a warning. Please review our community guidelines.',
    icon: 'AlertTriangle',
  },
  user_account_verified: {
    title: 'Account Verified!',
    message: 'Your account has been verified.',
    icon: 'BadgeCheck',
  },
  rental_ended: {
    title: 'Rental Ended',
    message: 'A rental agreement has ended.',
    icon: 'Home',
  },
  new_rental_application: {
    title: 'New Application',
    message: 'Someone has applied to rent your property.',
    icon: 'FileText',
  },
  property_verified: {
    title: 'Property Verified!',
    message: 'Your property has been verified and is now visible to renters.',
    icon: 'CheckCircle',
  },
  new_review: {
    title: 'New Review',
    message: 'Someone left a review on your property.',
    icon: 'Star',
  },
  new_property_submission: {
    title: 'New Property Submitted',
    message: 'A new property listing has been submitted for review.',
    icon: 'Home',
  },
  new_report: {
    title: 'New Report',
    message: 'A new report has been submitted and requires attention.',
    icon: 'Flag',
  },
  new_registration: {
    title: 'New User Registration',
    message: 'A new user has registered on the platform.',
    icon: 'UserPlus',
  },
};

/**
 * Get notification title based on notification type
 */
export const getNotificationTitle = (type: NotificationType): string => {
  return notificationMessages[type]?.title || 'Notification';
};

/**
 * Get notification message based on notification type
 */
export const getNotificationMessage = (type: NotificationType): string => {
  return notificationMessages[type]?.message || 'You have a new notification.';
};

/**
 * Get notification icon name based on notification type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  return notificationMessages[type]?.icon || 'Bell';
};

/**
 * Get full notification details (title, message, icon) for a given type
 */
export const getNotificationDetails = (type: NotificationType) => {
  return (
    notificationMessages[type] || {
      title: 'Notification',
      message: 'You have a new notification.',
      icon: 'Bell',
    }
  );
};

/**
 * Helper function to format notification timestamp
 * @param createdAt ISO timestamp string
 * @returns Formatted time string (e.g., "2 hours ago", "Just now")
 */
export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const notifDate = new Date(createdAt);
  const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
};
