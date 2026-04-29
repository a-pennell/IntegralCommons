import { createHmac } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type {
  PutObjectInput,
  PutObjectResult,
  SignedUrlInput,
  SignedUrlResult,
  StorageAdapter,
} from './types.ts';

/**
 * LocalStorageAdapter — writes to the filesystem rooted at `basePath`.
 * Suitable for self-hosters running a single-node install.
 *
 * `signedGetUrl` produces a URL against `publicUrlBase` with an HMAC-signed
 * expiry. The Next.js app exposes a handler at `/api/exports/[key]` that
 * verifies the signature before streaming the file.
 *
 * The handler lives in Phase 3 (export module, T154+) — this adapter only
 * concerns itself with URL minting.
 */
export class LocalStorageAdapter implements StorageAdapter {
  readonly name = 'local';

  constructor(
    private readonly basePath: string,
    private readonly publicUrlBase: string,
    private readonly signingSecret: string,
  ) {}

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    try {
      const abs = resolve(this.basePath, input.key);
      if (!abs.startsWith(resolve(this.basePath))) {
        return { ok: false, reason: 'path-escape' };
      }
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, input.body);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  }

  async signedGetUrl(input: SignedUrlInput): Promise<SignedUrlResult> {
    const expiresAt = new Date(Date.now() + input.expiresInSeconds * 1000);
    const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000).toString();
    const sig = createHmac('sha256', this.signingSecret)
      .update(`${input.key}|${expiresAtUnix}`)
      .digest('hex');
    const url = `${this.publicUrlBase}${join('/', input.key)}?exp=${expiresAtUnix}&sig=${sig}`;
    return { ok: true, url, expiresAt };
  }
}
