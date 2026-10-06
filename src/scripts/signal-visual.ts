export {};
let dispose: (() => void) | undefined;

function setupSignalVisual(): () => void {
  const visual = document.querySelector<HTMLElement>('[data-signal-visual]');
  const chart = visual?.querySelector<HTMLElement>('[data-signal-chart]');
  const range = visual?.querySelector<HTMLInputElement>('[data-stage-range]');
  const active = visual?.querySelector<HTMLElement>('[data-active-stage]');
  const count = visual?.querySelector<HTMLElement>('[data-stage-number]');
  const detail = visual?.querySelector<HTMLElement>('[data-stage-detail]');
  const labels = [...(visual?.querySelectorAll<HTMLElement>('.signal-stage-labels span') ?? [])];
  const proposals: string[] = JSON.parse(visual?.dataset.proposals ?? '[]');
  if (!visual || !chart || !range || !active || !count || !detail || labels.length !== 5 || proposals.length !== 5) return () => {};

  const setStage = (stage: number) => {
    const index = Math.max(0, Math.min(labels.length - 1, stage));
    range.value = String(index);
    active.textContent = labels[index].textContent;
    detail.textContent = proposals[index];
    count.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
    visual.style.setProperty('--signal-position', `${4 + index * 23}%`);
  };
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const bounds = chart.getBoundingClientRect();
    setStage(Math.round(((event.clientX - bounds.left) / bounds.width) * 4));
  };
  const onRange = () => setStage(Number(range.value));
  chart.addEventListener('pointermove', onPointer, { passive: true });
  range.addEventListener('input', onRange);
  setStage(0);
  return () => {
    chart.removeEventListener('pointermove', onPointer);
    range.removeEventListener('input', onRange);
  };
}

function sync() {
  dispose?.();
  dispose = setupSignalVisual();
}

sync();
document.addEventListener('astro:page-load', sync);
document.addEventListener('astro:before-swap', () => { dispose?.(); dispose = undefined; });
