/**
 * Jobs module public surface.
 *
 * The worker entrypoint (worker.ts) is NOT re-exported — it's consumed by
 * `pnpm worker` as an executable script, not imported by the web process.
 */

export { getBossClient, closeBossClient } from './client.ts';
export {
  enqueueEmailDispatch,
  registerEmailDispatchJob,
  type EmailDispatchJobPayload,
} from './email-dispatch-job.ts';
