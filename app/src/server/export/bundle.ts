import { createHash } from 'node:crypto';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { ulid } from '@/lib/ulid';
import { selectStorageAdapter } from '@/lib/adapters/storage';
import type { OwnDataBundle } from './own-data.ts';
import type { SpaceWideBundle } from './space-wide.ts';

const gzipAsync = promisify(gzip);

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export type BundleFormat = 'json';

export type BundleResult = {
  readonly downloadUrl: string;
  readonly contentHash: string;
  readonly expiresAt: Date;
};

/**
 * Serialise a bundle to JSON, gzip it, store it, and return a signed URL.
 *
 * The key is `exports/<memberId|spaceId>/<ulid>.json.gz` so objects remain
 * groupable and identifiable without leaking content.
 */
export async function writeBundle(
  bundle: OwnDataBundle | SpaceWideBundle,
  keyPrefix: string,
): Promise<BundleResult> {
  const storage = selectStorageAdapter();
  const id = ulid();

  const json = JSON.stringify(bundle, null, 2);
  const compressed = await gzipAsync(Buffer.from(json, 'utf8'));
  const contentHash = createHash('sha256').update(compressed).digest('hex');

  const key = `${keyPrefix}/${id}.json.gz`;
  const putResult = await storage.put({
    key,
    body: compressed,
    contentType: 'application/gzip',
  });

  if (!putResult.ok) {
    throw new Error(`Storage write failed: ${putResult.reason}`);
  }

  const urlResult = await storage.signedGetUrl({ key, expiresInSeconds: SIGNED_URL_TTL_SECONDS });
  if (!urlResult.ok) {
    throw new Error(`Signed URL generation failed: ${urlResult.reason}`);
  }

  return {
    downloadUrl: urlResult.url,
    contentHash,
    expiresAt: urlResult.expiresAt,
  };
}
