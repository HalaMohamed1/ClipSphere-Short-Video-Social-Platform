import { User } from '../db_core/models/User.js';
import { EmailService } from '../services/emailService.js';
import { resolveNotificationChannels } from './notificationEligibility.js';

/**
 * Send engagement notifications to video owner based on nested notification preferences.
 * @param {'like'|'review'} engagementType
 */
export async function sendEngagementNotification(
  videoOwnerId,
  engagementType,
  engagerName,
  videoTitle,
  videoId
) {
  try {
    const videoOwner = await User.findById(videoOwnerId).select(
      'email username notificationPreferences'
    );

    if (!videoOwner) {
      console.warn(`Video owner with ID ${videoOwnerId} not found`);
      return;
    }

    const eventKey = engagementType === 'review' ? 'comments' : 'likes';
    const { shouldQueueEmail, shouldNotifyInApp } = resolveNotificationChannels(
      videoOwner,
      eventKey
    );

    if (shouldQueueEmail) {
      const result = await EmailService.sendEngagementEmail(
        videoOwner.email,
        videoOwner.username,
        engagementType,
        engagerName,
        videoTitle,
        videoId
      );

      if (result.success) {
        console.log(
          `Engagement notification email sent to ${videoOwner.email} for ${engagementType}`
        );
      } else {
        console.error(`Failed to send engagement email to ${videoOwner.email}:`, result.error);
      }
    }

    if (shouldNotifyInApp) {
      console.log(
        `[in-app] Notification queued for user ${videoOwnerId} (${engagementType})`
      );
    }
  } catch (error) {
    console.error('Error sending engagement notification:', error);
  }
}

export async function sendWelcomeNotification(userId) {
  try {
    const user = await User.findById(userId).select('email username notificationPreferences');

    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return;
    }

    const { shouldQueueEmail, shouldNotifyInApp } = resolveNotificationChannels(
      user,
      'welcome'
    );

    if (shouldQueueEmail) {
      const result = await EmailService.sendWelcomeEmail(user.email, user.username);

      if (result.success) {
        console.log(`Welcome email sent to ${user.email}`);
      } else {
        console.error(`Failed to welcome email to ${user.email}:`, result.error);
      }
    }

    if (shouldNotifyInApp) {
      console.log(`[in-app] Welcome notification for user ${userId}`);
    }
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
}
