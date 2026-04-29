/**
 * AIAdapter — a no-op surface for Phase 1.
 *
 * Phase 2 adds concrete implementations for perspective auto-classification,
 * viewpoint clustering, editable-summary drafting. In Phase 1 the adapter
 * exists only so other modules can import the type; the only concrete
 * implementation is `NullAIAdapter` (./null.ts).
 *
 * This is deliberate: any code path that would "use AI" in Phase 1 calls the
 * null adapter and therefore degrades to "no AI suggestion", not an error.
 * The system never requires AI for correctness.
 */

export type AIUnavailable = { readonly ok: false; readonly reason: 'disabled' };

export type ClassifyPerspectiveInput = {
  readonly bodyMarkdown: string;
  readonly vocabulary: ReadonlyArray<string>;
};

export type ClassifyPerspectiveResult =
  | {
      readonly ok: true;
      readonly suggested: ReadonlyArray<{ readonly tag: string; readonly confidence: number }>;
    }
  | AIUnavailable;

export interface AIAdapter {
  readonly name: string;
  readonly enabled: boolean;
  classifyPerspective(input: ClassifyPerspectiveInput): Promise<ClassifyPerspectiveResult>;
}
