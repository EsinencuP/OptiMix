let cleanup: (() => void) | undefined;

function initHeader() {
  cleanup?.();
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;

  const trigger = header.querySelector<HTMLButtonElement>('.mobile-menu-trigger');
  const menu = header.querySelector<HTMLElement>('.mobile-nav-popover');
  const desktop = window.matchMedia('(min-width: 72.01rem)');
  const updateScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  const updateExpanded = () => trigger?.setAttribute('aria-expanded', String(menu?.matches(':popover-open') ?? false));
  const closeAfterNavigation = (event: MouseEvent) => {
    if ((event.target as Element).closest('a[href]')) menu?.hidePopover();
  };
  const closeOnDesktop = () => {
    if (desktop.matches && menu?.matches(':popover-open')) menu.hidePopover();
  };
  const interruptAnchorScroll = () => { document.documentElement.dataset.anchorScrollInterrupted = 'true'; };
  const resetAnchorScroll = () => { document.documentElement.dataset.anchorScrollInterrupted = 'false'; };
  const interruptOnKey = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) interruptAnchorScroll();
  };

  updateScroll();
  updateExpanded();
  if (document.documentElement.dataset.anchorScrollInterrupted === undefined) resetAnchorScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('wheel', interruptAnchorScroll, { passive: true });
  window.addEventListener('touchmove', interruptAnchorScroll, { passive: true });
  window.addEventListener('pointerdown', interruptAnchorScroll, { passive: true });
  window.addEventListener('keydown', interruptOnKey);
  window.addEventListener('hashchange', resetAnchorScroll);
  menu?.addEventListener('toggle', updateExpanded);
  menu?.addEventListener('click', closeAfterNavigation);
  desktop.addEventListener('change', closeOnDesktop);

  cleanup = () => {
    window.removeEventListener('scroll', updateScroll);
    window.removeEventListener('wheel', interruptAnchorScroll);
    window.removeEventListener('touchmove', interruptAnchorScroll);
    window.removeEventListener('pointerdown', interruptAnchorScroll);
    window.removeEventListener('keydown', interruptOnKey);
    window.removeEventListener('hashchange', resetAnchorScroll);
    menu?.removeEventListener('toggle', updateExpanded);
    menu?.removeEventListener('click', closeAfterNavigation);
    desktop.removeEventListener('change', closeOnDesktop);
  };
}

initHeader();
document.addEventListener('astro:before-swap', () => { document.documentElement.dataset.anchorScrollInterrupted = 'false'; });
document.addEventListener('astro:page-load', initHeader);
