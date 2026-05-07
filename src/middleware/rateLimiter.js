import rateLimit from 'express-rate-limit';

const skipStripeWebhooks = (req) =>
  typeof req.originalUrl === 'string' && req.originalUrl.includes('/webhooks/');

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipStripeWebhooks,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Upload limit exceeded, please try again after an hour'
    }
});
