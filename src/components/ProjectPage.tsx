import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import Route from './ProjectRoute';
import Preview from './DemoProjectPreview';
import { type Locale } from '../content';
import { demoPath, modulePath, portfolio } from '../content/portfolio';
import { demoProjects, demoProjectNames } from '../content/demo-projects';
import { siteRedesign } from '../content/site-redesign';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function ProjectPage(props: Props) {
    const { locale } = props;
    const t = portfolio[locale];
    const projects = demoProjects(locale).projects;
    return (<>
    <BaseLayout title={`${t.project.title} — Optimix`} description={t.project.intro} locale={locale} page="project">
  <SiteHeader locale={locale} page="project"/>
  <main id="main" className="project-page-main"><section className="ox-page-hero" id="top"><div className="ox-container ox-page-heading"><p className="ox-page-kicker">{siteRedesign(locale).project}</p><h1>{t.project.title}</h1><p className="ox-page-lead">{t.project.intro}</p><div className="ox-page-actions"><SiteLink className="ox-button" href={demoPath(locale)}>{t.project.demoLink}<Icon name="arrow-right" size={20}/></SiteLink></div><Route locale={locale}/></div></section>
    <div className="ox-container project-summary"><section className="project-status" aria-labelledby="project-status-title"><Icon name="eye" size={28}/><h2 id="project-status-title">{t.project.statusTitle}</h2><p>{t.project.status}</p></section><section className="project-prerequisites" aria-labelledby="prerequisites-title"><h2 id="prerequisites-title">{t.project.prerequisitesTitle}</h2><ul>{t.project.prerequisites.map((item, _index) => <li key={_index}><Icon name="check-circle-fill" size={23}/><span>{item}</span></li>)}</ul></section><section className="project-modules" aria-labelledby="project-modules-title"><h2 id="project-modules-title">{t.project.modulesTitle}</h2><ol className="ox-project-module-grid">{t.modules.map((module, i) => <li key={i}><Preview locale={locale} kind={module.slug}/><div className="ox-project-module-copy"><p className="ox-page-kicker">{projects[i].category}</p><h3 translate="no">{demoProjectNames[module.slug]}</h3><p>{module.title}</p><SiteLink className="ox-text-link" href={modulePath(locale, module.slug)}>{t.project.moduleLink}<Icon name="arrow-right" size={19}/></SiteLink></div></li>)}</ol></section></div>
  </main><SiteFooter locale={locale} page="project"/>
    </BaseLayout>
    </>);
}
