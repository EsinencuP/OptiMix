import { portfolioCatalog, portfolioUI, type CatalogSlug } from '../content/portfolio-catalog';
import { pathFor, type Locale } from '../content';
import Icon from './Icon';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    current: CatalogSlug;
}
export default function CatalogRelated(props: Props) {
    const { locale, current } = props;
    const products = portfolioCatalog(locale);
    const t = portfolioUI(locale);
    const index = products.findIndex(project => project.slug === current);
    const previous = products[(index - 1 + products.length) % products.length];
    const next = products[(index + 1) % products.length];
    return (<>
    <nav className="ox-catalog-related ox-container" aria-label={t.more}>
  <SiteLink href={previous.projectHref}><span>{t.previous}</span><strong translate="no">{previous.name}</strong></SiteLink>
  <SiteLink className="ox-catalog-all" href={pathFor(locale, 'portfolio')}><Icon name="table" size={24}/><span>{t.all}</span></SiteLink>
  <SiteLink href={next.projectHref}><span>{t.next}</span><strong translate="no">{next.name}</strong></SiteLink>
    </nav>
    </>);
}
