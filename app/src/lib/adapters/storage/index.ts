import type { StorageAdapter } from './types.ts';
import { LocalStorageAdapter } from './local.ts';
import { S3StorageAdapter } from './s3.ts';

export function selectStorageAdapter(env: NodeJS.ProcessEnv = process.env): StorageAdapter {
  const choice = (env.STORAGE_ADAPTER ?? 'local').trim().toLowerCase();

  if (choice === 'local') {
    const basePath = env.STORAGE_LOCAL_PATH ?? '/var/lib/commonground/exports';
    const publicUrlBase = env.NEXT_PUBLIC_APP_URL
      ? `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/exports`
      : 'http://localhost:3000/api/exports';
    const signingSecret = env.SESSION_SECRET;
    if (!signingSecret) {
      throw new Error(
        'STORAGE_ADAPTER=local requires SESSION_SECRET for signed-URL signing. See app/.env.example.',
      );
    }
    return new LocalStorageAdapter(basePath, publicUrlBase, signingSecret);
  }

  if (choice === 's3') {
    const endpoint = env.STORAGE_S3_ENDPOINT;
    const region = env.STORAGE_S3_REGION;
    const bucket = env.STORAGE_S3_BUCKET;
    const accessKeyId = env.STORAGE_S3_ACCESS_KEY_ID;
    const secretAccessKey = env.STORAGE_S3_SECRET_ACCESS_KEY;
    if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'STORAGE_ADAPTER=s3 requires STORAGE_S3_ENDPOINT, STORAGE_S3_REGION, STORAGE_S3_BUCKET, STORAGE_S3_ACCESS_KEY_ID, STORAGE_S3_SECRET_ACCESS_KEY.',
      );
    }
    return new S3StorageAdapter({
      endpoint,
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
    });
  }

  throw new Error(`Unknown STORAGE_ADAPTER="${choice}". Valid values: local, s3.`);
}

export type {
  StorageAdapter,
  PutObjectInput,
  PutObjectResult,
  SignedUrlInput,
  SignedUrlResult,
} from './types.ts';
