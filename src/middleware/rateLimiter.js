import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => isDev,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isDev ? 1000 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => isDev,
    message: {
        status: 'error',
        message: 'Upload limit exceeded, please try again after an hour'
    }
});
