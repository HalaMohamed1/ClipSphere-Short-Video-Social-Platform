import nodemailer from 'nodemailer';

// Email templates
const emailTemplates = {
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
  
  newEngagement: (recipientName, engagementType, engagerName, videoTitle) => ({
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
          <a href="${process.env.CLIENT_URL || 'https://clipsphere.app'}/video/${encodeURIComponent(videoTitle)}" 
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
};

export class EmailService {
  static transporter = null;

  static async initializeTransporter() {
    if (this.transporter) return this.transporter;

    // Use environment variables for email configuration
    // For development, use ethereal.email (free SMTP testing service)
    // For production, use your actual email service (Gmail, SendGrid, etc.)
    
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Fallback to test account (development only)
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.warn('Using Ethereal test email account. Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS for production.');
    }

    return this.transporter;
  }

  static async sendWelcomeEmail(userEmail, username) {
    try {
      const transporter = await this.initializeTransporter();
      const template = emailTemplates.welcome(username);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@clipsphere.app',
        to: userEmail,
        subject: template.subject,
        html: template.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${userEmail}. Message ID: ${info.messageId}`);
      
      // Log test email preview URL if using Ethereal
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
        console.log(`Test email preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Error sending welcome email to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  static async sendEngagementEmail(recipientEmail, recipientName, engagementType, engagerName, videoTitle) {
    try {
      const transporter = await this.initializeTransporter();
      const template = emailTemplates.newEngagement(recipientName, engagementType, engagerName, videoTitle);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@clipsphere.app',
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Engagement email sent to ${recipientEmail}. Message ID: ${info.messageId}`);
      
      // Log test email preview URL if using Ethereal
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
        console.log(`Test email preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Error sending engagement email to ${recipientEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  static async sendBulkEmail(recipients, subject, html) {
    try {
      const transporter = await this.initializeTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@clipsphere.app',
        to: recipients.join(','),
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Bulk email sent to ${recipients.length} recipients. Message ID: ${info.messageId}`);

      return { success: true, messageId: info.messageId, recipientCount: recipients.length };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      return { success: false, error: error.message };
    }
  }
}
