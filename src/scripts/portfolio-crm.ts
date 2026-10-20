import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;

function disposeCrmMotion() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
}

function initCrmMotion() {
  const root = document.querySelector<HTMLElement>('[data-crm-page]');
  if (root === activeRoot) return;
  disposeCrmMotion();
  if (!root) return;
  activeRoot = root;

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(root.querySelectorAll('[data-crm-entrance]'), {
      opacity: 0,
      y: 24,
      duration: 0.58,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: root.querySelector('.ox-crm-hero'), start: 'top 90%', once: true },
    });

    root.querySelectorAll<HTMLElement>('[data-crm-feature]').forEach(card => {
      gsap.from(card, {
        opacity: 0,
        y: 24,
        duration: 0.58,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: card, start: 'top 92%', once: true },
      });
    });
  }, root);

  cleanup = () => media.revert();
}

initCrmMotion();
document.addEventListener('astro:page-load', initCrmMotion);
document.addEventListener('astro:before-swap', disposeCrmMotion);
window.addEventListener('pagehide', disposeCrmMotion);
window.addEventListener('pageshow', event => { if (event.persisted) initCrmMotion(); });
