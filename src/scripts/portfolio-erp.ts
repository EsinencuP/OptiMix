import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;
function disposeErpMotion() { cleanup?.(); cleanup = undefined; activeRoot = null; }
function initErpMotion() {
  const root = document.querySelector<HTMLElement>('[data-erp-page]');
  if (root === activeRoot) return;
  disposeErpMotion();
  if (!root) return;
  activeRoot = root;
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(root.querySelectorAll('[data-erp-entrance]'), {
      opacity: 0, y: 24, duration: 0.58, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform',
      scrollTrigger: { trigger: root.querySelector('.ox-erp-hero'), start: 'top 90%', once: true },
    });
  }, root);
  cleanup = () => media.revert();
}
initErpMotion();
document.addEventListener('astro:page-load', initErpMotion);
document.addEventListener('astro:before-swap', disposeErpMotion);
window.addEventListener('pagehide', disposeErpMotion);
window.addEventListener('pageshow', event => { if (event.persisted) initErpMotion(); });
