import { pino, type Logger, type LoggerOptions } from 'pino';

/**
 * Structured logger with a PII allowlist (plan.md §Security & Privacy).
 *
 * Logs NEVER include: email addresses, display names, Perspective body,
 * Decision Record text, Markdown bodies, tokens, passwords, session IDs.
 *
 * Logs MAY include: trace IDs, Member IDs (ULIDs, not emails), Issue IDs,
 * action names, timings, outcomes, error kinds.
 *
 * Two layers enforce the allowlist:
 *   1. `redact` strips matching paths before serialization.
 *   2. Code review + a log-capture integration test assert no PII leaks (T196).
 */

const REDACT_PATHS: readonly string[] = [
  // Authentication material
  '*.email',
  'email',
  '*.token',
  'token',
  '*.tokenHash',
  'tokenHash',
  '*.sessionId',
  'sessionId',
  '*.password',
  'password',
  // Personal content
  '*.bodyMarkdown',
  'bodyMarkdown',
  '*.whatText',
  'whatText',
  '*.rationaleText',
  'rationaleText',
  '*.unresolvedObjectionsText',
  'unresolvedObjectionsText',
  '*.displayName',
  'displayName',
  // Network
  '*.requestedFromIp',
  'requestedFromIp',
  '*.ipAtLastUse',
  'ipAtLastUse',
  '*.userAgent',
  'userAgent',
  // HTTP headers that commonly hold credentials
  '*.headers.authorization',
  '*.headers.cookie',
  '*.headers["set-cookie"]',
];

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'commonground',
    env: process.env.NODE_ENV ?? 'development',
  },
  redact: {
    paths: [...REDACT_PATHS],
    censor: '[redacted]',
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const prettyInDev = process.env.NODE_ENV !== 'production' && process.env.LOG_PRETTY !== 'false';

export const logger: Logger = pino({
  ...baseOptions,
  ...(prettyInDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: false, translateTime: 'SYS:standard' },
        },
      }
    : {}),
});

/**
 * Child logger for a request/action scope. Attach a trace ID so all log
 * lines for one unit of work can be correlated.
 */
export function requestLogger(bindings: {
  traceId: string;
  memberId?: string;
  issueId?: string;
  action?: string;
}): Logger {
  return logger.child(bindings);
}
