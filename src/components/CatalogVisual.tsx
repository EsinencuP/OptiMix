import Icon from './Icon';
import { portfolioUI, type CatalogProject } from '../content/portfolio-catalog';
import type { Locale } from '../content';
import { cx } from '../lib/ui';
interface Props {
    project: CatalogProject;
    locale: Locale;
    compact?: boolean;
}
export default function CatalogVisual(props: Props) {
    const { project, locale, compact = false } = props;
    const t = portfolioUI(locale);
    const capture = project.slug === 'pdf-editor' ? 'pdf-workspace' : project.slug === 'erp' ? 'erp' : undefined;
    return (<>
    <figure className={cx(['ox-catalog-visual', `ox-catalog-visual-${project.slug}`, compact && 'is-compact'])} aria-label={project.fullName}>
  {capture ? <>
    <img className="ox-catalog-capture" src={`/images/portfolio/${capture}.webp`} width="1440" height="1000" alt={`${project.fullName} — ${t.screenshot}`} loading={compact ? 'lazy' : 'eager'} decoding="async"/>
    {!compact && <figcaption>{t.screenshot} · {project.name}</figcaption>}
  </> : <div className="ox-catalog-art">
    <span className="ox-catalog-art-orbit" aria-hidden="true"></span>
    <span className="ox-catalog-art-symbol"><Icon name={project.icon} size={compact ? 42 : 72}/></span>
    <span className="ox-catalog-art-category">{project.category}</span>
    <strong translate="no">{project.fullName}</strong>
    <span className="ox-catalog-art-brand" translate="no">OPTIMIX / PORTFOLIO</span>
  </div>}
    </figure>
    </>);
}
