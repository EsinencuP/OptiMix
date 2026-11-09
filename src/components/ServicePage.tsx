import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import GettingStarted from './GettingStarted';
import Icon from './Icon';
import ScreenshotPlaceholder from './ScreenshotPlaceholder';
import { servicesFor, serviceUI, type ServiceSlug } from '../content/services';
import { homeRedesign } from '../content/home-redesign';
import { pathFor, type Locale } from '../content';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    slug: ServiceSlug;
}
export default function ServicePage(props: Props) {
    const { locale, slug } = props;
    const service = servicesFor(locale).find(item => item.slug === slug)!;
    const t = serviceUI(locale), home = homeRedesign(locale);
    return (<>
    <BaseLayout title={`${service.title} — Optimix`} description={service.description} locale={locale} page="service" slug={slug}>
    <SiteHeader locale={locale} page="service" slug={slug}/>
    <main id="main" className="ox-service-page">
  <section className="ox-service-hero ox-section" id="top"><div className="ox-container"><SiteLink className="ox-text-link" href={pathFor(locale, 'home') + '#services'}>{t.label}</SiteLink><Icon name={service.icon} size={52}/><h1>{service.title}</h1><p>{service.description}</p><SiteLink className="ox-button" href={pathFor(locale, 'contact')}>{home.action}<Icon name="arrow-right" size={20}/></SiteLink></div></section>
  <section className="ox-service-scope ox-section"><div className="ox-container"><h2>{t.processes}</h2><p>{t.scope}</p><ul>{service.processes.map((item, _index) => <li key={_index}><Icon name="check-circle-fill" size={26}/><h3>{item}</h3></li>)}</ul></div></section>
  <section className="ox-service-proof ox-section" data-service-example-placeholder={slug}><div className="ox-container"><div><p className="ox-eyebrow">{t.example}</p><h2>{locale === 'ru' ? 'Пример проекта готовится' : locale === 'en' ? 'Project example coming soon' : 'Exemplul proiectului este în pregătire'}</h2><p>{locale === 'ru' ? 'Здесь появятся описание и экран проекта для этого направления.' : locale === 'en' ? 'A project description and screen for this service will appear here.' : 'Aici vor apărea descrierea și ecranul unui proiect pentru această direcție.'}</p><SiteLink className="ox-button" href={pathFor(locale, 'portfolio')}>{locale === 'ru' ? 'Смотреть портфолио' : locale === 'en' ? 'Explore the portfolio' : 'Vezi portofoliul'}<Icon name="arrow-right" size={20}/></SiteLink></div><ScreenshotPlaceholder locale={locale}/></div></section>
  <GettingStarted locale={locale}/>
  <nav className="ox-service-related ox-container" aria-label={t.related}><h2>{t.related}</h2><div>{servicesFor(locale).filter(item => item.slug !== slug).map((item, _index) => <SiteLink key={_index} href={item.href}>{item.title}<Icon name="arrow-right" size={18}/></SiteLink>)}</div></nav>
  <section className="ox-final ox-section"><div className="ox-container"><h2>{t.cta}</h2><p>{home.startIntro}</p><SiteLink className="ox-button" href={pathFor(locale, 'contact')}>{home.action}</SiteLink></div></section>
    </main><SiteFooter locale={locale} page="service" slug={slug}/>
    </BaseLayout>
    </>);
}
