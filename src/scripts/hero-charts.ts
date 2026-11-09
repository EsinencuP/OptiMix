

  const chartColors = ['#508179', '#7fa79b', '#485949', '#b3d2c7'];
  let disposeHeroCharts: (() => void) | undefined;

  function initializeHeroCharts() {
    disposeHeroCharts?.();
    const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-hero-chart]'));
    if (!canvases.length) return;
    let frame = 0;

    function drawCharts() {
      for (const canvas of canvases) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) continue;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        const context = canvas.getContext('2d');
        if (!context) continue;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        const chart = canvas.dataset.heroChart;

        if (chart === 'revenue') {
          const values = [72, 94, 81, 103, 99, 128, 115, 149, 151, 178];
          const padding = Math.max(9, width * .055);
          const plotWidth = width - padding * 2;
          const plotHeight = height - padding * 2;
          context.strokeStyle = '#dfe8e2';
          context.lineWidth = 1;
          for (let i = 1; i < 4; i++) {
            const y = padding + plotHeight * i / 4;
            context.beginPath(); context.moveTo(padding, y); context.lineTo(width - padding, y); context.stroke();
          }
          const points = values.map((value, i) => [padding + plotWidth * i / (values.length - 1), padding + plotHeight * (1 - (value - 65) / 120)]);
          context.beginPath(); context.moveTo(points[0][0], height - padding);
          for (const [x, y] of points) context.lineTo(x, y);
          context.lineTo(points[points.length - 1][0], height - padding); context.closePath();
          context.fillStyle = '#e2ece7'; context.fill();
          context.beginPath();
          for (let i = 0; i < points.length; i++) { const [x, y] = points[i]; if (i === 0) context.moveTo(x, y); else context.lineTo(x, y); }
          context.strokeStyle = chartColors[0]; context.lineWidth = Math.max(1.2, width * .006); context.lineJoin = 'round'; context.stroke();
          for (const [x, y] of points) { context.beginPath(); context.arc(x, y, Math.max(2.5, width * .018), 0, Math.PI * 2); context.fillStyle = chartColors[0]; context.fill(); }
        } else if (chart === 'shares') {
          const radius = Math.min(width, height) * .39;
          let angle = -Math.PI / 2;
          [45, 30, 15, 10].forEach((share, i) => {
            const endAngle = angle + Math.PI * 2 * share / 100;
            context.beginPath(); context.arc(width / 2, height / 2, radius, angle, endAngle);
            context.strokeStyle = chartColors[i]; context.lineWidth = radius * .47; context.stroke(); angle = endAngle;
          });
        } else if (chart === 'teams') {
          const values = [35, 60, 45, 75];
          const base = height - 5;
          const plotHeight = height - 12;
          const gap = width * .11;
          const barWidth = (width - gap * 5) / 4;
          values.forEach((value, i) => { const barHeight = plotHeight * value / 85; context.fillStyle = i % 2 ? '#508179' : '#7fa79b'; context.fillRect(gap + i * (barWidth + gap), base - barHeight, barWidth, barHeight); });
        }
      }
    }

    function scheduleDraw() { cancelAnimationFrame(frame); frame = requestAnimationFrame(drawCharts); }
    const observer = new ResizeObserver(scheduleDraw);
    for (const canvas of canvases) observer.observe(canvas);
    scheduleDraw();
    disposeHeroCharts = () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }

export function mountHeroCharts() { initializeHeroCharts(); return () => {disposeHeroCharts?.();disposeHeroCharts=undefined;}; }
