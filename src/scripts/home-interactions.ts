let dispose: (() => void) | undefined;
export {};

function setupHomeInteractions(): () => void {
  const relay = document.querySelector<HTMLElement>('.relay');
  const relayProgress = document.querySelector<HTMLElement>('.relay-progress > span');
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.track-controls button[data-track="relay"]')];
  const valueCanvas = document.querySelector<HTMLElement>('[data-value-canvas]');
  let frame = 0;

  const update = () => {
    frame = 0;
    if (!relay) return;
    const total = Math.max(1, relay.scrollWidth);
    const progress = Math.min(1, (relay.scrollLeft + relay.clientWidth) / total);
    if (relayProgress) relayProgress.style.transform = `scaleX(${progress})`;
    buttons.forEach((button) => {
      const backwards = button.dataset.direction === '-1';
      button.disabled = backwards ? relay.scrollLeft <= 2 : relay.scrollLeft + relay.clientWidth >= relay.scrollWidth - 2;
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const cardWidth = () => relay?.querySelector<HTMLElement>('li')?.getBoundingClientRect().width ?? 0;
  const keydown = (event: KeyboardEvent) => {
    if (!relay || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') || relay.scrollWidth <= relay.clientWidth) return;
    event.preventDefault();
    relay.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * cardWidth(), behavior: 'smooth' });
  };
  const click = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    relay?.scrollBy({ left: cardWidth() * (Number(button.dataset.direction) || 1), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const point = (event: PointerEvent) => {
    if (!valueCanvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = valueCanvas.getBoundingClientRect();
    valueCanvas.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
    valueCanvas.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  };
  const resetPoint = () => {
    valueCanvas?.style.setProperty('--pointer-x', '50%');
    valueCanvas?.style.setProperty('--pointer-y', '50%');
  };

  relay?.addEventListener('scroll', schedule, { passive: true });
  relay?.addEventListener('keydown', keydown);
  buttons.forEach((button) => button.addEventListener('click', click));
  valueCanvas?.addEventListener('pointermove', point);
  valueCanvas?.addEventListener('pointerleave', resetPoint);
  window.addEventListener('resize', schedule, { passive: true });
  schedule();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    relay?.removeEventListener('scroll', schedule);
    relay?.removeEventListener('keydown', keydown);
    buttons.forEach((button) => button.removeEventListener('click', click));
    valueCanvas?.removeEventListener('pointermove', point);
    valueCanvas?.removeEventListener('pointerleave', resetPoint);
    window.removeEventListener('resize', schedule);
  };
}

function sync() {
  dispose?.();
  dispose = document.querySelector('.hero') ? setupHomeInteractions() : undefined;
}

sync();
document.addEventListener('astro:page-load', sync);
document.addEventListener('astro:before-swap', () => { dispose?.(); dispose = undefined; });
