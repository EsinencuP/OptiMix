import type { Locale } from '../content';
import { crmWorkflowContent } from '../content/portfolio-pages';
import Icon from './Icon';
import { cx } from '../lib/ui';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function CrmWorkflowDiagram(props: Props) {
    const { locale } = props;
    const t = crmWorkflowContent[locale];
    const segments = [0, 1, 2, 3];
    return (<>
    <section className="ox-crm-workflow ox-container" id="crm-workflow" data-crm-workflow aria-labelledby="crm-workflow-title">
  <div className="ox-crm-section-heading">
    <p className="ox-page-kicker">{t.eyebrow}</p>
    <h2 id="crm-workflow-title">{t.title}</h2>
    <p>{t.intro}</p>
  </div>
  <div className="ox-workflow-track">
    <svg className="ox-workflow-lines ox-workflow-horizontal" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
      <path className="ox-workflow-route" data-workflow-route d="M100 32H900"/>
      {segments.map((index, _index) => <path key={_index} className="ox-workflow-progress" data-workflow-segment={index} d={`M${100 + index * 200} 32H${300 + index * 200}`}/>)}
    </svg>
    <svg className="ox-workflow-lines ox-workflow-vertical" viewBox="0 0 64 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="ox-workflow-route" data-workflow-route d="M32 0V100"/>
      {segments.map((index, _index) => <path key={_index} className="ox-workflow-progress" data-workflow-segment={index} d={`M32 ${index * 25}V${(index + 1) * 25}`}/>)}
    </svg>
    <nav className="ox-workflow-tabs" data-workflow-tabs aria-label={t.tabLabel}>
      {t.steps.map((step, index) => (<SiteLink className={cx(['ox-workflow-tab', index === 0 && 'is-active'])} href={`#crm-workflow-panel-${index}`} id={`crm-workflow-tab-${index}`} data-workflow-tab>
          <svg className="ox-workflow-node" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="29"/>
            <text x="32" y="32" textAnchor="middle" dominantBaseline="central">{String(index + 1).padStart(2, '0')}</text>
          </svg>
          <span><span className="sr-only">{String(index + 1).padStart(2, '0')} · </span>{step.title}</span>
        </SiteLink>))}
    </nav>
  </div>
  <div className="ox-workflow-controls" data-workflow-controls hidden>
    <p data-workflow-hint data-auto-hint={t.autoHint} data-reduced-hint={t.reducedHint}>{t.autoHint}</p>
    <button className="ox-workflow-toggle" type="button" data-workflow-toggle data-pause-label={t.pause} data-play-label={t.play}>{t.pause}</button>
  </div>
  <div className="ox-workflow-details">
  <div className="ox-workflow-panels">
    {t.steps.map((step, index) => (<section className="ox-workflow-panel" id={`crm-workflow-panel-${index}`} aria-labelledby={`crm-workflow-tab-${index}`} data-workflow-panel>
        <span className="ox-workflow-panel-icon" aria-hidden="true"><Icon name={step.icon} size={28}/></span>
        <div><p className="ox-workflow-panel-step">{String(index + 1).padStart(2, '0')} · {step.title}</p><h3>{step.heading}</h3><p className="ox-workflow-description">{step.description}</p></div>
      </section>))}
  </div>

  </div>
  <noscript><p className="ox-workflow-no-script">{t.noScript}</p></noscript>
    </section>
    </>);
}
