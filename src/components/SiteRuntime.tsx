'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { moduleSlugs } from '../content/portfolio';
type Mount = () => void | (() => void);
export default function SiteRuntime() {
    const pathname = usePathname(), query = useSearchParams()?.toString() ?? '';
    useEffect(() => {
        let disposed = false;
        let generation = 0;
        const cleanups: (() => void)[] = [];
        const loaders: Promise<Mount>[] = [];
        if (document.querySelector('[data-demo-deck]'))
            loaders.push(import('../scripts/demo-deck').then(module => module.mountDecks));
        if (document.querySelector('[data-hero-charts]'))
            loaders.push(import('../scripts/hero-charts').then(module => module.mountHeroCharts), import('../scripts/hero-shuffle').then(module => module.mountHeroShuffle));
        if (document.querySelector('[data-crm-workflow]'))
            loaders.push(import('../scripts/crm-workflow').then(module => module.mountCrmWorkflow), import('../scripts/portfolio-crm').then(module => module.mountCrmMotion));
        if (document.querySelector('[data-erp-hub]'))
            loaders.push(import('../scripts/erp-hub').then(module => module.mountErpHub), import('../scripts/portfolio-erp').then(module => module.mountErpMotion));
        if (document.querySelector('[data-demo]'))
            loaders.push(import('../scripts/process-demo').then(module => module.mountProcessDemo));
        if (document.querySelector('[data-brief-builder]'))
            loaders.push(import('../scripts/brief-download').then(module => module.mountBriefDownload));
        const step = new URLSearchParams(query).get('step');
        if (moduleSlugs.some(slug => slug === step))
            document.querySelectorAll<HTMLAnchorElement>('[data-locale-link]').forEach(link => { const target = new URL(link.href); if (target.pathname.endsWith('/demo/procurement/')) {
                target.searchParams.set('step', step!);
                link.href = target.href;
            } });
        const dispose = () => { generation++; cleanups.splice(0).forEach(cleanup => cleanup()); };
        const mount = async () => { const token = ++generation; const mounts = await Promise.all(loaders); if (disposed || token !== generation)
            return; for (const initialize of mounts) {
            const cleanup = initialize();
            if (cleanup)
                cleanups.push(cleanup);
        } };
        const hide = () => dispose();
        const show = (event: PageTransitionEvent) => { if (event.persisted) {
            dispose(); void mount(); } };
        window.addEventListener('pagehide', hide);
        window.addEventListener('pageshow', show);
        void mount();
        return () => { disposed = true; dispose(); window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show); };
    }, [pathname, query]);
    return null;
}
