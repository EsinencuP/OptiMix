export {};

declare global {
  interface Window {
    __optimixBriefDownloadBound?: boolean;
  }
}

function downloadBrief(builder: HTMLElement) {
  const fields = [...builder.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-brief-field]')];
  const heading = builder.dataset.title ?? 'Process brief';
  const sections = fields.map((field) => {
    const label = field.labels?.[0]?.textContent?.trim() ?? field.name;
    return `${label}\r\n${field.value.trim()}`;
  });
  const file = new Blob(['\uFEFF', heading, '\r\n\r\n', sections.join('\r\n\r\n'), '\r\n'], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = builder.dataset.filename ?? 'optimix-process-brief.txt';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  const status = builder.querySelector<HTMLElement>('[data-download-status]');
  if (status) status.textContent = builder.dataset.downloadNotice ?? '';
}

function enableBriefDownload() {
  document.querySelectorAll<HTMLButtonElement>('[data-download-brief]').forEach((button) => {
    if (button.dataset.briefDownloadReady === 'true') return;
    const builder = button.closest<HTMLElement>('[data-brief-builder]');
    if (!builder) return;
    button.addEventListener('click', () => downloadBrief(builder));
    button.dataset.briefDownloadReady = 'true';
    button.disabled = false;
  });
}

if (!window.__optimixBriefDownloadBound) {
  document.addEventListener('astro:after-swap', enableBriefDownload);
  document.addEventListener('astro:page-load', enableBriefDownload);
  window.__optimixBriefDownloadBound = true;
}
enableBriefDownload();
