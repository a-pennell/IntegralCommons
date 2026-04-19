import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let lenis: Lenis | null = null;

export function initScroll(): Lenis | null {
  if (typeof window === 'undefined') return null;
  if (lenis) return lenis;

  const reduced = prefersReducedMotion();

  lenis = new Lenis({
    duration: reduced ? 0 : 1.1,
    smoothWheel: !reduced,
    lerp: 0.08,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyScroll(): void {
  lenis?.destroy();
  lenis = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

export function installBaselineReveal(root: Document | HTMLElement = document): void {
  if (typeof window === 'undefined') return;
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return;

  if (prefersReducedMotion()) {
    targets.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  gsap.set(targets, { opacity: 0, y: 12 });
  targets.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'cubic-bezier(0.16,1,0.3,1)',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
}
