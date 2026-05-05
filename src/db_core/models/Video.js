import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * @openapi
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - title
 *         - user
 *         - videoUrl
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the video.
 *         user:
 *           type: string
 *           description: The ID of the user who uploaded the video.
 *         videoUrl:
 *           type: string
 *           format: url
 *           description: The public URL to the video file.
 *         thumbnailUrl:
 *           type: string
 *           format: url
 *           description: The URL to the video thumbnail image.
 *         category:
 *           type: string
 *           enum: [music, gaming, sports, tech, entertainment, educational]
 *           default: entertainment
 *         views:
 *           type: number
 *           default: 0
 *         likes:
 *           type: number
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Video must belong to a user'],
    },
    /** MinIO object key (private bucket). Use with presigned GET. */
    videoKey: {
      type: String,
      default: null,
    },
    thumbnailKey: {
      type: String,
      default: null,
    },
    /** Legacy / external URL, or redundant when videoKey is set (resolved via presign in API). */
    videoUrl: {
      type: String,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational', 'others'],
      default: 'others',
    },
    duration: {
      type: Number,
      min: [1, 'Video duration must be at least 1 second'],
      max: [300, 'Video duration cannot exceed 5 minutes (300s)'],
      required: [true, 'Please provide video duration'],
    },
    status: {
      type: String,
      enum: ['public', 'private', 'flagged'],
      default: 'public',
    },
    views: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: {
       type: [String],
       default: [],
       validate: {
         validator: (tags) => tags.length <= 10,
         message: 'A video can only have up to 10 tags'
       }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

videoSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'video',
});

// sort users profiles
videoSchema.index({ user: 1, createdAt: -1 });

//trending
videoSchema.index({ category: 1, views: -1 });

// Searching for videos
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

videoSchema.pre('validate', function (next) {
  if (!this.videoKey && !this.videoUrl) {
    return next(new Error('Video must have either videoKey (upload) or videoUrl'));
  }
  if (this.videoUrl && !this.videoKey) {
    const ok = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(this.videoUrl);
    if (!ok) return next(new Error('Invalid video URL'));
  }
  next();
});

videoSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

videoSchema.post('save', async function (doc, next) {
   console.log(`Video "${doc.title}" was saved.`);
   next();
});

videoSchema.post('remove', async function (doc, next) {
   console.log(`Cleaning up resources for deleted video ${doc._id}`);
   next();
});

export const Video = mongoose.model('Video', videoSchema);
