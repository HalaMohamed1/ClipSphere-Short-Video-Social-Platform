import mongoose from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Follower:
 *       type: object
 *       required:
 *         - follower
 *         - following
 *       properties:
 *         follower:
 *           type: string
 *           description: The ID of the user who is following another user.
 *         following:
 *           type: string
 *           description: The ID of the user who is being followed.
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Follower is required'],
    },
    following: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Following is required'],
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


followerSchema.index({ follower: 1, following: 1 }, { unique: true });

followerSchema.index({ following: 1, createdAt: -1 });


followerSchema.pre('save', function (next) {
  if (this.follower.equals(this.following)) {
    return next(new Error('You cannot follow yourself.'));
  }
  next();
});

followerSchema.post('save', async function (doc, next) {
   console.log(`User ${doc.follower} followed user ${doc.following}`);
   next();
});

followerSchema.post('remove', async function (doc, next) {
   console.log(`User ${doc.follower} unfollowed user ${doc.following}`);
   next();
});

export const Follower = mongoose.model('Follower', followerSchema);
