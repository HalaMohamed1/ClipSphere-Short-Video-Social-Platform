import path from 'path';
import { randomBytes } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, buildPublicObjectUrl, getRequiredS3Env } from '../config/s3Client.js';

function defaultExtForKind(kind) {
  return kind === 'thumbnail' ? '.jpg' : '.mp4';
}

/**
 * @param {string} userId
 * @param {string} [originalFilename]
 * @param {'video'|'thumbnail'} kind
 */
export function buildObjectKey(userId, originalFilename, kind) {
  const raw = typeof originalFilename === 'string' ? originalFilename : '';
  const ext = path.extname(raw) || defaultExtForKind(kind);
  const base = randomBytes(8).toString('hex');
  return `${userId}/${Date.now()}-${base}${ext}`;
}

/**
 * @param {object} opts
 * @param {string} opts.bucket
 * @param {string} opts.key
 * @param {Buffer} opts.body
 * @param {string} opts.contentType
 */
export async function putObjectBuffer({ bucket, key, body, contentType }) {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return buildPublicObjectUrl(bucket, key);
}

/**
 * @param {object} opts
 * @param {string} opts.bucket
 * @param {string} opts.key
 * @param {string} opts.contentType
 */
export async function getPresignedPutUrl({ bucket, key, contentType }) {
  const client = getS3Client();
  const expiresIn = parseInt(process.env.S3_PRESIGN_EXPIRES_SECONDS || '300', 10) || 300;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return { uploadUrl, expiresIn };
}

/**
 * @param {'video'|'thumbnail'} kind
 */
export function getBucketForKind(kind) {
  const { bucketVideos, bucketThumbnails } = getRequiredS3Env();
  return kind === 'thumbnail' ? bucketThumbnails : bucketVideos;
}
