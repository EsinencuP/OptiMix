export {};

let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;

function disposeDemoAccess() {
  cleanup?.();
  cleanup = undefined;
  activeRoot = null;
}

function initDemoAccess() {
  const root = document.querySelector<HTMLElement>('[data-crm-demo-access]');
  if (root === activeRoot) return;
  disposeDemoAccess();
  if (!root) return;
  const status = root.querySelector<HTMLElement>('[data-copy-status]');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-demo-copy]')];
  if (!status || buttons.length !== 2) return;
  activeRoot = root;
  const abort = new AbortController();
  const { signal } = abort;

  buttons.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const field = button.dataset.demoCopy;
      if (field !== 'email' && field !== 'password') return;
      const input = root.querySelector<HTMLInputElement>(`[data-demo-value="${field}"]`);
      if (!input) return;
      button.disabled = true;
      status.textContent = root.dataset.copying ?? '';
      delete status.dataset.copyState;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(input.value);
        if (signal.aborted || !root.isConnected) return;
        status.textContent = button.dataset.success ?? '';
        status.dataset.copyState = 'success';
      } catch {
        if (signal.aborted || !root.isConnected) return;
        input.focus();
        input.select();
        status.textContent = root.dataset.copyFailed ?? '';
        status.dataset.copyState = 'manual';
      } finally {
        if (!signal.aborted && root.isConnected) button.disabled = false;
      }
    }, { signal });
  });

  cleanup = () => {
    abort.abort();
    buttons.forEach(button => { button.hidden = true; button.disabled = false; });
    status.textContent = '';
    delete status.dataset.copyState;
  };
}

initDemoAccess();
document.addEventListener('astro:page-load', initDemoAccess);
document.addEventListener('astro:before-swap', disposeDemoAccess);
window.addEventListener('pagehide', disposeDemoAccess);
window.addEventListener('pageshow', event => { if (event.persisted) initDemoAccess(); });
