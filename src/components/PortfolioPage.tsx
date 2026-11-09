import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import CatalogRelated from './CatalogRelated';
import CrmPortfolioContent from './CrmPortfolioContent';
import ErpPortfolioContent from './ErpPortfolioContent';
import { type Locale } from '../content';
import { portfolioPages, type PortfolioPageSlug } from '../content/portfolio-pages';
import { cx } from '../lib/ui';
interface Props {
    locale: Locale;
    slug: PortfolioPageSlug;
}
export default function PortfolioPage(props: Props) {
    const { locale, slug } = props;
    const t = portfolioPages[locale];
    const project = t.projects[slug];
    return (<>
    <BaseLayout title={project.metaTitle} description={project.description} locale={locale} page="portfolio" slug={slug}>
  <SiteHeader locale={locale} page="portfolio" slug={slug}/>
  <main id="main" className={cx(['project-page-main', slug === 'crm' ? 'ox-crm-page' : 'ox-erp-page'])} data-crm-page={slug === 'crm' || undefined} data-erp-page={slug === 'erp' || undefined}>
    {slug === 'crm' ? <CrmPortfolioContent locale={locale}/> : <ErpPortfolioContent locale={locale}/>}
    <CatalogRelated locale={locale} current={slug}/>
  </main>
  <SiteFooter locale={locale} page="portfolio" slug={slug}/>
    </BaseLayout>
    </>);
}
