import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    video: {
      type: mongoose.Schema.ObjectId,
      ref: 'Video',
      required: [true, 'Review must belong to a video'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot be more than 5.0'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      trim: true,
      minlength: [3, 'Comment must be at least 3 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, video: 1 }, { unique: true });

reviewSchema.index({ video: 1, rating: -1 });

reviewSchema.pre('save', function (next) {
  if (this.isModified('comment') && !this.isNew) {
    this.isEdited = true;
  }
  next();
});

reviewSchema.post('save', async function (doc, next) {
   console.log(`Recalculating average rating for video: ${doc.video}`);
   next();
});

reviewSchema.post('remove', async function (doc, next) {
   console.log(`Recalculating average rating after review deletion on video: ${doc.video}`);
   next();
});

export const Review = mongoose.model('Review', reviewSchema);
