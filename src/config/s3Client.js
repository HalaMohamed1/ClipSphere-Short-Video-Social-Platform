import { S3Client } from '@aws-sdk/client-s3';

let cachedClient;

function getEnv(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v;
}

export function getRequiredS3Env() {
  const endpoint = getEnv('S3_ENDPOINT');
  const accessKeyId = getEnv('S3_ACCESS_KEY');
  const secretAccessKey = getEnv('S3_SECRET_KEY');
  const region = getEnv('S3_REGION', 'us-east-1');
  const bucketVideos = getEnv('S3_BUCKET_VIDEOS');
  const bucketThumbnails = getEnv('S3_BUCKET_THUMBNAILS');
  const publicUrl = getEnv('S3_PUBLIC_URL');

  const missing = [];
  if (!endpoint) missing.push('S3_ENDPOINT');
  if (!accessKeyId) missing.push('S3_ACCESS_KEY');
  if (!secretAccessKey) missing.push('S3_SECRET_KEY');
  if (!bucketVideos) missing.push('S3_BUCKET_VIDEOS');
  if (!bucketThumbnails) missing.push('S3_BUCKET_THUMBNAILS');
  if (!publicUrl) missing.push('S3_PUBLIC_URL');

  if (missing.length) {
    throw new Error(`Missing required S3 environment variables: ${missing.join(', ')}`);
  }

  return {
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    region,
    bucketVideos,
    bucketThumbnails,
    publicUrl: publicUrl.replace(/\/$/, ''),
  };
}

export function getS3Client() {
  if (cachedClient) return cachedClient;
  const { endpoint, credentials, region } = getRequiredS3Env();
  cachedClient = new S3Client({
    endpoint,
    region,
    credentials,
    forcePathStyle: true,
  });
  return cachedClient;
}

/**
 * Path-style public URL for an object (MinIO / S3 compatible).
 * @param {string} bucket
 * @param {string} key
 */
export function buildPublicObjectUrl(bucket, key) {
  const { publicUrl } = getRequiredS3Env();
  const safeKey = String(key)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${publicUrl}/${bucket}/${safeKey}`;
}
