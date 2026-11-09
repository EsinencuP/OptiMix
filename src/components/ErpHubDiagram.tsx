import type { Locale } from '../content';
import { erpPageContent, erpHubModuleIds, erpHubIcons } from '../content/portfolio-pages';
import Icon from './Icon';
import { styleFromCss } from '../lib/ui';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function ErpHubDiagram(props: Props) {
    const { locale } = props;
    const t = erpPageContent[locale].hub;
    const geometry = [
        { x: 500, y: 72, path: 'M500 300V72' },
        { x: 800, y: 168, path: 'M500 300Q650 300 800 168' },
        { x: 800, y: 432, path: 'M500 300Q650 300 800 432' },
        { x: 500, y: 528, path: 'M500 300V528' },
        { x: 200, y: 432, path: 'M500 300Q350 300 200 432' },
        { x: 200, y: 168, path: 'M500 300Q350 300 200 168' },
    ];
    return (<>
    <section className="ox-erp-hub ox-container" id="erp-hub" data-erp-hub aria-labelledby="erp-hub-title">
  <div className="ox-erp-section-heading"><p className="ox-page-kicker">{t.eyebrow}</p><h2 id="erp-hub-title">{t.title}</h2><p>{t.intro}</p></div>
  <figure className="ox-erp-hub-map" data-hub-map aria-label={t.diagramLabel}>
    <svg className="ox-erp-hub-svg" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      {erpHubModuleIds.map((id, index) => <path key={index} className="ox-erp-spoke" id={`erp-spoke-${id}`} data-hub-path={id} d={geometry[index].path}/>)}
      {erpHubModuleIds.map((id, _index) => <circle key={_index} className="ox-erp-flow-dot" data-hub-dot={id} cx="0" cy="0" r="3"/>)}
    </svg>
    <div className="ox-erp-core"><Icon name="database" size={30}/><strong translate="no">ERP Core</strong></div>
    {erpHubModuleIds.map((id, index) => <div key={index} className="ox-erp-node-position" style={styleFromCss(`--node-x:${geometry[index].x / 10}%;--node-y:${geometry[index].y / 6}%`)}>
      <SiteLink className="ox-erp-hub-node" id={`erp-node-${id}`} href={`#erp-module-${id}`} data-hub-node={id} data-hub-title={t.modules[id].title} data-hub-summary={t.modules[id].summary}>
        <span className="ox-erp-node-icon"><Icon name={erpHubIcons[id]} size={26}/></span><span>{t.modules[id].title}</span>
      </SiteLink>
    </div>)}
    <div className="ox-erp-hub-tooltip" id="erp-hub-tooltip" data-hub-tooltip role="tooltip" hidden><strong data-hub-tooltip-title></strong><p data-hub-tooltip-body></p></div>
  </figure>
  <div className="ox-erp-hub-controls"><p>{t.hint}</p><button type="button" data-hub-flow-toggle data-pause={t.pause} data-play={t.play} hidden>{t.pause}</button></div>
  <div className="ox-erp-hub-details" aria-labelledby="erp-hub-details-title"><h3 id="erp-hub-details-title">{t.detailsTitle}</h3>
    {erpHubModuleIds.map((id, _index) => <details key={_index} className="ox-erp-hub-panel" id={`erp-module-${id}`} name="erp-hub-module" data-hub-panel={id}>
      <summary><Icon name={erpHubIcons[id]} size={24}/><span>{t.modules[id].title}</span><Icon name="caret-down" size={18}/></summary>
      <div className="ox-erp-module-body"><p>{t.modules[id].summary}</p><ul>{t.modules[id].features.map((feature, _index) => <li key={_index}><Icon name="check" size={18}/><span>{feature}</span></li>)}</ul></div>
    </details>)}
  </div>
    </section>
    </>);
}
