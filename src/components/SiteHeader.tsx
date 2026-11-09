'use client';
import { useEffect, useRef, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Accordion from '@radix-ui/react-accordion';
import Icon from './Icon';
import SiteLink from './SiteLink';
import { content, homeAnchor, locales, pathFor, type Locale, type PageKind } from '../content';
import { homeRedesign } from '../content/home-redesign';
import { servicesFor } from '../content/services';
interface Props {
    locale: Locale;
    page: PageKind;
    slug?: string;
}
export default function SiteHeader({ locale, page, slug }: Props) {
    const t = homeRedesign(locale), services = servicesFor(locale), language = content[locale].ui.language;
    const anchors = ['demo-projects', 'approach', 'faq'];
    const anchor = (id: string) => page === 'home' ? '#' + id : homeAnchor(locale, id);
    const [value, setValue] = useState(''), [mobile, setMobile] = useState(false);
    const popover = useRef<HTMLElement>(null);
    useEffect(() => { const media = matchMedia('(min-width:961px)'); const close = () => { if (media.matches)
        popover.current?.hidePopover(); }; media.addEventListener('change', close); return () => media.removeEventListener('change', close); }, []);
    const close = () => { popover.current?.hidePopover(); setValue(''); };
    const localeLinks = <div className="ox-languages" aria-label={language}>{locales.map(target => <a key={target} data-locale-link href={pathFor(target, page, slug)} lang={target} hrefLang={target} aria-current={target === locale ? 'page' : undefined}>{target.toUpperCase()}</a>)}</div>;
    return <header className="ox-header"><div className="ox-container ox-header-inner">
  <SiteLink className="ox-brand" href={page === 'home' ? '#top' : pathFor(locale, 'home')} aria-label="Optimix"><img src="/images/redesign/brand-mark-graphite.svg" width="22" height="22" alt=""/><span translate="no">OPTIMIX</span></SiteLink>
  <NavigationMenu.Root className="ox-desktop-nav ox-navigation-radix" aria-label={t.menu} value={value} onValueChange={setValue} delayDuration={80}><NavigationMenu.List className="ox-nav-list">
   <NavigationMenu.Item className="ox-services-menu" value="services"><NavigationMenu.Trigger className="ox-services-trigger">{t.nav[0]}<Icon name="caret-down" size={14}/></NavigationMenu.Trigger><NavigationMenu.Content className="ox-services-dropdown" data-services-dropdown>{services.map(service => <NavigationMenu.Link key={service.slug} asChild active={page === 'service' && slug === service.slug}><SiteLink href={service.href} onClick={() => setValue('')}><Icon name={service.icon} size={24}/><span>{service.title}</span><Icon name="arrow-right" size={16}/></SiteLink></NavigationMenu.Link>)}</NavigationMenu.Content></NavigationMenu.Item>
   {t.nav.slice(1).map((label, index) => <NavigationMenu.Item key={label}><NavigationMenu.Link asChild><SiteLink href={anchor(anchors[index])}>{label}</SiteLink></NavigationMenu.Link></NavigationMenu.Item>)}
  </NavigationMenu.List></NavigationMenu.Root>
  <div className="ox-header-actions">{localeLinks}{page !== 'contact' && <SiteLink className="ox-button ox-header-cta" href={pathFor(locale, 'contact')}><span className="ox-desktop-label">{t.action}</span><span className="ox-mobile-label">{t.brief}</span></SiteLink>}<button className="ox-menu-trigger" type="button" popoverTarget="ox-mobile-nav" aria-label={t.menu} aria-expanded={mobile} aria-controls="ox-mobile-nav"><Icon name="list" size={26}/></button></div>
  <nav ref={popover} id="ox-mobile-nav" className="ox-mobile-nav" popover="auto" aria-label={t.menu} onToggle={event => setMobile(event.newState === 'open')} onClick={event => { if ((event.target as Element).closest('a'))
        close(); }}>
   <Accordion.Root className="ox-mobile-services" type="single" collapsible><Accordion.Item value="services"><Accordion.Header><Accordion.Trigger className="ox-services-trigger">{t.nav[0]}<Icon name="caret-down" size={20}/></Accordion.Trigger></Accordion.Header><Accordion.Content className="ox-services-dropdown" data-mobile-services-dropdown>{services.map(service => <SiteLink key={service.slug} href={service.href} aria-current={page === 'service' && slug === service.slug ? 'page' : undefined}><Icon name={service.icon} size={22}/><span>{service.title}</span></SiteLink>)}</Accordion.Content></Accordion.Item></Accordion.Root>
   {t.nav.slice(1).map((label, index) => <SiteLink key={label} href={anchor(anchors[index])}>{label}<Icon name="arrow-right" size={20}/></SiteLink>)}{localeLinks}
  </nav>
 </div><noscript><style>{'.ox-navigation-radix,.ox-mobile-services{display:none!important}'}</style><nav className="ox-container ox-nojs-services" aria-label={t.nav[0]}><details className="ox-services-menu"><summary>{t.nav[0]}</summary>{services.map(service => <a key={service.slug} href={service.href}>{service.title}</a>)}</details></nav></noscript></header>;
}
