# Constitutional Foundations for Self-Governing Digital Commons: Design Principles for Legitimate and Resilient Collective Governance

**Andrew Pennell**
*Integral Commons OS Project — CommonGround Constitution v2.0*
*April 2026*

---

## Abstract

The design of constitutions for self-governing communities is among the oldest and most consequential problems in political philosophy. Digital commons — distributed governance systems, protocol networks, cooperatives operating through digital infrastructure, and federated coordination platforms — have introduced new forms of this problem, and have largely failed to solve it. Most existing governance frameworks for digital commons either rely on informal norms that prove fragile under growth and conflict, or adopt formal rule systems modeled on corporate bylaws that lack the legitimacy and adaptability required for genuine self-governance. This paper presents the constitutional architecture developed for CommonGround, a component of the Integral Commons OS (ICOS) governance platform. The constitution is organized around a two-tier principle hierarchy: a set of inviolable Tier 1 principles that protect the structural preconditions for self-governance and cannot be amended away, and a set of Tier 2 constitutional values that can be revised through supermajority processes. The paper argues that this architecture resolves several persistent tensions in commons governance design — between stability and adaptability, between founding authority and ongoing consent, between individual rights and collective decision-making, and between local autonomy and federated coordination. The architecture is further distinguished by its treatment of authority as contextual and revocable rather than structural and permanent, its design for both digital and physical commons, and its explicit attention to the ways information asymmetry enables capture.

---

## 1. Introduction: The Constitutional Problem in Digital Commons

Constitutions solve a particular problem. They are needed when a community must make binding decisions over time, when the procedures for making those decisions must themselves be decided, and when some decisions must be protected against revision by the very procedures they establish. A constitution is a set of rules about rules: it defines how governance works, and some part of it must be resistant to change through ordinary governance in order to prevent the community from governing away the conditions of its own self-governance.

This problem is not unique to political states. Any community that makes binding collective decisions confronts it. The history of commons governance is filled with examples of communities that developed sophisticated informal arrangements for managing shared resources, only to see those arrangements collapse when external pressures, internal conflicts, or changes in membership eroded the shared understandings on which they depended. Constitutionalization — making the principles of governance explicit, legible, and formally protected — is the institutional response to this fragility.

Digital commons face this problem in an acute form. The communities that govern digital infrastructure, open-source software, protocol networks, and distributed platforms are often large, geographically dispersed, demographically diverse, and subject to rapid change in membership and circumstance. They lack the dense social fabric — the shared history, the face-to-face relationships, the common cultural context — that allows informal norms to function as effective governance in small, stable communities. They are also, in many cases, governed by technical systems that can enforce rules at scale in ways that physical communities cannot, which both creates new possibilities and introduces new risks: code can enforce constitutional principles with a consistency and impartiality that human institutions often fail to achieve, but it can also embed the assumptions and values of its authors in ways that are difficult to identify or contest.

The CommonGround constitution, described in this paper, represents an attempt to address these challenges directly. It is explicitly minimal: it states what must be true about governance, not how to achieve it. The mechanisms, thresholds, and operational details that implement its principles are specified in a separate governance policy document, which communities can amend through their own decision processes. This separation between the constitutional level — what cannot change — and the policy level — what can be adjusted — is itself a constitutional design choice, and one of the most important.

The paper proceeds as follows. Section 2 addresses the bootstrap problem — the question of how a constitution can achieve legitimacy before the governance procedures it establishes exist. Section 3 describes the two-tier principle architecture and the rationale for each tier. Sections 4 and 5 develop the Tier 1 and Tier 2 principles in detail. Section 6 examines the authority model — the rejection of fixed roles in favor of contextual, revocable delegation. Section 7 addresses the temporal design of the system, including stability windows and the mechanisms for managing institutional change. Section 8 concludes.

---

## 2. The Bootstrap Problem and Founding Legitimacy

Every constitutional system faces what might be called the bootstrap problem: the constitution must be created before the governance procedures it establishes exist, which means it cannot derive its initial legitimacy from the procedures it will eventually institutionalize. The founders of a community make constitutional choices that will bind all subsequent members, including members who had no part in those founding choices and who may hold quite different values and priorities. How can such a constitution be legitimate?

