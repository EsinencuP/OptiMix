let dispose: (() => void) | undefined;
export {};

function setupWorkflowMap(): () => void {
  const map = document.querySelector<HTMLElement>('.workflow-map');
  const track = map?.querySelector<SVGPathElement>('.workflow-map-track');
  const trace = map?.querySelector<SVGPathElement>('.workflow-map-trace');
  const icons = [...(map?.querySelectorAll<HTMLElement>('.workflow-icon') ?? [])];
  if (!map || !track || !trace || icons.length !== 8) return () => {};

  let pathLength = 0;
  let frame = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const updateTrace = () => {
    if (!pathLength) return;
    if (reduced.matches) { trace.style.strokeDashoffset = '0'; return; }
    const rect = map.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * .78 - rect.top) / Math.max(1, rect.height * .9)));
    trace.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
  };
  const draw = () => {
    const mapRect = map.getBoundingClientRect();
    const points = icons.map((icon) => {
      const rect = icon.getBoundingClientRect();
      return { x: rect.left - mapRect.left + rect.width / 2, y: rect.top - mapRect.top + rect.height / 2 };
    });
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const next = points[index];
      const dx = next.x - previous.x;
      const dy = next.y - previous.y;
      if (Math.abs(dy) < 70) {
        const wave = (index <= 3 ? -1 : 1) * (index % 2 ? 28 : -28);
        d += ` C ${previous.x + dx * .36} ${previous.y + wave}, ${next.x - dx * .36} ${next.y - wave}, ${next.x} ${next.y}`;
      } else if (index === 4 && mapRect.width > 900) {
        const outerX = Math.max(previous.x + 90, mapRect.width - 24);
        const turn = Math.min(85, (outerX - previous.x) * .45);
        d += ` C ${previous.x + turn} ${previous.y}, ${outerX} ${previous.y}, ${outerX} ${previous.y + dy * .28}`;
        d += ` C ${outerX} ${previous.y + dy * .58}, ${outerX} ${next.y - dy * .28}, ${outerX} ${next.y}`;
        d += ` C ${outerX} ${next.y + 12}, ${next.x + turn} ${next.y}, ${next.x} ${next.y}`;
      } else {
        const bend = Math.abs(dx) < 70 ? (index % 2 ? 34 : -34) : dx * .28;
        d += ` C ${previous.x + bend} ${previous.y + dy * .35}, ${next.x + bend} ${next.y - dy * .35}, ${next.x} ${next.y}`;
      }
    }
    track.setAttribute('d', d);
    trace.setAttribute('d', d);
    pathLength = trace.getTotalLength();
    trace.style.strokeDasharray = `${pathLength}`;
    updateTrace();
  };

  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; updateTrace(); }); };
  const observer = new ResizeObserver(draw);
  observer.observe(map);
  map.addEventListener('toggle', draw, true);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', draw, { passive: true });
  reduced.addEventListener('change', draw);
  void document.fonts.ready.then(draw);
  draw();

  return () => {
    observer.disconnect();
    map.removeEventListener('toggle', draw, true);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', draw);
    reduced.removeEventListener('change', draw);
    if (frame) cancelAnimationFrame(frame);
  };
}

function sync() {
  dispose?.();
  dispose = document.querySelector('.workflow-map') ? setupWorkflowMap() : undefined;
}

sync();
document.addEventListener('astro:page-load', sync);
document.addEventListener('astro:before-swap', () => { dispose?.(); dispose = undefined; });
