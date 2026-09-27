import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionConfig } from '../lib/animation/motionConfig';

gsap.registerPlugin(ScrollTrigger);

export function startHomeMotion({ animateHero }: { animateHero: boolean }): () => void {
  const motion = gsap.context(() => {
    const hero = document.querySelector<HTMLElement>('.hero');
    if (animateHero && hero && hero.getBoundingClientRect().top > -window.innerHeight * 0.25) {
      gsap.timeline({ defaults: { ease: motionConfig.ease } })
        .from('.site-header .wordmark', { y: -12, autoAlpha: 0, duration: motionConfig.content }, 0)
        .from('.primary-nav, .mobile-menu', { y: -10, autoAlpha: 0, duration: motionConfig.content }, 0.08)
        .from('.hero-title-line', { yPercent: 105, duration: motionConfig.hero, stagger: 0.14 }, 0.22)
        .from('.hero-intro .body-large', { y: 18, autoAlpha: 0, duration: motionConfig.content }, 0.64)
        .from('.hero-actions', { y: 14, autoAlpha: 0, duration: motionConfig.content }, 0.82)
        .from('.hero-footer', { y: 20, autoAlpha: 0, duration: 0.72 }, 0.62)
        .from('.route-preview li', { x: 12, autoAlpha: 0, duration: 0.42, stagger: 0.07 }, 0.94)
        .fromTo('.hero-process-trace', { strokeDashoffset: 428 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.72);
    }

    gsap.timeline({
      defaults: { ease: motionConfig.ease },
      scrollTrigger: { trigger: '.recognition', start: 'top 75%', once: true },
    })
      .from('.recognition-heading .section-title', { y: 25, duration: 0.68 })
      .from('.recognition-heading .body-large', { y: 16, duration: motionConfig.content }, '-=0.38');

    gsap.from('.value-side li, .value-decision', {
      y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.55,
      ease: motionConfig.ease,
      scrollTrigger: { trigger: '.value-canvas', start: 'top 72%', once: true },
    });

    gsap.from('.principles li', {
      y: 16, autoAlpha: 0, stagger: 0.09, duration: 0.45,
      ease: motionConfig.ease,
      scrollTrigger: { trigger: '.principles', start: 'top 80%', once: true },
    });
  }, document.body);

  const media = gsap.matchMedia();

  media.add('(hover: hover) and (pointer: fine) and (min-width: 48rem)', () => {
    let cancelled = false;
    let stopSmoothScroll: (() => void) | undefined;
    void import('../lib/animation/lenis').then(({ startSmoothScroll }) => {
      if (!cancelled) stopSmoothScroll = startSmoothScroll(gsap, ScrollTrigger);
    }).catch((error) => console.error('Optimix smooth scrolling could not start:', error));

    return () => {
      cancelled = true;
      stopSmoothScroll?.();
    };
  });

  media.add('(hover: hover) and (pointer: fine) and (min-width: 64rem)', () => {
    const hero = document.querySelector<HTMLElement>('.hero');
    const image = hero?.querySelector<HTMLElement>('.hero-art img');
    if (!hero || !image) return;

    gsap.set(image, { scale: 1.04 });
    const moveX = gsap.quickTo(image, 'xPercent', { duration: 0.8, ease: 'power2.out' });
    const moveY = gsap.quickTo(image, 'yPercent', { duration: 0.8, ease: 'power2.out' });

    const move = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveX(-x * 1.8);
      moveY(-y * 1.4);
    };
    const reset = () => {
      moveX(0);
      moveY(0);
    };

    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);

    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      gsap.killTweensOf(image);
      gsap.set(image, { clearProps: 'transform' });
    };
  });

  let active = true;
  void document.fonts.ready.then(() => {
    if (active) ScrollTrigger.refresh();
  });

  return () => {
    active = false;
    media.revert();
    motion.revert();
  };
}
