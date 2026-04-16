import { User } from '../db_core/models/User.js';
import { EmailService } from '../services/emailService.js';

/**
 * Send engagement notifications to video owner based on their preferences
 * @param {string} videoOwnerId - ID of the video owner
 * @param {string} engagementType - Type of engagement: 'like' or 'review'
 * @param {string} engagerName - Name of the user performing the engagement
 * @param {string} videoTitle - Title of the video
 */
export async function sendEngagementNotification(videoOwnerId, engagementType, engagerName, videoTitle) {
  try {
    // Get the video owner's user document
    const videoOwner = await User.findById(videoOwnerId).select(
      'email username notificationPreferences'
    );

    if (!videoOwner) {
      console.warn(`Video owner with ID ${videoOwnerId} not found`);
      return;
    }

    // Get notification preferences with defaults
    const prefs = videoOwner.notificationPreferences || {
      emailOnNewEngagement: true,
      inAppOnNewEngagement: true,
    };

    // Check if user wants email notifications for new engagement
    if (prefs.emailOnNewEngagement) {
      const result = await EmailService.sendEngagementEmail(
        videoOwner.email,
        videoOwner.username,
        engagementType,
        engagerName,
        videoTitle
      );

      if (result.success) {
        console.log(
          `Engagement notification email sent to ${videoOwner.email} for ${engagementType}`
        );
      } else {
        console.error(
          `Failed to send engagement email to ${videoOwner.email}:`,
          result.error
        );
      }
    }

    // TODO: Implement in-app notifications if prefs.inAppOnNewEngagement is true
    if (prefs.inAppOnNewEngagement) {
      console.log(
        `[TODO] Create in-app notification for user ${videoOwnerId} about ${engagementType}`
      );
    }
  } catch (error) {
    console.error('Error sending engagement notification:', error);
  }
}

/**
 * Send welcome email to new user based on their preferences
 * @param {string} userId - ID of the new user
 */
export async function sendWelcomeNotification(userId) {
  try {
    const user = await User.findById(userId).select('email username notificationPreferences');

    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return;
    }

    // Get notification preferences with defaults
    const prefs = user.notificationPreferences || {
      emailOnWelcome: true,
      inAppOnWelcome: true,
    };

    // Check if user wants welcome email
    if (prefs.emailOnWelcome) {
      const result = await EmailService.sendWelcomeEmail(user.email, user.username);

      if (result.success) {
        console.log(`Welcome email sent to ${user.email}`);
      } else {
        console.error(`Failed to send welcome email to ${user.email}:`, result.error);
      }
    }

    // TODO: Implement in-app welcome notification if prefs.inAppOnWelcome is true
    if (prefs.inAppOnWelcome) {
      console.log(`[TODO] Create welcome in-app notification for user ${userId}`);
    }
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
}
