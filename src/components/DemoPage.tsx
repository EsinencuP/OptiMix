import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import Route from './ProjectRoute';
import { type Locale } from '../content';
import { modulePath, portfolio } from '../content/portfolio';
import { demoProjectNames } from '../content/demo-projects';
import { siteRedesign } from '../content/site-redesign';
import { cx } from '../lib/ui';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function DemoPage(props: Props) {
    const { locale } = props;
    const t = portfolio[locale];
    return (<>
    <BaseLayout title={`${t.demo.title} — Optimix`} description={t.demo.intro} locale={locale} page="demo">
  <SiteHeader locale={locale} page="demo"/>
  <main id="main" className="demo-page-main" data-demo data-active-label={t.demo.active} data-halted={t.demo.halted} data-complete={t.demo.complete}><section className="ox-page-hero" id="top"><div className="ox-container ox-page-heading"><p className="ox-page-kicker">{siteRedesign(locale).demo}</p><h1>{t.demo.title}</h1><p className="ox-page-lead">{t.demo.intro}</p><Route locale={locale} mode="demo" current="intake"/></div></section>
    <div className="ox-container demo-shell"><section className="demo-controls" aria-label={t.demo.scenarioLabel}><fieldset><legend>{t.demo.scenarioLabel}</legend><label><input type="radio" name="demo-scenario" value="normal" defaultChecked/><Icon name="check-circle" size={23}/><span>{t.demo.normal}</span></label><label><input type="radio" name="demo-scenario" value="exception"/><Icon name="warning" size={23}/><span>{t.demo.exception}</span></label></fieldset><div className="ox-demo-buttons"><button className="ox-button" type="button" data-demo-next>{t.demo.next}<Icon name="arrow-right" size={20}/></button><button className="ox-button" type="button" data-demo-resolve hidden>{t.demo.resolve}<Icon name="arrow-right" size={20}/></button><button className="ox-button ox-button-secondary" type="button" data-demo-restart>{t.demo.restart}</button></div><p className="demo-state" role="status" data-demo-status>{t.demo.active}: {t.modules[0].title}</p><p className="demo-disclosure">{t.demo.disclosure}</p><noscript><p className="ox-alert">{siteRedesign(locale).noScript}</p></noscript></section>
      <ol className="demo-steps">{t.modules.map((module, i) => <li key={i} className={cx([i === 0 && 'is-active'])} data-demo-step><div className="ox-demo-marker"><span>0{i + 1}</span><Icon className="ox-demo-done" name="check-circle-fill" size={26}/><Icon className="ox-demo-warning" name="warning" size={26}/></div><div><p className="ox-demo-project-name" translate="no">{demoProjectNames[module.slug]}</p><h2>{module.title}</h2><p><strong>{t.demo.current}:</strong> {module.manual}</p><p><strong>{t.demo.proposed}:</strong> {module.proposal}</p><SiteLink className="ox-text-link" href={modulePath(locale, module.slug)}>{t.workflow.details}<Icon name="arrow-right" size={19}/></SiteLink></div></li>)}</ol>
    </div>
  </main><SiteFooter locale={locale} page="demo"/>
    </BaseLayout>
    </>);
}
