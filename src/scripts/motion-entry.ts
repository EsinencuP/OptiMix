const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let dispose: (() => void) | undefined;
let requestId = 0;
let firstRun = !reducedMotion.matches;
const heroFallbackTimer = window.setTimeout(() => document.documentElement.classList.add('motion-fallback'), 2000);

async function syncMotion() {
  const currentRequest = ++requestId;
  dispose?.();
  dispose = undefined;

  if (reducedMotion.matches) return;

  try {
    const requestedAt = performance.now();
    // The animation libraries are downloaded only when the visitor allows motion.
    const { startHomeMotion } = await import('./home-motion');
    if (currentRequest !== requestId || reducedMotion.matches) return;
    // If the chunk arrived late, keep the already visible hero in place.
    const animateHero = firstRun && performance.now() - requestedAt < 650;
    firstRun = false;
    dispose = startHomeMotion({ animateHero });
  } catch (error) {
    // The HTML remains complete and readable if the optional motion chunk fails.
    console.error('Optimix motion could not start:', error);
  }
}

void syncMotion();
reducedMotion.addEventListener('change', syncMotion);

window.addEventListener('pagehide', () => {
  window.clearTimeout(heroFallbackTimer);
  requestId += 1;
  dispose?.();
  dispose = undefined;
});

document.addEventListener('astro:before-swap', () => {
  requestId += 1;
  window.clearTimeout(heroFallbackTimer);
  document.documentElement.classList.remove('motion-fallback');
  dispose?.();
  dispose = undefined;
});

document.addEventListener('astro:page-load', () => {
  if (document.querySelector('.hero') && !dispose) void syncMotion();
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) void syncMotion();
});