The CommonGround constitution addresses this through what it calls the consent-based meta-method. When a founder establishes a CommonGround instance, they establish an initial constitution. Members who join consent to that constitution by the act of joining — they are not coerced into membership, and the terms of the arrangement are available for inspection before they participate. This is a form of contractarian legitimacy: the constitution's initial authority derives from the voluntary, informed acceptance of its terms by those who choose to participate under it.

This initial legitimacy is provisional, not permanent. Once the community reaches a defined membership threshold — ten active members by default — the constitution becomes ratifiable. The community may ratify, amend, or replace the founding document through a supermajority process. If ratification fails, the group enters a structured amendment period during which the founding version remains in force until a replacement achieves sufficient support. If ratification fails twice, the group enters an open constitutional convention.

The bootstrap mechanism accomplishes several things simultaneously. It acknowledges that governance must begin somewhere, and that the founding moment will necessarily involve asymmetric authority. It refuses to make that asymmetry permanent by building in a process through which the community can, through its own collective action, supersede the founder's choices. And it prevents the paralysis that would result from requiring unanimous consent before governance can begin, by accepting provisional legitimacy as sufficient for founding and requiring only ratification by supermajority for continuation.

The consent-based meta-method is itself the one rule that precedes all others. It is the constitutional provision that resolves the bootstrap paradox: it requires only the absence of paramount objections, not unanimous enthusiasm, for the founding document to take effect. This distinction — between the active consent of all and the absence of paramount objection from any — is not merely procedural. It reflects a considered position about what legitimacy requires under realistic conditions of value diversity and information asymmetry.

---

## 3. The Two-Tier Principle Architecture

The central structural feature of the CommonGround constitution is its organization of principles into two tiers with different amendment requirements. Tier 1 principles are inviolable: they cannot be amended through any governance process, regardless of the level of support such a process achieves. Tier 2 principles are constitutional values that can be revised through supermajority, representing considered defaults that most communities should preserve but that sovereign communities may adapt to their circumstances.

The rationale for this two-tier architecture requires careful articulation, because the category of the unamendable is in genuine tension with the principle of self-governance. If a community cannot change any rule it chooses, in what sense is it truly self-governing? The answer is that some rules are not merely governance preferences but structural preconditions for governance itself. A community that governs away the right to revoke delegated authority has not exercised self-governance; it has abolished it. A community that allows its shared infrastructure to be privatized has not made a collective decision; it has dissolved the collective. Tier 1 principles identify the rules that must remain constant precisely because they are the rules that make all other rules possible.

Tier 2 principles occupy a different position. They are not structural preconditions for governance but considered judgments about how governance should work — judgments that most communities should preserve but that communities can, through deliberate collective action, revise if their particular circumstances warrant it. The supermajority requirement for amending Tier 2 principles performs several functions: it ensures that constitutional revision reflects broad rather than narrow support, it creates a cooling-off period that filters out changes driven by temporary majorities or momentary circumstances, and it signals to the community that constitutional revision is a weighty matter requiring deliberate attention rather than a routine governance action.

The placement of any specific principle in Tier 1 versus Tier 2 is itself a substantive constitutional choice. The CommonGround constitution places four principles in Tier 1 — Revocability, Due Process, Commons Protection, and Forkability — and five in Tier 2. The case for each placement is developed in the following sections.

---

## 4. Tier 1: The Inviolable Principles

### 4.1 Revocability

The first inviolable principle is that all delegations are revocable. No delegation of governance authority may be made permanent or irrevocable, regardless of the breadth of support for doing so.

The argument for making revocability unamendable rather than merely a default preference is categorical. Irrevocable delegation is not a form of governance; it is the transfer of sovereignty. A community that delegates authority irrevocably has created a ruler — an entity whose power does not derive from ongoing consent and cannot be recalled by those affected by its decisions. The formal procedures that preceded the delegation do not change this structural reality: once sovereignty is transferred, the formal mechanisms of governance no longer operate on the actual locus of power but on its appearance.

