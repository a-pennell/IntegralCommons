import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { cr007InvalidScopeTag } from '@/server/constitution';
import type { GovernanceProfile } from './schema.ts';

/**
 * CR-007 scope-tag resolver — validate that supplied tags are in the Space's
 * configured vocabulary.
 *
 * The CR-007 "hybrid rule" has three parts:
 *   1. Every Issue carries zero or more scope tags drawn from the Space's
 *      vocabulary. This function enforces (1) at write time.
 *   2. Members matching a tag are auto-included in the affected set.
 *   3. Untagged members may self-declare in; tagged members may self-declare
 *      out.
 *
 * Parts (2) and (3) are computed at referendum time — they are concerns of
 * the `referenda` module, not Issue creation. This resolver only enforces
 * vocabulary membership.
 */

export function resolveScopeTags(args: {
  readonly supplied: ReadonlyArray<string>;
  readonly profile: GovernanceProfile;
}): Result<ReadonlyArray<string>, AppError> {
  const normalized = Array.from(
    new Set(args.supplied.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)),
  );

  if (args.profile.scopeTagVocabulary.length === 0 && normalized.length > 0) {
    return err(
      errors.validation([
        {
          path: 'scopeTags',
          message:
            'This Space has no scope-tag vocabulary configured. Leave scope tags empty or add a vocabulary via a governance Issue.',
        },
      ]),
    );
  }

  const violation = cr007InvalidScopeTag({
    supplied: normalized,
    vocabulary: args.profile.scopeTagVocabulary,
  });
  if (violation) {
    return err(errors.constitutional(violation.cr, violation.explanation));
  }

  return ok(normalized);
}
