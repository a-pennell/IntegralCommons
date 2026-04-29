/**
 * OpenTelemetry setup stub.
 *
 * Off by default — NFR-001 rules out product analytics, and self-hosters
 * with no observability backend should not be forced to ship traces to
 * /dev/null. When `OTEL_EXPORTER_OTLP_ENDPOINT` is set at boot, the full
 * OpenTelemetry Node SDK is initialized and auto-instrumentations are
 * wired up. When unset, every export is a no-op.
 *
 * The actual SDK wiring is deferred — this module currently provides the
 * public shape so other modules can import it. Enable is a Phase 2 polish
 * task (T197).
 */

export type TelemetryStatus = { enabled: boolean; endpoint?: string };

export function initTelemetry(): TelemetryStatus {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    return { enabled: false };
  }
  // T197 will replace this with the @opentelemetry/sdk-node bootstrap.
  return { enabled: true, endpoint };
}

/**
 * Generate a short trace ID suitable for log correlation and the
 * InternalError taxonomy variant. Not a W3C trace ID — when the full OTel
 * SDK is wired, the active span's traceId takes precedence.
 */
export function newTraceId(): string {
  // 16 hex chars = 64 bits. Plenty for dev + small-pilot correlation.
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
