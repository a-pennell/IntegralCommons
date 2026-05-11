import type { Metadata } from 'next';
import { Folio } from '@/components/ui/folio';

export const metadata: Metadata = {
  title: 'Governance Framework',
  description:
    'The CommonGround Governance Framework — eleven constitutional principles for groups that govern shared resources.',
  robots: { index: true, follow: true },
};

/**
 * Public, citable presentation of the CommonGround Governance Framework.
 *
 * Per the PRD ("Two Artifacts"), the Framework is intended to be a citable
 * document independent of the software. This page presents the eleven
 * principles in a folio layout — marginalia on the left for citation
 * handles and tier, body on the right for principle text.
 *
 * The canonical full text lives at:
 *   docs/commonground-governance-framework.md
 *
 * That file is the source of record. This page is a typeset presentation.
 */
export default function FrameworkPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-paper)]">
      {/* Top rule */}
      <header className="border-b border-[color:var(--color-rule)]">
        <div className="mx-auto flex max-w-(--container-folio) items-baseline justify-between px-6 py-5 sm:px-10">
          <div className="eyebrow">CommonGround</div>
          <a
            href="/login"
            className="metadata text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-accent)]"
          >
            Sign in ▸
          </a>
        </div>
      </header>

      <main
        data-density="editorial"
        className="mx-auto max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-16"
      >
        {/* Page masthead */}
        <Folio
          margin={
            <>
              <div className="eyebrow">CommonGround</div>
              <div className="metadata tabular mt-1">v1.0 · 14 Apr 2026</div>
              <div className="metadata tabular mt-4">Status · Draft</div>
              <div className="metadata tabular mt-4">
                Source ·{' '}
                <a
                  href="https://github.com/a-pennell/ICOS/blob/main/docs/commonground-governance-framework.md"
                  className="underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                >
                  GitHub
                </a>
              </div>
            </>
          }
        >
          <h1 className="text-(length:--text-display) leading-(--text-display--line-height) font-[var(--font-display)] font-extrabold tracking-(--text-display--letter-spacing) text-[color:var(--color-ink)]">
            The Governance Framework
          </h1>
          <p className="mt-6 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
            Eleven constitutional principles for groups that govern shared resources. They are
            embedded in the CommonGround software but exist independently of it — they describe how
            groups can govern themselves while ensuring power remains visible, contextual, and
            revocable.
          </p>
        </Folio>

        {/* Core premise */}
        <Folio margin={<div className="eyebrow">Core premise</div>}>
          <p className="max-w-prose text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
            Groups are sovereign. They can delegate authority but can never permanently surrender
            it. All governance is visible, all power is contextual, and the infrastructure that
            enables governance cannot itself be captured.
          </p>
        </Folio>

        {/* Tier 1 */}
        <SectionDivider label="Tier 1 — Inviolable" />
        <p className="mb-12 max-w-prose text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          These principles cannot be overridden by any group decision. They protect the commons,
          individual rights, and the group's capacity for self-governance.
        </p>

        <Principle
          number={8}
          tier="inviolable"
          title="Removal Due Process"
          summary="Members subject to removal may participate in deliberation, may not block final decisions, and are entitled to a transparent process with defined criteria and thresholds."
          rationale="Without due process, the governance system becomes a tool of exclusion rather than inclusion. The right to be heard before removal is foundational."
        />
        <Principle
          number={10}
          tier="inviolable"
          supreme
          title="Commons Protection"
          summary="No decision may privatize shared infrastructure, restrict exit rights (data, identity, participation), or undermine the revocability of governance. This principle is supreme — when it conflicts with any other principle, it prevails."
          rationale="The greatest risk to any commons is enclosure — gradual capture by private interests. This principle exists to make enclosure structurally impossible, not merely discouraged."
        />
        <Principle
          number={11}
          tier="inviolable"
          title="Forkability"
          summary="Any group may fork the system and its governance, provided interoperability standards are maintained."
          rationale="The right to exit and rebuild is the ultimate check on governance failure. If a group cannot fork, it is captive."
        />

        {/* Tier 2 */}
        <SectionDivider label="Tier 2 — Deliberable" />
        <p className="mb-12 max-w-prose text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          These principles are defaults that groups can adjust through their own governance process.
          Adjustments are recorded as Decision Records in Civic Memory, creating visible precedent.
        </p>

        <Principle
          number={1}
          tier="deliberable"
          title="Bootstrap"
          summary="The initial governance method is established via consent. The founder proposes a governance profile, the system opens it as the group's first Issue, and members deliberate. The consent-based meta-method is the one rule that precedes all others."
          rationale="Every governance system faces the bootstrap paradox — you need rules to decide, but deciding on rules is itself a decision. Consent resolves this by requiring only the absence of paramount objections, not unanimous enthusiasm."
        />
        <Principle
          number={2}
          tier="deliberable"
          title="Revocability"
          summary="All delegations are revocable. No delegation may be made irrevocable."
          rationale="Irrevocable delegation is a transfer of sovereignty. If authority cannot be recalled, the group has created a ruler, not a delegate."
        />
        <Principle
          number={3}
          tier="deliberable"
          title="Bounded Referendum Right"
          summary="Any member may initiate a referendum if supported by a minimum threshold of members or stake relevant to the decision's scope."
          rationale="Unlimited referendum rights enable disruption. Eliminated referendum rights enable capture. The threshold balances stability with accountability."
        />
        <Principle
          number={4}
          tier="deliberable"
          title="Scope and Subsidiarity"
          summary="Decisions should be made at the lowest level competent to address them. Only those materially affected participate in referenda."
          rationale="Without subsidiarity, the system collapses. Every decision becomes everyone's decision, creating gridlock and fatigue. Subsidiarity respects both competence and affected interest."
        />
        <Principle
          number={5}
          tier="deliberable"
          title="Temporal Stability"
          summary="Delegations and decisions have defined stability periods during which they cannot be challenged except under exceptional conditions."
          rationale="Without stability periods, governance becomes a permanent campaign. Decisions must have time to be implemented and evaluated before they can be relitigated."
        />
        <Principle
          number={6}
          tier="deliberable"
          title="Rate Limiting"
          summary="Members are subject to limits on how frequently they may initiate referenda or governance actions within a given time window."
          rationale="Governance overload is a denial-of-service attack on collective attention. Rate limiting protects the group's capacity to deliberate meaningfully."
        />
        <Principle
          number={7}
          tier="deliberable"
          title="Deliberation First"
          summary="All referenda must include a structured deliberation phase before voting. No decision proceeds directly to resolution without the group having the opportunity to understand the issue through multiple perspectives."
          rationale="Voting without deliberation is preference aggregation, not governance. The deliberation phase is where understanding is built, disagreement is made legible, and the quality of the eventual decision is determined."
        />
        <Principle
          number={9}
          tier="deliberable"
          title="Participation Integrity"
          summary="Decisions require quorum thresholds, diversity of participation (to avoid capture), and transparent rationale."
          rationale="A decision made by a few cannot be legitimate for the many. Participation integrity ensures decisions reflect the group, not a subset."
        />

        {/* Footer */}
        <SectionDivider label="On this document" />
        <Folio margin={<div className="eyebrow">Canonical text</div>}>
          <p className="max-w-prose text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
            The full canonical text — including conflict-resolution rules, the bootstrap process,
            decision-method architecture, and amendment process — lives in the CommonGround
            repository:
          </p>
          <p className="metadata tabular mt-4">
            <a
              href="https://github.com/a-pennell/ICOS/blob/main/docs/commonground-governance-framework.md"
              className="underline underline-offset-4 hover:text-[color:var(--color-accent)]"
            >
              docs/commonground-governance-framework.md
            </a>
          </p>
          <p className="mt-6 max-w-prose text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
            CommonGround is licensed under the GNU Affero General Public License v3.0. The Framework
            is available under the same license; you are free to fork it, adapt it for your own
            group, and republish — provided you preserve the commitments to revocability,
            transparency, and forkability that define it.
          </p>
        </Folio>
      </main>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mt-20 mb-10 flex items-baseline gap-4">
      <span className="eyebrow text-[color:var(--color-ink)]">{label}</span>
      <span className="h-px flex-1 bg-[color:var(--color-rule-strong)]" aria-hidden />
    </div>
  );
}

function Principle({
  number,
  tier,
  title,
  summary,
  rationale,
  supreme = false,
}: {
  number: number;
  tier: 'inviolable' | 'deliberable';
  title: string;
  summary: string;
  rationale: string;
  supreme?: boolean;
}) {
  const num = String(number).padStart(2, '0');
  return (
    <Folio
      margin={
        <>
          <div className="eyebrow text-[color:var(--color-ink)]">Principle {num}</div>
          <div className="metadata tabular mt-1">{tier === 'inviolable' ? 'Tier 1' : 'Tier 2'}</div>
          {supreme ? (
            <div className="metadata tabular mt-4 text-[color:var(--color-oxblood)]">Supreme</div>
          ) : null}
        </>
      }
    >
      <h2 className="text-(length:--text-heading) leading-(--text-heading--line-height) font-[var(--font-display)] font-bold tracking-(--text-heading--letter-spacing) text-[color:var(--color-ink)]">
        {title}
      </h2>
      <p className="mt-3 max-w-prose text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
        {summary}
      </p>
      <p className="mt-3 max-w-prose text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
        <span className="not-italic">Rationale.</span> {rationale}
      </p>
    </Folio>
  );
}
