import PortfolioPage from './PortfolioPage';
import CatalogProjectPage from './CatalogProjectPage';
import type { CatalogSlug } from '../content/portfolio-catalog';
import type { Locale } from '../content';
interface Props {
    locale: Locale;
    slug: CatalogSlug;
}
export default function PortfolioEntry(props: Props) {
    const { locale, slug } = props;
    return (<>
    {slug === 'crm' || slug === 'erp' ? <PortfolioPage locale={locale} slug={slug}/> : <CatalogProjectPage locale={locale} slug={slug}/>}
    </>);
}
