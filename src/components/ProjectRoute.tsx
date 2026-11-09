import Icon from './Icon';
import { demoProjects, demoProjectNames } from '../content/demo-projects';
import { modulePath, demoPath, type ModuleSlug } from '../content/portfolio';
import { siteRedesign } from '../content/site-redesign';
import type { Locale } from '../content';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    current?: ModuleSlug;
    mode?: 'module' | 'demo';
}
export default function ProjectRoute(props: Props) {
    const { locale, current, mode = 'module' } = props;
    const projects = demoProjects(locale).projects;
    return (<>
    <nav className="ox-route-nav" aria-label={siteRedesign(locale).route}>{projects.map((project, i) => <SiteLink key={i} data-route-step={mode === 'demo' ? project.slug : undefined} href={mode === 'demo' ? demoPath(locale) + '?step=' + project.slug : modulePath(locale, project.slug)} aria-current={project.slug === current ? mode === 'demo' ? 'step' : 'page' : undefined}><span className="ox-route-number">0{i + 1}</span><Icon name={project.icon} size={23}/><span translate="no">{demoProjectNames[project.slug]}</span></SiteLink>)}</nav>
    </>);
}
