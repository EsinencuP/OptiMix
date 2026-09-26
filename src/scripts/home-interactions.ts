let dispose: (() => void) | undefined;
export {};

function setupHomeInteractions(): () => void {
  const relay = document.querySelector<HTMLElement>('.relay');
  const relayProgress = document.querySelector<HTMLElement>('.relay-progress > span');
  const route = document.querySelector<HTMLElement>('.workflow-route');
  const routeProgress = document.querySelector<HTMLElement>('.workflow-route-progress > span');
  const routeLine = document.querySelector<HTMLElement>('.workflow-progress-line');
  const steps = route?.querySelectorAll<HTMLElement>('.workflow-step');
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.track-controls button')];
  let frame = 0;

  const update = () => {
    frame = 0;
    if (relay && relayProgress) {
      const total = Math.max(1, relay.scrollWidth);
      const progress = Math.min(1, (relay.scrollLeft + relay.clientWidth) / total);
      relayProgress.style.transform = `scaleX(${progress})`;
    }
    if (route && routeProgress && routeLine && steps?.length && matchMedia('(min-width: 48.01rem)').matches) {
      const progress = Math.min(1, (route.scrollLeft + route.clientWidth) / Math.max(1, route.scrollWidth));
      routeProgress.style.transform = `scaleX(${progress})`;
      routeLine.style.transform = `scaleX(${progress})`;
      const center = route.scrollLeft + route.clientWidth * .45;
      let active = 0;
      steps.forEach((step, index) => {
        if (step.offsetLeft <= center) active = index;
      });
      steps.forEach((step, index) => step.classList.toggle('is-current', index === active));
    } else {
      steps?.forEach((step) => step.classList.remove('is-current'));
    }
    buttons.forEach((button) => {
      const track = button.dataset.track === 'relay' ? relay : route;
      if (!track) return;
      const backwards = button.dataset.direction === '-1';
      button.disabled = backwards ? track.scrollLeft <= 2 : track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const scrollByCard = (event: KeyboardEvent, track: HTMLElement) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const card = track.querySelector<HTMLElement>('li');
    if (!card || track.scrollWidth <= track.clientWidth) return;
    event.preventDefault();
    track.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * card.getBoundingClientRect().width, behavior: 'smooth' });
  };
  const relayKey = (event: KeyboardEvent) => { if (relay) scrollByCard(event, relay); };
  const routeKey = (event: KeyboardEvent) => { if (route) scrollByCard(event, route); };
  const buttonClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const track = button.dataset.track === 'relay' ? relay : route;
    const card = track?.querySelector<HTMLElement>('li');
    if (!track || !card) return;
    const direction = Number(button.dataset.direction) || 1;
    track.scrollBy({ left: card.getBoundingClientRect().width * direction, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  relay?.addEventListener('scroll', schedule, { passive: true });
  route?.addEventListener('scroll', schedule, { passive: true });
  relay?.addEventListener('keydown', relayKey);
  route?.addEventListener('keydown', routeKey);
  buttons.forEach((button) => button.addEventListener('click', buttonClick));
  window.addEventListener('resize', schedule, { passive: true });
  schedule();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    relay?.removeEventListener('scroll', schedule);
    route?.removeEventListener('scroll', schedule);
    relay?.removeEventListener('keydown', relayKey);
    route?.removeEventListener('keydown', routeKey);
    buttons.forEach((button) => button.removeEventListener('click', buttonClick));
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
