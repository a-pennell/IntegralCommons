import type { AIAdapter, ClassifyPerspectiveInput, ClassifyPerspectiveResult } from './types.ts';

/**
 * NullAIAdapter — Phase 1 only adapter. Every method returns
 * `{ ok: false, reason: 'disabled' }`. Consumers must treat AI as optional.
 */
export class NullAIAdapter implements AIAdapter {
  readonly name = 'null';
  readonly enabled = false;

  async classifyPerspective(_input: ClassifyPerspectiveInput): Promise<ClassifyPerspectiveResult> {
    return { ok: false, reason: 'disabled' };
  }
}
