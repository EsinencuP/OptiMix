import { moduleSlugs } from '../content/portfolio';
let dispose: (() => void) | undefined;

function setupDemo(): () => void {
  const root = document.querySelector<HTMLElement>('[data-demo]');
  if (!root) return () => {};
  const steps = [...root.querySelectorAll<HTMLElement>('[data-demo-step]')];
  const scenarios = [...root.querySelectorAll<HTMLInputElement>('input[name="demo-scenario"]')];
  const next = root.querySelector<HTMLButtonElement>('[data-demo-next]');
  const resolve = root.querySelector<HTMLButtonElement>('[data-demo-resolve]');
  const restart = root.querySelector<HTMLButtonElement>('[data-demo-restart]');
  const status = root.querySelector<HTMLElement>('[data-demo-status]');
  if (!next || !resolve || !restart || !status || !steps.length) return () => {};

  const requestedStep = new URLSearchParams(window.location.search).get('step');
  const initialStep = moduleSlugs.findIndex(slug => slug === requestedStep);
  let current = initialStep >= 0 ? initialStep : 0;
  let halted = false;
  let reviewed = false;
  const render = () => {
    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === current && !halted);
      step.classList.toggle('is-complete', index < current);
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    next.hidden = halted || current >= steps.length;
    resolve.hidden = !halted;
    status.textContent = halted ? root.dataset.halted ?? '' : current >= steps.length ? root.dataset.complete ?? '' : `${root.dataset.activeLabel}: ${steps[current].querySelector('h2')?.textContent ?? ''}`;
  };
  const reset = () => { current = 0; halted = false; reviewed = false; render(); };
  const advance = () => {
    if (current === 1 && scenarios.find((item) => item.checked)?.value === 'exception' && !reviewed) {
      halted = true;
    } else {
      current += 1;
    }
    render();
  };
  const review = () => { reviewed = true; halted = false; current = 2; render(); };
  next.addEventListener('click', advance);
  resolve.addEventListener('click', review);
  restart.addEventListener('click', reset);
  scenarios.forEach((item) => item.addEventListener('change', reset));
  render();
  return () => {
    next.removeEventListener('click', advance);
    resolve.removeEventListener('click', review);
    restart.removeEventListener('click', reset);
    scenarios.forEach((item) => item.removeEventListener('change', reset));
  };
}

function sync() { dispose?.(); dispose = setupDemo(); }
sync();
document.addEventListener('astro:page-load', sync);
document.addEventListener('astro:before-swap', () => { dispose?.(); dispose = undefined; });
