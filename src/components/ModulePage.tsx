import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import Preview from './DemoProjectPreview';
import Route from './ProjectRoute';
import { pathFor, type Locale } from '../content';
import { moduleSlugs, modulePath, demoPath, projectPath, portfolio, type ModuleSlug } from '../content/portfolio';
import { demoProjectNames } from '../content/demo-projects';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    slug: ModuleSlug;
}
export default function ModulePage(props: Props) {
    const { locale, slug } = props;
    const t = portfolio[locale];
    const index = moduleSlugs.indexOf(slug);
    const module = t.modules[index];
    const next = moduleSlugs[index + 1];
    const facts = [{ label: t.detail.current, text: module.manual, icon: 'clock' }, { label: t.detail.proposed, text: module.proposal, icon: 'gear' }, { label: t.detail.responsibility, text: module.human, icon: 'users' }];
    const mechanism = [{ label: t.detail.input, text: module.input, icon: 'file-text' }, { label: t.detail.rule, text: module.rule, icon: 'check-square' }, { label: t.detail.exception, text: module.exception, icon: 'warning' }, { label: t.detail.output, text: module.output, icon: 'check-circle' }];
    return (<>
    <BaseLayout title={`${demoProjectNames[slug]} — ${module.title} — Optimix`} description={module.proposal} locale={locale} page="solution" slug={slug}>
  <SiteHeader locale={locale} page="solution" slug={slug}/>
  <main id="main" className="module-page-main"><section className="ox-page-hero" id="top"><div className="ox-container ox-module-hero"><div className="ox-page-heading"><p className="ox-page-kicker"><span translate="no">{demoProjectNames[slug]}</span></p><h1>{module.title}</h1><p className="ox-page-lead">{module.technology}</p><div className="ox-page-actions"><SiteLink className="ox-button" href={demoPath(locale) + '?step=' + slug}>{t.detail.demo}<Icon name="arrow-right" size={20}/></SiteLink><SiteLink className="ox-text-link" href={projectPath(locale)}>{t.project.projectLink}<Icon name="arrow-right" size={19}/></SiteLink></div></div><Preview locale={locale} kind={slug}/></div><div className="ox-container"><Route locale={locale} current={slug}/></div></section>
    <div className="ox-container ox-page-content"><section className="module-overview" aria-label={module.title}>{facts.map((fact, _index) => <article key={_index}><Icon name={fact.icon} size={28}/><h2>{fact.label}</h2><p>{fact.text}</p></article>)}</section><section className="mechanism-section" aria-labelledby="mechanism-title"><p className="ox-page-kicker">{t.detail.mechanism}</p><h2 id="mechanism-title">{module.technology}</h2><dl className="mechanism-grid">{mechanism.map((item, _index) => <div key={_index}><dt><Icon name={item.icon} size={23}/><span>{item.label}</span></dt><dd>{item.text}</dd></div>)}</dl></section><nav className="module-next" aria-label={t.workflow.title}><SiteLink className="ox-text-link" href={pathFor(locale, 'home') + '#demo-projects'}><Icon name="arrow-right" className="ox-arrow-back" size={19}/>{t.detail.back}</SiteLink>{next && <SiteLink className="ox-button ox-button-secondary" href={modulePath(locale, next)}>{t.detail.next}<span translate="no">{demoProjectNames[next]}</span><Icon name="arrow-right" size={19}/></SiteLink>}</nav><p className="module-disclosure">{t.detail.disclosure}</p></div>
  </main><SiteFooter locale={locale} page="solution" slug={slug}/>
    </BaseLayout>
    </>);
}
