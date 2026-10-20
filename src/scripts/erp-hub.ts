import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
gsap.registerPlugin(MotionPathPlugin);

let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;
function disposeHub() { cleanup?.(); cleanup = undefined; activeRoot = null; }

function initHub() {
  const root = document.querySelector<HTMLElement>('[data-erp-hub]');
  if (root === activeRoot) return;
  disposeHub();
  if (!root) return;
  const map = root.querySelector<HTMLElement>('[data-hub-map]');
  const nodes = [...root.querySelectorAll<HTMLAnchorElement>('[data-hub-node]')];
  const panels = [...root.querySelectorAll<HTMLDetailsElement>('[data-hub-panel]')];
  const paths = [...root.querySelectorAll<SVGPathElement>('[data-hub-path]')];
  const dots = [...root.querySelectorAll<SVGCircleElement>('[data-hub-dot]')];
  const tooltip = root.querySelector<HTMLElement>('[data-hub-tooltip]');
  const title = tooltip?.querySelector<HTMLElement>('[data-hub-tooltip-title]');
  const body = tooltip?.querySelector<HTMLElement>('[data-hub-tooltip-body]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-hub-flow-toggle]');
  if (!map || !tooltip || !title || !body || !toggle || nodes.length !== 6 || panels.length !== 6) return;
  activeRoot = root;
  const abort = new AbortController();
  const { signal } = abort;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = gsap.matchMedia();
  let flow: gsap.core.Timeline | undefined;
  let tooltipTween: gsap.core.Tween | undefined;
  let panelTween: gsap.core.Tween | undefined;
  const nodeTweens = new Map<HTMLAnchorElement, gsap.core.Tween>();
  let hovered: HTMLAnchorElement | null = null;
  let dismissed: HTMLAnchorElement | null = null;
  let hideTimer: number | undefined;
  let inView = false;
  let paused = false;

  const syncFlow = () => {
    if (inView && !paused && !document.hidden && !reduced.matches) flow?.play();
    else flow?.pause();
  };
  const syncSelection = () => {
    nodes.forEach((node, index) => {
      node.setAttribute('aria-expanded', String(panels[index].open));
      node.classList.toggle('is-active', panels[index].open);
      paths[index].classList.toggle('is-active', panels[index].open);
    });
  };
  const scaleNode = (node: HTMLAnchorElement, active: boolean) => {
    nodeTweens.get(node)?.kill();
    if (reduced.matches) { node.style.removeProperty('transform'); return; }
    nodeTweens.set(node, gsap.to(node, { scale: active ? 1.05 : 1, duration: 0.18, ease: 'power2.out', overwrite: true }));
  };
  const positionTooltip = () => {
    if (!hovered || tooltip.hidden) return;
    const nodeRect = hovered.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(root).getPropertyValue('--portfolio-space-2')) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const x = nodeRect.left - mapRect.left + nodeRect.width / 2 - tooltip.offsetWidth / 2;
    const below = nodeRect.top - mapRect.top < mapRect.height / 2;
    const y = below ? nodeRect.bottom - mapRect.top + gap : nodeRect.top - mapRect.top - tooltip.offsetHeight - gap;
    tooltip.style.left = `${Math.max(0, Math.min(x, mapRect.width - tooltip.offsetWidth))}px`;
    tooltip.style.top = `${Math.max(0, Math.min(y, mapRect.height - tooltip.offsetHeight))}px`;
  };
  const hideTooltip = () => {
    window.clearTimeout(hideTimer);
    tooltipTween?.kill();
    if (hovered) scaleNode(hovered, false);
    hovered = null;
    tooltip.hidden = true;
    tooltip.style.removeProperty('opacity');
    nodes.forEach(node => node.removeAttribute('aria-describedby'));
    paths.forEach(path => path.classList.remove('is-hovered'));
  };
  const showTooltip = (node: HTMLAnchorElement) => {
    window.clearTimeout(hideTimer);
    if (dismissed === node) return;
    const changed = hovered !== node || tooltip.hidden;
    if (hovered && hovered !== node) scaleNode(hovered, false);
    hovered = node;
    title.textContent = node.dataset.hubTitle ?? '';
    body.textContent = node.dataset.hubSummary ?? '';
    tooltip.hidden = false;
    nodes.forEach(other => other.removeAttribute('aria-describedby'));
    node.setAttribute('aria-describedby', tooltip.id);
    paths.forEach(path => path.classList.toggle('is-hovered', path.dataset.hubPath === node.dataset.hubNode));
    positionTooltip();
    scaleNode(node, true);
    if (changed) {
      tooltipTween?.kill();
      if (!reduced.matches) tooltipTween = gsap.fromTo(tooltip, { opacity: 0 }, { opacity: 1, duration: 0.18, clearProps: 'opacity' });
    }
  };
  const deferHide = () => {
    if (hovered === document.activeElement && hovered?.matches(':focus-visible')) return;
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hideTooltip, 180);
  };

  nodes.forEach((node, index) => {
    node.setAttribute('role', 'button');
    node.setAttribute('aria-controls', panels[index].id);
    node.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { dismissed = null; showTooltip(node); } }, { signal });
    node.addEventListener('pointerleave', () => { dismissed = null; deferHide(); }, { signal });
    node.addEventListener('focus', () => { if (node.matches(':focus-visible')) showTooltip(node); }, { signal });
    node.addEventListener('blur', () => { dismissed = null; deferHide(); }, { signal });
    node.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); node.click(); }
    }, { signal });
    node.addEventListener('click', event => {
      event.preventDefault();
      hideTooltip();
      const nextOpen = !panels[index].open;
      panels.forEach(panel => { panel.open = false; });
      panels[index].open = nextOpen;
      syncSelection();
      panelTween?.kill();
      root.querySelectorAll<HTMLElement>('.ox-erp-module-body').forEach(el => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); });
      if (nextOpen && !reduced.matches) panelTween = gsap.fromTo(panels[index].querySelector('.ox-erp-module-body'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, clearProps: 'opacity,transform' });
    }, { signal });
    panels[index].addEventListener('toggle', () => {
      if (panels[index].open) panels.forEach((panel, other) => { if (other !== index) panel.open = false; });
      syncSelection();
    }, { signal });
  });
  tooltip.addEventListener('pointerenter', () => window.clearTimeout(hideTimer), { signal });
  tooltip.addEventListener('pointerleave', deferHide, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !tooltip.hidden) { dismissed = hovered; hideTooltip(); }
  }, { signal });
  document.addEventListener('pointerdown', event => { if (event.target instanceof Node && !map.contains(event.target)) hideTooltip(); }, { signal });
  document.addEventListener('visibilitychange', syncFlow, { signal });
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.textContent = paused ? toggle.dataset.play! : toggle.dataset.pause!;
    syncFlow();
  }, { signal });
  reduced.addEventListener('change', () => {
    hideTooltip();
    nodes.forEach(node => { nodeTweens.get(node)?.kill(); node.style.removeProperty('transform'); });
    panelTween?.kill();
    root.querySelectorAll<HTMLElement>('.ox-erp-module-body').forEach(el => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); });
    toggle.hidden = reduced.matches;
    syncFlow();
  }, { signal });
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncFlow(); });
  observer.observe(map);
  const resize = new ResizeObserver(positionTooltip);
  resize.observe(map);
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    flow = gsap.timeline({ paused: true });
    gsap.set(dots, { opacity: 1 });
    dots.forEach((dot, index) => {
      // Paths and dots share SVG coordinates, so resizing needs no screen-space alignment.
      flow!.to(dot, { motionPath: { path: paths[index].getAttribute('d')!, autoRotate: false }, duration: 2.6 + index * 0.25, repeat: -1, ease: 'none' }, 0);
    });
    syncFlow();
    return () => { flow = undefined; };
  }, root);
  toggle.hidden = reduced.matches;
  root.dataset.hubEnhanced = 'true';
  syncSelection();

  cleanup = () => {
    abort.abort();
    observer.disconnect();
    resize.disconnect();
    window.clearTimeout(hideTimer);
    tooltipTween?.kill();
    panelTween?.kill();
    nodeTweens.forEach(tween => tween.kill());
    motion.revert();
    tooltip.hidden = true;
    tooltip.removeAttribute('style');
    nodes.forEach(node => {
      node.style.removeProperty('transform');
      node.classList.remove('is-active');
      ['role', 'aria-controls', 'aria-expanded', 'aria-describedby'].forEach(attribute => node.removeAttribute(attribute));
    });
    paths.forEach(path => path.classList.remove('is-active', 'is-hovered'));
    panels.forEach(panel => { panel.open = false; });
    root.querySelectorAll<HTMLElement>('.ox-erp-module-body').forEach(el => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); });
    toggle.hidden = true;
    delete root.dataset.hubEnhanced;
  };
}
initHub();
document.addEventListener('astro:page-load', initHub);
document.addEventListener('astro:before-swap', disposeHub);
window.addEventListener('pagehide', disposeHub);
window.addEventListener('pageshow', event => { if (event.persisted) initHub(); });
