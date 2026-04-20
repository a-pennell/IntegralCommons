import { prefersReducedMotion } from './scroll';

type HeroKey = 'wordmark' | 'tagline' | 'rung' | 'scroll';

interface Step {
  attr: string;
  delay: number;
  duration: number;
  letterSpacing?: [string, string];
}

const STEPS: Step[] = [
  { attr: 'data-hero-wordmark', delay: 0,   duration: 1100, letterSpacing: ['-0.04em', '-0.02em'] },
  { attr: 'data-hero-tagline',  delay: 220, duration: 900 },
  { attr: 'data-hero-rung',     delay: 500, duration: 900 },
  { attr: 'data-hero-scroll',   delay: 800, duration: 900 },
];

export function mountHeroEntrance(): void {
  if (typeof window === 'undefined') return;
  const targets = STEPS.map((s) => ({
    step: s,
    el: document.querySelector<HTMLElement>(`[${s.attr}]`),
  })).filter((t): t is { step: Step; el: HTMLElement } => !!t.el);

  if (targets.length === 0) return;

  if (prefersReducedMotion()) {
    targets.forEach(({ el }) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  targets.forEach(({ step, el }) => {
    const from: Keyframe = { opacity: 0, transform: 'translateY(16px)' };
    const to: Keyframe = { opacity: 1, transform: 'translateY(0)' };
    if (step.letterSpacing) {
      from.letterSpacing = step.letterSpacing[0];
      to.letterSpacing = step.letterSpacing[1];
      from.transform = 'translateY(24px)';
    }
    el.animate([from, to], {
      duration: step.duration,
      delay: step.delay,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'both',
    });
  });
}
