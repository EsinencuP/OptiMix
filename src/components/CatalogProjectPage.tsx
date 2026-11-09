import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import Visual from './CatalogVisual';
import Related from './CatalogRelated';
import { portfolioCatalog, portfolioUI, type CatalogSlug } from '../content/portfolio-catalog';
import { pathFor, type Locale } from '../content';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    slug: CatalogSlug;
}
export default function CatalogProjectPage(props: Props) {
    const { locale, slug } = props;
    const project = portfolioCatalog(locale).find(project => project.slug === slug)!;
    const t = portfolioUI(locale);
    return (<>
    <BaseLayout title={`${project.fullName} — ${t.eyebrow}`} description={project.description} locale={locale} page="portfolio" slug={slug}>
  <SiteHeader locale={locale} page="portfolio" slug={slug}/>
  <main className="ox-catalog" id="main">
    <section className="ox-catalog-hero" id="top" aria-labelledby="catalog-title"><div className="ox-container ox-catalog-hero-layout">
      <div className="ox-catalog-hero-copy">
        <SiteLink className="ox-catalog-back" href={pathFor(locale, 'portfolio')}><Icon name="arrow-left" size={18}/>{t.eyebrow}</SiteLink>
        <p className="ox-page-kicker">{project.category}</p>
        <h1 id="catalog-title" translate="no">{project.fullName}</h1>
        <p className="ox-catalog-tagline">{project.headline}</p>
        <p className="ox-catalog-lead">{project.description}</p>
        <ul className="ox-catalog-tags">{project.tags.map((tag, _index) => <li key={_index}>{tag}</li>)}</ul>
        <div className="ox-catalog-actions"><SiteLink className="ox-button" href={project.demo}>{t.demo}<Icon name="arrow-right" size={20}/></SiteLink><SiteLink className="ox-button ox-button-secondary" href={project.github}>{t.github}<Icon name="arrow-right" size={20}/></SiteLink></div>

      </div>
      <Visual project={project} locale={locale}/>
    </div></section>
    {project.draft ? <section className="ox-container ox-catalog-draft" aria-labelledby="catalog-overview-title"><span className="ox-catalog-status">{t.draft}</span><h2 id="catalog-overview-title">{t.overview}</h2><p>{t.draftNote}</p></section> : <>
      <section className="ox-container ox-catalog-capabilities" aria-labelledby="catalog-capabilities-title"><p className="ox-page-kicker">{t.overview}</p><h2 id="catalog-capabilities-title">{t.capabilities}</h2><div className="ox-catalog-feature-grid">{project.features.map((feature, _index) => <article key={_index}><Icon name={feature.icon} size={32}/><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div></section>
      <section className="ox-container ox-catalog-workflow" aria-labelledby="catalog-workflow-title"><h2 id="catalog-workflow-title">{t.workflow}</h2><ol>{t.steps.map((step, index) => <li key={index}><span>0{index + 1}</span><h3>{step}</h3></li>)}</ol><p>{t.limits}</p></section>
    </>}
    <Related locale={locale} current={slug}/>
    <section className="ox-catalog-cta"><div className="ox-container"><h2>{t.ask}</h2><SiteLink className="ox-button" href={pathFor(locale, 'contact')}>{t.action}<Icon name="arrow-right" size={20}/></SiteLink></div></section>
  </main>
  <SiteFooter locale={locale} page="portfolio" slug={slug}/>
    </BaseLayout>
    </>);
}
