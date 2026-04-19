import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../scroll';

export interface LayerStep {
  enterAt: number;
  settledAt: number;
}

export function buildLayerSchedule(layerCount: number): LayerStep[] {
  const stride = 1 / layerCount;
  return Array.from({ length: layerCount }, (_, i) => ({
    enterAt: Number((i * stride).toFixed(4)),
    settledAt: Number(((i + 1) * stride).toFixed(4)),
  }));
}

export function mountLayersAnchor(root: HTMLElement): void {
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-layer-id]'));
  const captionName = root.querySelector<HTMLElement>('[data-caption-name]');
  const captionTag = root.querySelector<HTMLElement>('[data-caption-tag]');
  const captionDesc = root.querySelector<HTMLElement>('[data-caption-desc]');
  const footer = root.querySelector<HTMLElement>('[data-footer-line]');
  if (layers.length === 0) return;

  const captions = [
    { name: 'L1 · Personal',    tag: 'self-awareness',      desc: 'The base layer. Presence, reflection, inner coherence — the ground every other layer rests on.' },
    { name: 'L2 · Relational',  tag: 'group coordination',  desc: 'Dyads, teams, circles. The mechanics of understanding and being understood at small scale.' },
    { name: 'L3 · Collective',  tag: 'governance',          desc: 'Decisions held by groups larger than trust. Structured deliberation, revocable authority, transparent process.' },
    { name: 'L4 · Ecological',  tag: 'stewardship',         desc: 'The commons beyond humans — land, water, knowledge, time. Governance for things no one should own.' },
    { name: 'L5 · AI',          tag: 'sensemaking',         desc: 'Machine intelligence as participant, not owner — helping groups see patterns they would otherwise miss.' },
  ];

  if (prefersReducedMotion()) {
    layers.forEach(l => { l.style.opacity = '1'; l.style.transform = 'none'; });
    if (captionName) captionName.textContent = 'Five layers';
    if (captionTag) captionTag.textContent = 'from self to sensemaking';
    if (captionDesc) captionDesc.textContent = 'Static diagram — motion disabled per user preference.';
    if (footer) footer.style.opacity = '1';
    return;
  }

  gsap.set(layers, { opacity: 0, y: 24 });
  if (footer) gsap.set(footer, { opacity: 0 });

  const schedule = buildLayerSchedule(layers.length);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
    },
  });

  schedule.forEach((step, i) => {
    const cap = captions[i];
    tl.to(
      layers[i],
      { opacity: 1, y: 0, duration: 0.5 / layers.length, ease: 'none' },
      step.enterAt,
    );
    tl.call(
      () => {
        if (captionName) captionName.textContent = cap.name;
        if (captionTag) captionTag.textContent = cap.tag;
        if (captionDesc) captionDesc.textContent = cap.desc;
      },
      [],
      step.enterAt + 0.02,
    );
  });

  if (footer) tl.to(footer, { opacity: 1, duration: 0.05, ease: 'none' }, 0.98);
}
