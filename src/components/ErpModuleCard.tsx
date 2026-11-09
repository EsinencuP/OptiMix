import type { ErpModuleCopy, ErpModuleId } from '../content/portfolio-pages';
import { erpModuleIcons } from '../content/portfolio-pages';
import Icon from './Icon';
import { cx } from '../lib/ui';
interface Props {
    id: ErpModuleId;
    module: ErpModuleCopy;
}
export default function ErpModuleCard(props: Props) {
    const { id, module } = props;
    return (<>
    <article className={cx(['ox-erp-module-card', { 'ox-erp-module-card-wide': id === 'settings' }])} data-erp-module={id} aria-labelledby={`erp-card-${id}`}>
  <div className="ox-erp-module-copy">
    <span className="ox-erp-module-icon"><Icon name={erpModuleIcons[id]} size={28}/></span>
    <h3 id={`erp-card-${id}`}>{module.title}</h3>
    <p>{module.description}</p>
  </div>
  <ul>{module.features.map((feature, _index) => <li key={_index}><Icon name="check-circle" size={18}/><span>{feature}</span></li>)}</ul>
    </article>
    </>);
}
