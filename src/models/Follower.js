import mongoose from 'mongoose';

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

export const Follower = mongoose.model('Follower', followerSchema);
