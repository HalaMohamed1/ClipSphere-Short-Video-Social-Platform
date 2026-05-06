import { emitToUser } from '../db_core/socketEvents.js';

/**
 * Engagement Event Emission Utilities for Controllers
 * These functions are called from controllers to emit real-time events to users
 */

/**
 * Emit a new like notification to video owner
 * Called from likeController when a user likes a video
 *
 * @param {Object} io - Socket.io instance
 * @param {string} videoOwnerId - ID of the video owner (recipient)
 * @param {string} likerId - ID of the user who liked
 * @param {string} likerUsername - Username of the user who liked
 * @param {string} videoId - ID of the video that was liked
 * @param {string} videoTitle - Title of the video
 */
export const emitNewLikeEvent = (io, videoOwnerId, likerId, likerUsername, videoId, videoTitle) => {
  emitToUser(io, videoOwnerId, 'new-like', {
    likerId,
    likerUsername,
    videoId,
    videoTitle,
    type: 'like',
  });
  console.log(`📝 Like notification emitted: ${likerUsername} → Owner ${videoOwnerId}`);
};

/**
 * Emit a new comment notification to video owner
 * Called from reviewController when a user comments on a video
 *
 * @param {Object} io - Socket.io instance
 * @param {string} videoOwnerId - ID of the video owner (recipient)
 * @param {string} commenterId - ID of the user who commented
 * @param {string} commenterUsername - Username of the user who commented
 * @param {string} videoId - ID of the video
 * @param {string} videoTitle - Title of the video
 * @param {string} comment - The comment text
 */
export const emitNewCommentEvent = (io, videoOwnerId, commenterId, commenterUsername, videoId, videoTitle, comment) => {
  emitToUser(io, videoOwnerId, 'new-comment', {
    commenterId,
    commenterUsername,
    videoId,
    videoTitle,
    message: comment,
    type: 'comment',
  });
  console.log(`💬 Comment notification emitted: ${commenterUsername} → Owner ${videoOwnerId}`);
};

/**
 * Emit a new follower notification
 * Called from userController when a user follows another user
 *
 * @param {Object} io - Socket.io instance
 * @param {string} followedUserId - ID of the user being followed (recipient)
 * @param {string} followerId - ID of the user who followed
 * @param {string} followerUsername - Username of the user who followed
 */
export const emitNewFollowerEvent = (io, followedUserId, followerId, followerUsername) => {
  emitToUser(io, followedUserId, 'new-follower', {
    followerId,
    followerUsername,
    type: 'follow',
  });
  console.log(`👤 Follower notification emitted: ${followerUsername} → User ${followedUserId}`);
};

/**
 * Emit a new tip notification to creator
 * Called from webhookController when Stripe payment is completed
 *
 * @param {Object} io - Socket.io instance
 * @param {string} creatorId - ID of the creator receiving the tip (recipient)
 * @param {string} senderId - ID of the user sending the tip
 * @param {string} senderUsername - Username of the user sending the tip
 * @param {number} amount - Amount of the tip in dollars
 * @param {string} videoId - ID of the video (optional)
 * @param {string} videoTitle - Title of the video (optional)
 */
export const emitNewTipEvent = (io, creatorId, senderId, senderUsername, amount, videoId, videoTitle) => {
  emitToUser(io, creatorId, 'new-tip', {
    senderId,
    senderUsername,
    amount,
    videoId,
    videoTitle,
    type: 'tip',
  });
  console.log(`💰 Tip notification emitted: ${senderUsername} → Creator ${creatorId} ($${amount})`);
};

/**
 * Emit multiple engagement events to multiple users
 * (e.g., when a video goes viral and multiple people interact)
 *
 * @param {Object} io - Socket.io instance
 * @param {array} userIds - Array of user IDs to notify
 * @param {string} eventName - Name of the event (e.g., 'new-like', 'new-comment')
 * @param {object} data - Event data to emit
 */
export const emitToMultipleUsers = (io, userIds, eventName, data) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    console.warn('No user IDs provided for batch emit');
    return;
  }

  userIds.forEach((userId) => {
    emitToUser(io, userId, eventName, data);
  });

  console.log(`📢 Batch event "${eventName}" emitted to ${userIds.length} users`);
};

/**
 * Broadcast notification to all connected users
 * Use sparingly - mainly for system-wide events
 *
 * @param {Object} io - Socket.io instance
 * @param {string} eventName - Name of the event
 * @param {object} data - Event data
 */
export const broadcastNotification = (io, eventName, data) => {
  io.emit(eventName, {
    ...data,
    timestamp: new Date(),
  });
  console.log(`📢 Broadcast event "${eventName}" sent to all connected users`);
};
