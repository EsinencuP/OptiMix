import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;

function disposeWorkflow() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
}

function initWorkflow() {
  const root = document.querySelector<HTMLElement>('[data-crm-workflow]');
  if (root === activeRoot) return;
  disposeWorkflow();
  if (!root) return;

  const tablist = root.querySelector<HTMLElement>('[data-workflow-tabs]');
  const tabs = [...root.querySelectorAll<HTMLAnchorElement>('[data-workflow-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-workflow-panel]')];
  const controls = root.querySelector<HTMLElement>('[data-workflow-controls]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-workflow-toggle]');
  const hint = root.querySelector<HTMLElement>('[data-workflow-hint]');
  const paths = [...root.querySelectorAll<SVGPathElement>('[data-workflow-segment]')];
  if (!tablist || !toggle || !controls || !hint || tabs.length !== 5 || panels.length !== tabs.length) return;
  activeRoot = root;

  const abort = new AbortController();
  const { signal } = abort;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 640px)');
  let index = 0;
  let paused = false;
  let inView = false;
  let keyboardFocused = false;
  let interval: number | undefined;
  let panelTween: gsap.core.Tween | undefined;
  let progressTween: gsap.core.Tween | undefined;

  // With non-scaling strokes, dash lengths are screen pixels, even in a scaled SVG.
  const pathLength = (path: SVGPathElement) => {
    const rect = path.getBoundingClientRect();
    return Math.hypot(rect.width, rect.height) || path.getTotalLength();
  };

  const stopTimer = () => {
    window.clearInterval(interval);
    interval = undefined;
  };

  function syncTimer() {
    stopTimer();
    if (paused || reduced.matches || !inView || keyboardFocused || document.hidden) return;
    interval = window.setInterval(() => select((index + 1) % tabs.length), 4000);
  }

  function updateProgress(animate: boolean) {
    progressTween?.kill();
    paths.forEach(path => { path.style.strokeDasharray = String(pathLength(path)); });
    if (animate && !reduced.matches) {
      progressTween = gsap.to(paths, {
        strokeDashoffset: (_order: number, path: SVGPathElement) => Number(path.dataset.workflowSegment) < index ? 0 : pathLength(path),
        duration: 0.48,
        ease: 'power2.out',
        overwrite: true,
      });
    } else {
      paths.forEach(path => { path.style.strokeDashoffset = Number(path.dataset.workflowSegment) < index ? '0' : String(pathLength(path)); });
    }
  }

  const select = (next: number, manual = false) => {
    const changed = index !== next;
    index = next;
    panelTween?.kill();
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
      panels[position].style.removeProperty('opacity');
    });
    root.dataset.activeStep = String(index);
    updateProgress(changed);
    if (changed && !reduced.matches) {
      panelTween = gsap.fromTo(panels[index], { opacity: 0 }, { opacity: 1, duration: 0.32, clearProps: 'opacity', overwrite: true });
    }
    if (manual) syncTimer();
  };

  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, position) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[position].id);
    panels[position].setAttribute('role', 'tabpanel');
    panels[position].tabIndex = 0;
    tab.addEventListener('click', event => {
      event.preventDefault();
      keyboardFocused = event.detail === 0;
      select(position, true);
    }, { signal });
    tab.addEventListener('keydown', event => {
      const forward = mobile.matches ? 'ArrowDown' : 'ArrowRight';
      const backward = mobile.matches ? 'ArrowUp' : 'ArrowLeft';
      let next: number;
      if (event.key === forward) next = (position + 1) % tabs.length;
      else if (event.key === backward) next = (position + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === ' ') next = position;
      else return;
      event.preventDefault();
      keyboardFocused = true;
      tabs[next].focus();
      select(next, true);
    }, { signal });
  });

  const updateMotion = () => {
    panelTween?.kill();
    panels.forEach(panel => panel.style.removeProperty('opacity'));
    updateProgress(false);
    toggle.hidden = reduced.matches;
    toggle.textContent = paused ? toggle.dataset.playLabel! : toggle.dataset.pauseLabel!;
    hint.textContent = reduced.matches ? hint.dataset.reducedHint! : hint.dataset.autoHint!;
    tablist.setAttribute('aria-orientation', mobile.matches ? 'vertical' : 'horizontal');
    syncTimer();
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.textContent = paused ? toggle.dataset.playLabel! : toggle.dataset.pauseLabel!;
    syncTimer();
  }, { signal });
  root.addEventListener('keydown', () => { keyboardFocused = true; syncTimer(); }, { signal });
  root.addEventListener('pointerdown', () => { keyboardFocused = false; syncTimer(); }, { signal });
  root.addEventListener('focusin', event => {
    keyboardFocused = event.target instanceof Element && event.target.matches(':focus-visible');
    syncTimer();
  }, { signal });
  root.addEventListener('focusout', event => {
    if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) { keyboardFocused = false; syncTimer(); }
  }, { signal });
  document.addEventListener('visibilitychange', syncTimer, { signal });
  reduced.addEventListener('change', updateMotion, { signal });
  mobile.addEventListener('change', updateMotion, { signal });

  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
    syncTimer();
  }, { threshold: 0.15 });
  observer.observe(root);
  const resize = new ResizeObserver(() => updateProgress(false));
  const track = root.querySelector('.ox-workflow-track');
  if (track) resize.observe(track);

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(root.querySelectorAll('[data-workflow-route]'), {
      strokeDasharray: (_order: number, path: SVGPathElement) => pathLength(path),
      strokeDashoffset: (_order: number, path: SVGPathElement) => pathLength(path),
    }, {
      strokeDashoffset: 0,
      duration: 1.02,
      ease: 'power2.out',
      clearProps: 'strokeDasharray,strokeDashoffset',
      scrollTrigger: { trigger: root, start: 'top 88%', once: true },
    });
  }, root);

  root.dataset.workflowEnhanced = 'true';
  controls.hidden = false;
  select(0);
  updateMotion();

  cleanup = () => {
    stopTimer();
    observer.disconnect();
    resize.disconnect();
    abort.abort();
    panelTween?.kill();
    progressTween?.kill();
    media.revert();
    paths.forEach(path => { path.style.removeProperty('stroke-dashoffset'); path.style.removeProperty('stroke-dasharray'); });
    tabs.forEach((tab, position) => {
      tab.classList.toggle('is-active', position === 0);
      ['role', 'aria-selected', 'aria-controls', 'tabindex'].forEach(attribute => tab.removeAttribute(attribute));
      panels[position].hidden = false;
      panels[position].removeAttribute('role');
      panels[position].removeAttribute('tabindex');
      panels[position].style.removeProperty('opacity');
    });
    tablist.removeAttribute('role');
    tablist.removeAttribute('aria-orientation');
    controls.hidden = true;
    delete root.dataset.workflowEnhanced;
    delete root.dataset.activeStep;
  };
}

initWorkflow();
document.addEventListener('astro:page-load', initWorkflow);
document.addEventListener('astro:before-swap', disposeWorkflow);
window.addEventListener('pagehide', disposeWorkflow);
window.addEventListener('pageshow', event => { if (event.persisted) initWorkflow(); });
