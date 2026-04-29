import type {
  PutObjectInput,
  PutObjectResult,
  SignedUrlInput,
  SignedUrlResult,
  StorageAdapter,
} from './types.ts';

/**
 * S3StorageAdapter — S3-compatible storage (AWS, R2, MinIO, B2, Wasabi).
 *
 * Phase 1 skeleton. The export module (T154+) will wire in `@aws-sdk/client-s3`
 * and `@aws-sdk/s3-request-presigner` at that point; until then, calling this
 * adapter throws at runtime — but the module compiles so the selector in
 * ./index.ts can typecheck.
 */
export class S3StorageAdapter implements StorageAdapter {
  readonly name = 's3';

  constructor(
    private readonly _config: {
      endpoint: string;
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
    },
  ) {}

  async put(_input: PutObjectInput): Promise<PutObjectResult> {
    return { ok: false, reason: 'S3 adapter not yet implemented — scheduled in T154+.' };
  }

  async signedGetUrl(_input: SignedUrlInput): Promise<SignedUrlResult> {
    return { ok: false, reason: 'S3 adapter not yet implemented — scheduled in T154+.' };
  }
}
