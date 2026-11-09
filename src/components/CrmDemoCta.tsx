import type { Locale } from '../content';
import { crmSupplementContent, portfolioPages, portfolioPageLinks } from '../content/portfolio-pages';
import Icon from './Icon';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function CrmDemoCta(props: Props) {
    const { locale } = props;
    const t = crmSupplementContent[locale].cta;
    const links = portfolioPageLinks.crm;
    return (<>
    <section className="ox-crm-cta-section ox-container" id="crm-demo" aria-labelledby="crm-demo-cta-title">
  <div className="ox-crm-cta">
    <div><p className="ox-page-kicker">{t.eyebrow}</p><h2 id="crm-demo-cta-title">{t.title}</h2><p className="ox-crm-cta-intro">{t.intro}</p></div>
    <div className="ox-crm-cta-actions">
      <SiteLink className="ox-button" href={links.demo}>{portfolioPages[locale].openDemo}<Icon name="arrow-right" size={20}/></SiteLink>
      <SiteLink className="ox-button" href={links.github}>{portfolioPages[locale].github}<Icon name="arrow-right" size={20}/></SiteLink>
    </div>
  </div>
    </section>
    </>);
}
