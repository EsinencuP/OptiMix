import type { Locale } from '../content';
import { erpSupplementContent, portfolioPages, portfolioPageLinks } from '../content/portfolio-pages';
import Icon from './Icon';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function ErpDemoCta(props: Props) {
    const { locale } = props;
    const t = erpSupplementContent[locale].cta;
    const links = portfolioPageLinks.erp;
    return (<>
    <section className="ox-erp-cta-section ox-container" id="erp-demo" aria-labelledby="erp-demo-cta-title">
  <div className="ox-erp-cta">
    <div><p className="ox-page-kicker">{t.eyebrow}</p><h2 id="erp-demo-cta-title">{t.title}</h2><p className="ox-erp-cta-intro">{t.intro}</p></div>
    <div className="ox-erp-cta-actions">
      <SiteLink className="ox-button" href={links.demo}>{portfolioPages[locale].openDemo}<Icon name="arrow-right" size={20}/></SiteLink>
      <SiteLink className="ox-button" href={links.github}>{portfolioPages[locale].github}<Icon name="arrow-right" size={20}/></SiteLink>
    </div>
  </div>
    </section>
    </>);
}
