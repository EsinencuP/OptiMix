import { moduleSlugs } from '../content/portfolio';
let cleanup: (() => void) | undefined;
function initHeader() {
  cleanup?.();
  const menu = document.getElementById('ox-mobile-nav');
  const trigger = document.querySelector('.ox-menu-trigger');
  if (!(menu instanceof HTMLElement) || !(trigger instanceof HTMLButtonElement)) return;
  const desktop = window.matchMedia('(min-width: 961px)');
  const controller = new AbortController();
  const options = {signal:controller.signal};
  const services = [...document.querySelectorAll<HTMLDetailsElement>('[data-services-menu]')];
  const canHover=window.matchMedia('(hover:hover) and (pointer:fine)');
  services.forEach(details=>{
    const summary=details.querySelector('summary')!;
    const links=[...details.querySelectorAll<HTMLAnchorElement>('a')];
    details.addEventListener('pointerenter',()=>{if(desktop.matches&&canHover.matches) details.open=true;},options);
    details.addEventListener('pointerleave',()=>{if(desktop.matches&&!details.contains(document.activeElement)) details.open=false;},options);
    details.addEventListener('focusout',event=>{if(!details.contains(event.relatedTarget as Node)) details.open=false;},options);
    details.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();details.open=false;summary.focus();}
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){
        event.preventDefault();details.open=true;
        const current=links.indexOf(document.activeElement as HTMLAnchorElement);
        const next=current<0?(event.key==='ArrowDown'?0:links.length-1):(current+(event.key==='ArrowDown'?1:-1)+links.length)%links.length;
        links[next]?.focus();
      }
    },options);
  });
  document.addEventListener('click',event=>{services.forEach(details=>{if(!details.contains(event.target as Node))details.open=false;});},options);
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
    controller.abort();
    menu.removeEventListener('toggle', expanded);
    menu.removeEventListener('click', navigate);
    desktop.removeEventListener('change', resize);
  };
}
initHeader();
document.addEventListener('astro:page-load', initHeader);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
