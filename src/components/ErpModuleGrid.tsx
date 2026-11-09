import type { Locale } from '../content';
import { erpModuleIds, erpSupplementContent } from '../content/portfolio-pages';
import ErpModuleCard from './ErpModuleCard';
interface Props {
    locale: Locale;
}
export default function ErpModuleGrid(props: Props) {
    const { locale } = props;
    const t = erpSupplementContent[locale];
    return (<>
    <section className="ox-erp-modules ox-container" id="erp-modules" aria-labelledby="erp-modules-title">
  <div className="ox-erp-section-heading">
    <p className="ox-page-kicker">{t.eyebrow}</p><h2 id="erp-modules-title">{t.title}</h2><p>{t.intro}</p>
  </div>
  <div className="ox-erp-module-grid">{erpModuleIds.map((id, _index) => <ErpModuleCard key={_index} id={id} module={t.modules[id]}/>)}</div>
    </section>
    </>);
}
