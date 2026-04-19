import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../scroll';

export interface PremiseStep {
  startFraction: number;
  durationFraction: number;
}

/**
 * Reveal plan: each line starts before the previous finishes for a
 * smooth cascade. Final 10% reserved for the "lift" gesture.
 */
export function buildPremiseTimeline(lineCount: number): PremiseStep[] {
  const reserved = 0.1;
  const usable = 1 - reserved;
  const stride = usable / lineCount;
  const duration = stride * 1.25;
  return Array.from({ length: lineCount }, (_, i) => ({
    startFraction: Number((i * stride).toFixed(4)),
    durationFraction: Number(duration.toFixed(4)),
  }));
}

export function mountPremiseAnchor(root: HTMLElement): void {
  const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-premise-line]'));
  const stanza = root.querySelector<HTMLElement>('[data-premise-stanza]');
  const sectionNo = root.querySelector<HTMLElement>('[data-premise-num]');
  if (lines.length === 0 || !stanza) return;

  if (prefersReducedMotion()) {
    lines.forEach((el) => {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.set(lines, { opacity: 0, filter: 'blur(6px)', y: 16 });

  const steps = buildPremiseTimeline(lines.length);
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
    },
  });

  steps.forEach((step, i) => {
    tl.to(
      lines[i],
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: step.durationFraction, ease: 'none' },
      step.startFraction,
    );
  });

  tl.to(stanza, { y: -24, duration: 0.1, ease: 'none' }, 0.9);
  if (sectionNo) tl.to(sectionNo, { opacity: 0, duration: 0.1, ease: 'none' }, 0.9);
}
