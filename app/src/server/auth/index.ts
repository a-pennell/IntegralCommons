/**
 * Auth module public surface.
 *
 * External imports MUST go through this file — deep imports are blocked by
 * `no-restricted-imports` in eslint.config.js.
 */

export { requestMagicLink } from './request-magic-link.ts';
export type { RequestMagicLinkInput, RequestMagicLinkOk } from './request-magic-link.ts';

export { verifyMagicLink } from './verify-magic-link.ts';
export type { VerifyMagicLinkInput, VerifyMagicLinkOk } from './verify-magic-link.ts';

export {
  getSession,
  requireSession,
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE,
} from './session.ts';
