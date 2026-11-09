import HomeFaq from './HomeFaq';
import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import GettingStarted from './GettingStarted';
import ProductExamples from './ProductExamples';
import HeroScene from './HomeHeroScene';
import DemoProjects from './DemoProjectGallery';
import { pathFor, type Locale } from '../content';
import { demoPath } from '../content/portfolio';
import { homeRedesign } from '../content/home-redesign';
import { servicesFor } from '../content/services';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function HomePage(props: Props) {
    const { locale } = props;
    const t = homeRedesign(locale);
    const contact = pathFor(locale, 'contact');
    const leadScene = t.scenes[1];
    return (<>
    <BaseLayout title={`Optimix — ${t.eyebrow}`} description={t.intro} locale={locale} page="home">
    <SiteHeader locale={locale} page="home"/>
  <main id="main">
    <section className="ox-hero ox-hero-examples ox-hero-v2" id="top" aria-labelledby="ox-hero-title">
      <div className="ox-hero-stage"><div className="ox-container" id="examples">
        <span id="workflow" aria-hidden="true"></span>
        <article className="ox-hero-primary" id={leadScene.id} aria-labelledby="ox-hero-title">
          <div className="ox-hero-message">
            <p className="ox-eyebrow">{t.eyebrow}</p>
            <h1 id="ox-hero-title"><span>{t.heroTitle[0]}</span>{' '}<span>{t.heroTitle[1]}</span></h1>
            <p className="ox-hero-intro">{leadScene.description}</p>
            <ul className="ox-checks">{leadScene.checks.map((check, _index) => <li key={_index}><Icon name="check-circle-fill" size={23}/><span>{check}</span></li>)}</ul>
            <div className="ox-hero-actions"><SiteLink className="ox-button" href={contact}>{t.action}</SiteLink><SiteLink className="ox-button ox-button-secondary" href={demoPath(locale)}>{t.example}</SiteLink></div>
            <p className="ox-note">{t.savedNote}</p>
          </div>
          <HeroScene locale={locale}/>
        </article>
      </div></div>
      <div className="ox-container">
        <ProductExamples locale={locale}/>
      </div>
    </section>
    <section className="ox-services ox-section" id="services" aria-labelledby="ox-services-title"><div className="ox-container">
      <div className="ox-section-heading"><h2 id="ox-services-title">{t.servicesTitle}</h2><p>{t.servicesIntro}</p></div>
      <div className="ox-service-grid">{servicesFor(locale).map((service, _index) => <SiteLink key={_index} className="ox-service-card" href={service.href}><Icon name={service.icon} size={46}/><div><h3>{service.title}</h3><p>{service.description}</p><span className="ox-learn">{t.learn}<Icon name="arrow-right" size={16}/></span></div><Icon className="ox-card-chevron" name="caret-right" size={22}/></SiteLink>)}</div>
      <p className="ox-other">{t.other} <SiteLink href={contact}>{t.action}<Icon name="arrow-right" size={18}/></SiteLink></p>
    </div></section>
    <DemoProjects locale={locale}/>
    <GettingStarted locale={locale}/>
    <HomeFaq locale={locale}/>
    <section className="ox-final ox-section" id="contact" aria-labelledby="ox-final-title"><div className="ox-container"><h2 id="ox-final-title">{t.finalTitle}</h2><p>{t.finalIntro}</p><SiteLink className="ox-button" href={contact}>{t.action}</SiteLink><p className="ox-note">{t.savedNote}</p></div></section>
  </main>
  <SiteFooter locale={locale} page="home"/>
    </BaseLayout>
    </>);
}
