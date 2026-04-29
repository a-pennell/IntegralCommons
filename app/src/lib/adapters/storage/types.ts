/**
 * StorageAdapter — persistence surface for export bundles.
 *
 * Used ONLY by the export module. Not a general-purpose filesystem.
 * Two implementations: local disk (./local.ts) and S3-compatible (./s3.ts).
 *
 * Signed URLs have a 1-hour TTL (plan.md §Security & Privacy).
 */

export type StorageObjectKey = string;

export type PutObjectInput = {
  readonly key: StorageObjectKey;
  readonly body: Uint8Array | Buffer;
  readonly contentType: string;
};

export type PutObjectResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };

export type SignedUrlInput = {
  readonly key: StorageObjectKey;
  readonly expiresInSeconds: number;
};

export type SignedUrlResult =
  | { readonly ok: true; readonly url: string; readonly expiresAt: Date }
  | { readonly ok: false; readonly reason: string };

export interface StorageAdapter {
  readonly name: string;
  put(input: PutObjectInput): Promise<PutObjectResult>;
  signedGetUrl(input: SignedUrlInput): Promise<SignedUrlResult>;
}
