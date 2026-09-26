import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionConfig } from '../lib/animation/motionConfig';

gsap.registerPlugin(ScrollTrigger);

export function startHomeMotion({ animateHero }: { animateHero: boolean }): () => void {
  let removeGuideRefresh: (() => void) | undefined;
  let resetGuide: (() => void) | undefined;
  let resetRouteState: (() => void) | undefined;

  const motion = gsap.context(() => {
    const hero = document.querySelector<HTMLElement>('.hero');
    if (animateHero && hero && hero.getBoundingClientRect().top > -window.innerHeight * 0.25) {
      gsap.timeline({ defaults: { ease: motionConfig.ease } })
        .from('.site-header .wordmark', { y: -12, autoAlpha: 0, duration: motionConfig.content }, 0)
        .from('.primary-nav, .mobile-menu', { y: -10, autoAlpha: 0, duration: motionConfig.content }, 0.08)
        .from('.hero-eyebrow', { y: 14, autoAlpha: 0, duration: motionConfig.content }, 0.12)
        .from('.hero-title-line', { yPercent: 105, duration: motionConfig.hero, stagger: 0.14 }, 0.22)
        .from('.hero-intro .body-large', { y: 18, autoAlpha: 0, duration: motionConfig.content }, 0.64)
        .from('.hero-actions', { y: 14, autoAlpha: 0, duration: motionConfig.content }, 0.82)
        .from('.hero-footer', { y: 20, autoAlpha: 0, duration: 0.72 }, 0.62)
        .from('.route-preview li', { x: 12, autoAlpha: 0, duration: 0.42, stagger: 0.07 }, 0.94);
    }

    gsap.timeline({
      defaults: { ease: motionConfig.ease },
      scrollTrigger: { trigger: '.recognition', start: 'top 75%', once: true },
    })
      .from('.recognition-heading .eyebrow', { y: 14, autoAlpha: 0, duration: 0.42 })
      .from('.recognition-heading .section-title', { y: 25, autoAlpha: 0, duration: 0.68 }, '-=0.22')
      .from('.recognition-heading .body-large', { y: 16, autoAlpha: 0, duration: motionConfig.content }, '-=0.38')
      .from('.relay li', { x: 18, autoAlpha: 0, duration: motionConfig.content, stagger: 0.11 }, '-=0.18');

    const route = document.querySelector<HTMLElement>('.workflow-route');
    const line = route?.querySelector<HTMLElement>('.workflow-progress-line');
    const steps = route?.querySelectorAll<HTMLElement>('.workflow-step');
    const position = document.querySelector<HTMLElement>('[data-route-position]');
    const scene = document.querySelector<HTMLElement>('.workflow-scene');
    const guide = scene?.querySelector<HTMLElement>('.workflow-guide');

    if (route && line && steps?.length) {
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1,
        ease: motionConfig.scrollEase,
        scrollTrigger: {
          trigger: route,
          start: 'top 52%',
          end: 'bottom 55%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      let activeIndex = -1;
      const guidePosition = (index: number) => {
        const label = steps[index].querySelector<HTMLElement>('.workflow-step-top');
        return label && scene ? label.getBoundingClientRect().bottom - scene.getBoundingClientRect().top : 0;
      };
      const activate = (index: number) => {
        if (index === activeIndex) return;
        const firstPosition = activeIndex === -1;
        activeIndex = index;
        steps.forEach((step, stepIndex) => step.classList.toggle('is-current', stepIndex === index));
        if (position) position.textContent = String(index + 1).padStart(2, '0');
        if (guide) {
          const target = { y: guidePosition(index), autoAlpha: 0.38 };
          if (firstPosition) gsap.set(guide, target);
          else gsap.to(guide, { ...target, duration: motionConfig.content, ease: 'power2.out', overwrite: 'auto' });
        }
      };

      activate(0);
      resetRouteState = () => {
        steps.forEach((step) => step.classList.remove('is-current'));
        if (position) position.textContent = '01';
      };
      if (guide) {
        const syncGuide = () => gsap.set(guide, { y: guidePosition(activeIndex) });
        ScrollTrigger.addEventListener('refresh', syncGuide);
        removeGuideRefresh = () => ScrollTrigger.removeEventListener('refresh', syncGuide);
        resetGuide = () => {
          gsap.killTweensOf(guide);
          gsap.set(guide, { clearProps: 'transform,visibility,opacity' });
        };
      }
      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 55%',
          onEnter: () => activate(index),
          onEnterBack: () => activate(index),
        });
      });
    }
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
    removeGuideRefresh?.();
    media.revert();
    motion.revert();
    resetGuide?.();
    resetRouteState?.();
  };
}
