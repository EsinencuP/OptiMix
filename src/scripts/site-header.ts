import { moduleSlugs } from '../content/portfolio';
let cleanup: (() => void) | undefined;
function initHeader() {
  cleanup?.();
  const menu = document.getElementById('ox-mobile-nav');
  const trigger = document.querySelector('.ox-menu-trigger');
  if (!(menu instanceof HTMLElement) || !(trigger instanceof HTMLButtonElement)) return;
  const desktop = window.matchMedia('(min-width: 961px)');
  const expanded = () => trigger.setAttribute('aria-expanded', String(menu.matches(':popover-open')));
  const close = () => { if (menu.matches(':popover-open')) menu.hidePopover(); };
  const navigate = (event: MouseEvent) => { if (event.target instanceof Element && event.target.closest('a')) close(); };
  const resize = () => { if (desktop.matches) close(); };
  menu.addEventListener('toggle', expanded);
  menu.addEventListener('click', navigate);
  desktop.addEventListener('change', resize);
  expanded();
  const step = new URLSearchParams(window.location.search).get('step');
  if (moduleSlugs.some(slug => slug === step)) {
    document.querySelectorAll<HTMLAnchorElement>('[data-locale-link]').forEach(link => {
      const target = new URL(link.href);
      if (target.pathname.endsWith('/demo/procurement/')) { target.searchParams.set('step', step!); link.href = target.href; }
    });
  }
  cleanup = () => {
    menu.removeEventListener('toggle', expanded);
    menu.removeEventListener('click', navigate);
    desktop.removeEventListener('change', resize);
  };
}
initHeader();
document.addEventListener('astro:page-load', initHeader);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
