import FeatureCard from './FeatureCard';
import CrmWorkflowDiagram from './CrmWorkflowDiagram';
import CrmModuleGrid from './CrmModuleGrid';
import CrmDemoCta from './CrmDemoCta';
import Icon from './Icon';
import type { Locale } from '../content';
import { crmPageContent, crmTechnologies, portfolioPages, portfolioPageLinks } from '../content/portfolio-pages';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function CrmPortfolioContent(props: Props) {
    const { locale } = props;
    const t = portfolioPages[locale];
    const crm = crmPageContent[locale];
    const project = t.projects.crm;
    const links = portfolioPageLinks.crm;
    return (<>
    <section className="ox-crm-hero" id="top" aria-labelledby="portfolio-title">
  <div className="ox-container ox-crm-hero-layout">
    <div className="ox-crm-hero-copy" data-crm-entrance>
      <p className="ox-page-kicker">{t.eyebrow}</p>
      <h1 id="portfolio-title">{project.title}<span>{crm.heroAccent}</span></h1>
      <p className="ox-crm-lead">{project.intro}</p>
      <ul className="ox-crm-tags" aria-label={crm.technologyLabel}>
        {crmTechnologies.map((tag, _index) => <li key={_index} translate="no">{tag}</li>)}
      </ul>
      <div className="ox-crm-actions">
        <SiteLink className="ox-button" href={links.demo}>{t.openDemo}<Icon name="arrow-right" size={20}/></SiteLink>
        <SiteLink className="ox-button ox-button-secondary" href={links.github}>{t.github}<Icon name="arrow-right" size={20}/></SiteLink>
      </div>
    </div>
    <figure className="ox-crm-preview" data-crm-entrance aria-label={crm.preview.label}>
      <div className="ox-crm-window">
        <div className="ox-crm-window-bar"><span className="ox-crm-window-mark" aria-hidden="true"><Icon name="table" size={20}/></span><strong translate="no">CRM Portfolio</strong><span className="ox-crm-window-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
        <div className="ox-crm-board">
          <p className="ox-crm-board-title">{crm.preview.title}</p>
          <div className="ox-crm-board-columns">
            {crm.preview.stages.map((stage, index) => (<div className="ox-crm-board-column">
                <p className="ox-crm-stage"><span>{stage}</span><span className="ox-crm-stage-count">{crm.preview.deals[index].length}</span></p>
                <ul className="ox-crm-deals">
                  {crm.preview.deals[index].map(deal => (<li><span className="ox-crm-deal-line" aria-hidden="true"></span><strong>{deal}</strong><span className="ox-crm-deal-owner"><Icon name="users" size={16}/>{crm.preview.owner}</span></li>))}
                </ul>
              </div>))}
          </div>
        </div>
      </div>
      <figcaption>{crm.preview.caption}</figcaption>
    </figure>
  </div>
    </section>

    <section className="ox-crm-features ox-container" aria-labelledby="crm-features-title">
  <div className="ox-crm-section-heading" data-crm-feature>
    <p className="ox-page-kicker">{crm.featuresEyebrow}</p>
    <h2 id="crm-features-title">{crm.featuresTitle}</h2>
    <p>{crm.featuresIntro}</p>
  </div>
  <div className="ox-crm-feature-grid">
    {crm.features.map((feature, index) => <FeatureCard key={index} feature={feature} wide={[0, 3, 5].includes(index)}/>)}
  </div>
    </section>

    <CrmWorkflowDiagram locale={locale}/>
    <CrmModuleGrid locale={locale}/>
    <CrmDemoCta locale={locale}/>
    </>);
}
