import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import { pathFor, type Locale } from '../content';
import { siteRedesign } from '../content/site-redesign';
import { homeRedesign } from '../content/home-redesign';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function NotFoundPage(props: Props) {
    const { locale } = props;
    const t = siteRedesign(locale);
    return (<>
    <BaseLayout title={`404 — ${t.notFound} — Optimix`} description={t.notFoundIntro} locale={locale} page="not-found"><SiteHeader locale={locale} page="not-found"/><main id="main" className="ox-not-found"><section className="ox-page-hero" id="top"><div className="ox-container ox-page-heading"><p className="ox-error-number" aria-hidden="true">404</p><h1>{t.notFound}</h1><p className="ox-page-lead">{t.notFoundIntro}</p><div className="ox-page-actions"><SiteLink className="ox-button" href={pathFor(locale, 'home')}>{t.home}<Icon name="arrow-right" size={20}/></SiteLink><SiteLink className="ox-button ox-button-secondary" href={pathFor(locale, 'contact')}>{homeRedesign(locale).action}</SiteLink></div></div></section></main><SiteFooter locale={locale} page="not-found"/></BaseLayout>
    </>);
}
