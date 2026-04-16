import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _client = null;

function getS3Client() {
  if (_client) return _client;
  const endpoint = process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000';
  const region = process.env.MINIO_REGION || 'us-east-1';
  const accessKeyId = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin';
  const secretAccessKey =
    process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin123';

  _client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  return _client;
}

export async function putObject({ bucket, key, body, contentType }) {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    })
  );
}

export async function deleteObject({ bucket, key }) {
  if (!key) return;
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * Stream or range-read an object from MinIO (server-side only; never expose presigned URLs to the browser).
 */
export async function getObjectFromBucket({ bucket, key, range }) {
  if (!key) return null;
  const client = getS3Client();
  const input = { Bucket: bucket, Key: key };
  if (range) input.Range = range;
  const response = await client.send(new GetObjectCommand(input));
  return {
    body: response.Body,
    contentType: response.ContentType || 'application/octet-stream',
    contentLength: response.ContentLength,
    contentRange: response.ContentRange,
    acceptRanges: response.AcceptRanges,
  };
}

/**
 * Time-limited presigned GET URL (private objects).
 */
export async function getPresignedGetUrl(bucket, key, expiresInSeconds = 3600) {
  if (!key) return null;
  const client = getS3Client();
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds });
}

export function getVideoBucket() {
  return process.env.MINIO_BUCKET_VIDEOS || 'clipsphere-videos';
}

export function getThumbnailBucket() {
  return process.env.MINIO_BUCKET_THUMBNAILS || 'clipsphere-thumbnails';
}