The principle does not limit the breadth or duration of delegation. A community may delegate enormous authority for extended periods. It may create roles with substantial operational powers. It may authorize stewards to make emergency decisions without prior deliberation. What it cannot do is make any of these arrangements permanent — the right to revoke always remains with the community, as an inalienable collective right that no delegation can encompass.

Revocability also has important implications for the dynamics of governance over time. Systems designed on the assumption that authority once granted remains in place tend to accumulate structural rigidities as initial delegations outlast the circumstances that justified them. By requiring that all delegations be periodically renewed — explicitly, with fresh consent — the revocability principle keeps the distribution of authority responsive to the community's current judgment rather than its historical choices.

### 4.2 Due Process

The second Tier 1 principle concerns the removal of community members. Those subject to removal proceedings must be able to participate in the deliberation about their removal, may not block the final decision, and are entitled to a transparent process with defined criteria and thresholds for removal.

The due process principle is inviolable because its absence would make governance a tool of exclusion. In any community with genuine stakes — where membership confers meaningful rights, access to resources, or influence over shared decisions — the power to remove members is one of the most consequential powers governance can exercise. A community that can remove members through opaque processes, without defined criteria, or without giving those members the opportunity to respond, is a community where that power will inevitably be used to silence dissent, consolidate control, or settle personal conflicts under the guise of governance.

Due process requirements do not prevent removal; they structure it. The standard is not innocence until proven guilty in the legal sense but transparency and defined criteria in the governance sense. What counts as removable conduct, what threshold of evidence or support is required, and what process will be followed — these must be specified in advance and applied consistently. The right to participate in deliberation, combined with the inability to block the final decision, threads the needle between giving the accused member a meaningful voice and allowing any individual to veto a legitimate collective judgment.

### 4.3 Commons Protection

The third Tier 1 principle is that no decision may privatize shared infrastructure, restrict exit rights, or undermine the revocability of governance. This principle is explicitly identified as supreme among all others: when it conflicts with any other part of the constitution or its policies, Commons Protection prevails.

The supremacy of Commons Protection reflects a clear-eyed assessment of the primary risk facing commons governance institutions over time. Communities can survive leadership failures, poor decisions, and temporary dysfunction. They can navigate conflicts, recover from mistakes, and adapt to changed circumstances. What they cannot survive — what permanently extinguishes the conditions for self-governance — is the enclosure of their shared infrastructure by private interests. Enclosure does not require malicious intent; it typically proceeds through a series of individually plausible steps, each of which seems reasonable in isolation, until the community finds itself dependent on infrastructure it no longer controls and unable to exit without losing its history, identity, and relationships.

Making enclosure structurally impossible — not merely discouraged or subject to supermajority reversal but literally impossible — is the appropriate institutional response to this risk. No majority vote, no matter how broad, can privatize shared infrastructure in a CommonGround community. No decision can restrict exit rights: members always retain the ability to export their data, their identity, and their participation history. And no decision can undermine the revocability of governance — that right is protected not by its own revocability but by its structural inalienability.

### 4.4 Forkability

The fourth Tier 1 principle is that any group may fork the system and its governance. Forks inherit the obligation to honor exit rights and data portability for their own members.

Forkability is the ultimate check on governance failure. If a community cannot exit and rebuild, it is captive. Governance failures that cannot be corrected through internal processes — including constitutional failures that the formal mechanisms are unable to address — must be addressable through the exit of a sufficient number of members to form a new community. The right to fork is therefore not a sign of governance weakness but a structural guarantee of governance health: a community that knows its members can always leave has strong incentives to maintain governance worth staying for.

Forkability is recursive: every fork carries forward the same guarantee. No fork may become a trap, prohibiting its own members from exiting in turn. And forkability is paired with federation: the same principle that enables divergence also enables voluntary convergence. Two or more communities may propose shared governance of specific shared resources while maintaining sovereignty over their own affairs. This federation is built upward from autonomous base units, not downward from a central authority — the federated layer exists to serve its member communities, not to supersede them.

