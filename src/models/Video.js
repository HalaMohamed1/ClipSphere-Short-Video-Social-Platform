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
    videoUrl: {
      type: String,
      required: [true, 'Please provide a video URL'],
      validate: {
        validator: function(v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid video URL.`
      }
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

videoSchema.index({ user: 1, createdAt: -1 });

videoSchema.index({ category: 1, views: -1 });

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

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
