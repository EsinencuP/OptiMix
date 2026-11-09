import type { Locale } from '../content';
import { erpPageContent, erpTechnologies, erpHubIcons, portfolioPages, portfolioPageLinks } from '../content/portfolio-pages';
import Icon from './Icon';
import ErpHubDiagram from './ErpHubDiagram';
import ErpModuleGrid from './ErpModuleGrid';
import ErpDemoCta from './ErpDemoCta';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function ErpPortfolioContent(props: Props) {
    const { locale } = props;
    const t = erpPageContent[locale];
    const common = portfolioPages[locale];
    const previewIds = ['finance', 'inventory', 'team'] as const;
    return (<>
    <section className="ox-erp-hero" id="top" aria-labelledby="portfolio-title">
  <div className="ox-container ox-erp-hero-layout">
    <div className="ox-erp-hero-copy" data-erp-entrance>
      <p className="ox-page-kicker">{common.eyebrow}</p>
      <h1 id="portfolio-title">{common.projects.erp.title}<span>{t.heroAccent}</span></h1>
      <p className="ox-erp-lead">{common.projects.erp.intro}</p>
      <ul className="ox-erp-tags" aria-label={t.technologyLabel}>{erpTechnologies.map((tag, _index) => <li key={_index} translate="no">{tag}</li>)}</ul>
      <div className="ox-erp-actions">
        <SiteLink className="ox-button" href={portfolioPageLinks.erp.demo}>{common.openDemo}<Icon name="arrow-right" size={20}/></SiteLink>
        <SiteLink className="ox-button ox-button-secondary" href={portfolioPageLinks.erp.github}>{common.github}<Icon name="arrow-right" size={20}/></SiteLink>
      </div>

    </div>
    <figure className="ox-erp-preview" data-erp-entrance aria-label={t.previewLabel}>
      <div className="ox-erp-window">
        <div className="ox-erp-window-bar"><Icon name="database" size={24}/><strong translate="no">Evo ERP</strong><span aria-hidden="true">•••</span></div>
        <div className="ox-erp-overview"><p className="ox-erp-overview-title">{t.previewTitle}</p><ul>
          {previewIds.map((id, index) => <li key={index}><span className="ox-erp-preview-icon"><Icon name={erpHubIcons[id]} size={26}/></span><div><strong>{t.hub.modules[id].title}</strong><p>{t.previewRows[index]}</p></div><Icon name="check-circle" size={21}/></li>)}
        </ul></div>
      </div>
      <figcaption>{t.previewCaption}</figcaption>
    </figure>
  </div>
    </section>
    <ErpHubDiagram locale={locale}/>
    <ErpModuleGrid locale={locale}/>
    <ErpDemoCta locale={locale}/>
    </>);
}