---

## 5. Tier 2: Core Constitutional Values

### 5.1 Bootstrap and Ratification

The first Tier 2 principle formalizes the bootstrap mechanism described in Section 2. The founder establishes the initial constitution; members consent by joining; the constitution becomes ratifiable once a membership threshold is reached. This principle is in Tier 2 because its specific thresholds and mechanisms are appropriately adjustable to the scale and context of particular communities, even though its basic logic — that founding authority must eventually be subjected to community ratification — is constitutionally important.

### 5.2 Bounded Referendum Rights

The second Tier 2 principle holds that any member may initiate a referendum if supported by a minimum threshold of affected members. This right can be adjusted in its threshold but can never be reduced to zero — eliminating the referendum right entirely would eliminate the mechanism through which the revocability principle (Tier 1) can be exercised. The threshold requirement performs a signal function: a referendum supported by a meaningful fraction of affected members carries evidence that the issue is genuinely salient, distinguishing substantive governance concerns from frivolous or bad-faith uses of governance procedures.

### 5.3 Scope and Subsidiarity

The third Tier 2 principle holds that decisions should be made at the lowest level competent to address them, by those materially affected. Scope is not a background assumption but an active governance question: the scope of any decision — who counts as materially affected, what level of the governance hierarchy is appropriate, and what quorum requirements apply — must be explicitly determined and is subject to challenge during deliberation.

The subsidiarity principle has direct consequences for how participation and quorum requirements are calibrated. A decision scoped to a subgroup requires quorum from that subgroup, not from the entire membership. This prevents two complementary pathologies: the paralysis that results when any decision requires the engagement of the entire community, and the capture that results when a small group makes decisions that affect everyone while claiming the legitimacy of a supermajority of those who actually participated.

### 5.4 Deliberation First

The fourth Tier 2 principle holds that all referenda must include a structured deliberation phase before voting. No decision proceeds directly to resolution without the community having the opportunity to understand the issue through multiple perspectives. Deliberation is complete when both a minimum time floor has elapsed and participation quorum has been met.

The argument for this principle was developed in the companion paper on ICOS architecture, but its constitutional status deserves emphasis here. The principle is in Tier 2 because its specific parameters — time floors, extension mechanisms, facilitator authority — are appropriately adjustable. But its basic logic is constitutionally important: voting without deliberation is preference aggregation, not governance. Preference aggregation can efficiently answer the question of what participants currently want; it cannot answer the question of what participants would want if they understood the issue more fully, considered the perspectives of those most affected, or were confronted with the consequences of the available options. Governance at its most basic is about making decisions that the community can stand behind over time, and that requires the kind of understanding that only deliberation can build.

The facilitator's role in deliberation is carefully bounded. A facilitator may extend deliberation but cannot shorten it below the time floor. A facilitator may signal that deliberation is closing but cannot unilaterally close it. And any member may request one extension per issue if they believe a significant perspective has not been heard — giving every participant a meaningful check on the facilitator's management of the process.

### 5.5 Participation Integrity

The fifth Tier 2 principle holds that decisions require quorum thresholds and transparent rationale. Participation integrity is what distinguishes genuine collective decisions from the decisions of a small, self-selecting subset of members wearing collective legitimacy.

The principle is implemented through layered quorum requirements: an awareness quorum (a minimum percentage of affected members must have viewed the issue), a participation quorum (a minimum percentage must have contributed a perspective or explicitly stood aside), and a decision quorum determined by the method in use. These thresholds are calibrated to the stakes of the decision: removal proceedings require higher participation than routine operational decisions; constitutional amendments require higher participation than policy changes.

Participation integrity also requires attention to information accessibility. The principle is violated not only when members are excluded from formal participation but when the information required for meaningful participation is presented in ways that only experts or governance veterans can understand. Information asymmetry is the primary mechanism of capture in governance systems that lack formal hierarchy: those who control what others know control what others decide. Governance systems must therefore attend not only to who participates but to the conditions under which participation can be genuinely informed.

---

## 6. Authority Without Hierarchy: Contextual and Revocable Power

