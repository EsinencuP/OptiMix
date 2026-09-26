import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function startSmoothScroll(
  gsap: typeof import('gsap').gsap,
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
): () => void {
  const lenis = new Lenis({
    duration: 0.85,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
    respectReducedMotion: true,
  });
  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();

  return () => {
    gsap.ticker.remove(tick);
    lenis.off('scroll', ScrollTrigger.update);
    lenis.destroy();
    ScrollTrigger.refresh();
  };
}
