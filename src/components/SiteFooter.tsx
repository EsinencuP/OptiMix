import { content, homeAnchor, locales, pathFor, type Locale, type PageKind } from '../content';
import { homeRedesign } from '../content/home-redesign';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    page: PageKind;
    slug?: string;
}
export default function SiteFooter(props: Props) {
    const { locale, page, slug } = props;
    const t = homeRedesign(locale);
    const anchors = ['services', 'demo-projects', 'approach', 'faq'];
    const anchor = (id: string) => page === 'home' ? '#' + id : homeAnchor(locale, id);
    return (<>
    <footer className="ox-footer"><div className="ox-container ox-footer-inner"><div className="ox-footer-brand"><SiteLink className="ox-brand" href={page === 'home' ? '#top' : pathFor(locale, 'home')} aria-label="Optimix"><img src="/images/redesign/brand-mark-graphite.svg" width="18" height="18" alt=""/><span translate="no">OPTIMIX</span></SiteLink><p>{t.eyebrow}</p></div><nav className="ox-footer-nav" aria-label={t.menu}>{t.nav.map((label, i) => <SiteLink key={i} href={anchor(anchors[i])}>{label}</SiteLink>)}</nav><div className="ox-footer-meta"><nav className="ox-languages" aria-label={content[locale].ui.language}>{locales.map((target, _index) => <a key={_index} data-locale-link href={pathFor(target, page, slug)} lang={target} hrefLang={target} aria-current={target === locale ? 'page' : undefined}>{target.toUpperCase()}</a>)}</nav><SiteLink href={pathFor(locale, 'privacy')}>{t.privacy}</SiteLink><span>Optimix · 2026</span></div></div></footer>
    </>);
}