The CommonGround constitution makes a distinctive architectural choice in its authority model: there are no fixed roles and no permanent class distinctions between governance participants. All members have equal base capabilities. Authority is always contextual — delegated for a specific purpose, in a specific scope, for a defined period — and always revocable.

This design choice reflects a considered rejection of the assumption, common in both formal organizations and many DAO governance systems, that governance requires structural hierarchy — a permanent class of administrators, stewards, or role-holders who possess governance authority as an attribute of their position rather than as a delegation from the community. Structural hierarchy has genuine efficiencies: it reduces coordination costs, enables rapid decision-making in routine situations, and provides clear lines of accountability. But it also has characteristic failure modes. Hierarchical governance systems tend to concentrate information and influence among those at the top in ways that are difficult to reverse once established; to create strong incentives for those in positions of authority to protect those positions; and to generate a form of legitimacy — the legitimacy of established authority — that is difficult to challenge even when the exercise of that authority is no longer serving the community.

The CommonGround authority model achieves a comparable level of operational functionality without structural hierarchy by separating two kinds of authority that formal organizations typically bundle together: governance authority and operational stewardship. Governance authority — the power to initiate and decide issues, to delegate, to revoke — is distributed equally among all active members, with specific functions delegated per-issue or per-domain through the normal governance process. Operational stewardship — the management of infrastructure, safety, and onboarding — is separated from governance and delegated explicitly, with emergency powers logged and subject to ratification or reversal within a defined window.

The result is a form of governance in which power is always contextual, always visible, and always revocable. The absence of structural hierarchy does not eliminate power; it makes power visible by ensuring that it is always traceable to a specific delegation from a specific community, rather than appearing to inhere in a role or position. This visibility is itself a governance mechanism: communities can evaluate the distribution of influence, identify concentrations that may indicate capture, and respond through the governance process.

Facilitation — the management of deliberation on specific issues — follows the same logic. The issue initiator is the default facilitator, but any member may nominate an alternative, and if the initiator declines and no volunteer emerges, the system assigns by sortition from active members. Facilitators have real powers within deliberation but cannot vote with extra weight, cannot unilaterally close deliberation, and cannot exclude members from participation. Facilitation authority is the minimum required to make structured deliberation work, and no more.

---

## 7. Temporal Design: Stability, Renewal, and Institutional Health

The temporal design of governance systems is among the most neglected dimensions of constitutional architecture. Most governance frameworks define the procedures for making decisions without attending carefully to how decisions should persist, under what conditions they should be revisitable, and how the governance system itself should evolve over time. The CommonGround constitution treats temporal design as a first-class concern.

Every decision in CommonGround carries a stability period — a defined interval during which it cannot be relitigated through the ordinary governance process. Stability periods range from thirty days for standard operational decisions to one hundred eighty days for constitutional amendments. This design reflects the principle, developed in the companion paper, that governance systems must balance adaptability with continuity. Without stability periods, governance becomes hostage to the most energetic faction at any given moment, and the capacity for long-range planning is destroyed by the constant possibility of immediate reversal.

Stability periods can be overridden early under defined conditions: when material new information emerges that was not available during deliberation, when active demonstrable harm is occurring as a result of the decision, when a Tier 1 principle violation is discovered, or when the scope of the decision has changed significantly. Overriding a stability period requires a two-thirds supermajority, except for Tier 1 violations, which any member may flag for immediate review. These conditions are tight enough to prevent stability periods from being routinely circumvented, while broad enough to ensure that the community is not bound by decisions that have become actively harmful.

Delegation is subject to auto-expiry as a structural feature rather than as an optional configuration. Research on liquid democracy systems provides compelling evidence that participants systematically over-delegate: they delegate substantially more authority than is optimal and substantially overestimate the alignment between their delegates' views and their own. Auto-expiring delegations counteract this tendency by forcing periodic, explicit renewal — ensuring that delegation patterns reflect the community's current judgment rather than the accumulated weight of past choices that may no longer be relevant. The default expiry periods range from per-issue for facilitation to one hundred eighty days for stewardship delegations.

