import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Visual from './CatalogVisual';
import Icon from './Icon';
import { portfolioCatalog, portfolioUI } from '../content/portfolio-catalog';
import type { Locale } from '../content';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function PortfolioIndexPage(props: Props) {
    const { locale } = props;
    const projects = portfolioCatalog(locale), t = portfolioUI(locale);
    return (<>
    <BaseLayout title={t.eyebrow} description={t.intro} locale={locale} page="portfolio">
  <SiteHeader locale={locale} page="portfolio"/>
  <main id="main" className="ox-catalog">
    <section className="ox-catalog-index-hero" id="top"><div className="ox-container"><p className="ox-page-kicker">{t.count}</p><h1>{t.title}</h1><p>{t.intro}</p></div></section>
    <div className="ox-container ox-catalog-index-grid">
      {projects.map((project, _index) => <article key={_index} className="ox-catalog-index-card" data-portfolio-project={project.slug}>
        <SiteLink className="ox-catalog-index-visual-link" href={project.projectHref} aria-label={`${t.open} — ${project.fullName}`}><Visual project={project} locale={locale} compact/></SiteLink>
        <div className="ox-catalog-index-copy"><p className="ox-catalog-index-category"><span>{project.category}</span></p><h2 translate="no"><SiteLink href={project.projectHref}>{project.name}</SiteLink></h2><p>{project.headline}</p>{project.draft && <span className="ox-catalog-status">{t.draft}</span>}<div className="ox-catalog-index-links"><SiteLink href={project.projectHref}>{t.open}<Icon name="arrow-right" size={17}/></SiteLink><SiteLink href={project.demo}>{t.demo}</SiteLink><SiteLink href={project.github}>GitHub</SiteLink></div></div>
      </article>)}
    </div>
  </main>
  <SiteFooter locale={locale} page="portfolio"/>
    </BaseLayout>
    </>);
}
