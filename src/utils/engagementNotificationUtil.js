import { User } from '../db_core/models/User.js';
import { EmailService, sendEmailQueued } from '../services/emailService.js';
import { resolveNotificationChannels } from './notificationEligibility.js';

// Email templates (duplicated from emailService for queue worker)
const emailTemplates = {
  newEngagement: (recipientName, engagementType, engagerName, videoTitle, videoId) => ({
    subject: `${engagerName} ${engagementType === 'like' ? 'liked' : 'reviewed'} your video on ClipSphere!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">New Engagement on Your Video!</h1>
        <p>Hi ${recipientName},</p>
        <p><strong>${engagerName}</strong> just ${engagementType === 'like' ? 'liked' : 'left a review on'} your video:</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1f2937;">${videoTitle}</p>
        </div>
        ${engagementType === 'review' ? `
          <p>Check out their review and respond to build your community!</p>
        ` : `
          <p>They loved your video! Keep creating great content.</p>
        `}
        <p style="margin-top: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/video/${encodeURIComponent(videoId || '')}" 
             style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Video
          </a>
        </p>
        <p style="margin-top: 30px;">Keep up the great work!</p>
        <p>The ClipSphere Team</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
      </div>
    `,
  }),
  
  welcome: (username) => ({
    subject: `Welcome to ClipSphere, ${username}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to ClipSphere!</h1>
        <p>Hi ${username},</p>
        <p>Thank you for joining our community! We're thrilled to have you on board.</p>
        <p>ClipSphere is your platform to share short videos, connect with creators, and discover amazing content.</p>
        <h2 style="color: #6366f1; margin-top: 30px;">Getting Started</h2>
        <ul>
          <li>Complete your profile with a bio and avatar</li>
          <li>Upload your first video</li>
          <li>Explore videos from other creators</li>
          <li>Leave reviews and engage with the community</li>
        </ul>
        <p style="margin-top: 30px;">Happy creating!</p>
        <p>The ClipSphere Team</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
      </div>
    `,
  }),
};

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
      try {
        const template = emailTemplates.newEngagement(
          videoOwner.username,
          engagementType,
          engagerName,
          videoTitle,
          videoId
        );
        
        // Queue the email instead of sending directly
        await sendEmailQueued(videoOwner.email, template.subject, template.html);
        console.log(
          `📧 Engagement notification queued for ${videoOwner.email} (${engagementType})`
        );
      } catch (error) {
        console.error(`Failed to queue engagement email for ${videoOwner.email}:`, error.message);
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
      try {
        const template = emailTemplates.welcome(user.username);
        
        // Queue the email instead of sending directly
        await sendEmailQueued(user.email, template.subject, template.html);
        console.log(`📧 Welcome email queued for ${user.email}`);
      } catch (error) {
        console.error(`Failed to queue welcome email for ${user.email}:`, error.message);
      }
    }

    if (shouldNotifyInApp) {
      console.log(`[in-app] Welcome notification for user ${userId}`);
    }
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
}