The system also incorporates governance health checks as a structural feature: automated prompts for the community to evaluate whether its governance mechanisms are still serving it at defined membership growth thresholds. As communities grow, the governance mechanisms appropriate for twenty members may cease to function well for two hundred. The health check mechanism creates a regular cadence of institutional self-assessment, prompting the community to evaluate its decision methods, quorum thresholds, rate limits, and facilitator selection processes before dysfunction becomes crisis.

Finally, the constitution explicitly permits governance sandboxes: time-bounded experiments with alternative governance mechanisms, limited to subgroups, with results recorded in the community's civic memory. This design feature reflects the epistemic humility appropriate to constitutional design: the community's experience will generate knowledge about governance that cannot be fully anticipated at the founding moment, and the system should be designed to incorporate that knowledge through controlled institutional experimentation rather than requiring wholesale constitutional revision as the only mechanism for learning.

---

## 8. Conclusion

The constitutional architecture described in this paper is an attempt to solve a problem that is genuinely difficult: how to create the structural conditions for self-governance in communities that are large, diverse, digitally mediated, and subject to rapid change. The two-tier principle hierarchy — inviolable Tier 1 principles protecting the preconditions for governance, amendable Tier 2 values representing considered defaults — provides a structural answer to the question of what must remain constant and what may change. The authority model — contextual, visible, revocable delegation without structural hierarchy — provides a practical answer to the question of how operational effectiveness can be achieved without sacrificing the distributed power that makes self-governance possible. And the temporal design — stability periods, auto-expiring delegations, governance health checks, and sandboxed experimentation — provides an answer to the question of how governance systems can remain adaptive over time without becoming unstable.

The CommonGround constitution is explicitly designed as a living starting point rather than a finished product. It will be adopted, adapted, and evolved by the communities that use it. The Tier 1 principles will not change — they are the structural preconditions for self-governance, not governance preferences — but the Tier 2 principles, the mechanisms that implement them, and the policy details that specify their operation will be refined through use. The communities that engage with this architecture most rigorously will generate knowledge that no amount of prior theorizing can produce, and the iterative incorporation of that knowledge into the design is itself a constitutional commitment.

What this architecture embodies, at its core, is a conviction that governance is not primarily a problem of rule design but of institutional ecology: creating the conditions under which human communities can think together well enough to govern themselves. Rules matter, but the quality of governance is ultimately determined by whether the people subject to it can understand it, trust it, and participate in shaping it. Constitutional design serves that end when it protects the structural preconditions for meaningful participation while leaving communities the sovereignty to adapt the rest.

---

## References

Ostrom, E. (1990). *Governing the Commons: The Evolution of Institutions for Collective Action*. Cambridge University Press.

Ostrom, E. (2005). *Understanding Institutional Diversity*. Princeton University Press.

Rawls, J. (1971). *A Theory of Justice*. Harvard University Press.

Habermas, J. (1996). *Between Facts and Norms: Contributions to a Discourse Theory of Law and Democracy*. MIT Press.

Blum, C., & Zuber, C. I. (2016). Liquid democracy: Potentials, problems, and perspectives. *Journal of Political Philosophy*, 24(2), 162–182.

Ford, B. (2002). Delegative democracy. *Working Paper*, Massachusetts Institute of Technology.

Lessig, L. (1999). *Code and Other Laws of Cyberspace*. Basic Books.

Zittrain, J. (2008). *The Future of the Internet — And How to Stop It*. Yale University Press.

Hess, C., & Ostrom, E. (Eds.). (2007). *Understanding Knowledge as a Commons: From Theory to Practice*. MIT Press.

Mansbridge, J. (1983). *Beyond Adversary Democracy*. University of Chicago Press.

Sunstein, C. R. (2002). The law of group polarization. *Journal of Political Philosophy*, 10(2), 175–195.

Buchanan, J. M., & Tullock, G. (1962). *The Calculus of Consent: Logical Foundations of Constitutional Democracy*. University of Michigan Press.

Elster, J. (Ed.). (1998). *Deliberative Democracy*. Cambridge University Press.
