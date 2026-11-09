import Icon from './Icon';
import Visual from './CatalogVisual';
import { demoProjects } from '../content/demo-projects';
import { portfolioCatalog, portfolioUI } from '../content/portfolio-catalog';
import { pathFor, type Locale } from '../content';
import { styleFromCss } from '../lib/ui';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function DemoProjectGallery(props: Props) {
    const { locale } = props;
    const t = portfolioUI(locale), deck = demoProjects(locale).deck;
    const catalog = portfolioCatalog(locale);
    const projects = catalog.filter(project => project.slug !== 'crm');
    const crm = catalog.find(project => project.slug === 'crm')!;
    return (<>
    <section className="ox-projects ox-projects-deck ox-projects-catalog ox-section" id="demo-projects" aria-labelledby="ox-projects-title">
  <div className="ox-container">
    <div className="ox-section-heading"><p className="ox-projects-eyebrow">{t.eyebrow}</p><h2 id="ox-projects-title">{t.title}</h2><p>{t.intro}</p><SiteLink className="ox-catalog-collection-link" href={pathFor(locale, 'portfolio')}>{t.all}<Icon name="arrow-right" size={18}/></SiteLink></div>
    <div className="ox-deck" data-demo-deck>
      <div className="ox-deck-stage">
        {projects.map((project, i) => <article key={i} className="ox-deck-card" data-deck-card={project.slug} id={'demo-' + project.slug} aria-label={project.name} style={styleFromCss(`--card-index:${i - 2};--card-layer:${i + 1};--fan-y:${[52, 20, 0, 20, 52][i]}px;--fan-angle:${[-12, -5, 0, 5, 12][i]}deg;--fan-scale:${[.9, .94, 1, .94, .9][i]};`)}>
          <button className="ox-deck-close" type="button" data-deck-close data-deck-detail aria-label={deck.close + ' — ' + project.name}><Icon name="x" size={22}/></button>
          <div className="ox-deck-inner">
            <div className="ox-deck-front" id={'deck-content-' + project.slug}>
              <button className="ox-deck-hit" data-deck-hit data-deck-open-label={deck.open + ' — ' + project.name} data-deck-flip-label={deck.flip + ' — ' + project.name} type="button" aria-expanded="false" aria-controls={'deck-content-' + project.slug} aria-label={deck.open + ' — ' + project.name}></button>

              <div className="ox-deck-emblem"><Icon name={project.icon} size={54}/></div>
              <h3 id={'project-' + project.slug} translate="no">{project.name}</h3>
              <p className="ox-deck-category">{project.category}</p>
              <p className="ox-deck-headline">{project.headline}</p>
              <div className="ox-deck-detail" data-deck-detail><p className="ox-deck-description">{project.description}</p><Visual project={project} locale={locale} compact/></div>
              <ul className="ox-deck-tags">{project.tags.map((tag, _index) => <li key={_index}>{tag}</li>)}</ul>
              <button className="ox-deck-flip" data-deck-flip data-deck-detail type="button">{deck.flip}<Icon name="arrow-clockwise" size={17}/></button>

            </div>
            <div className="ox-deck-back">

              <p className="ox-deck-kicker">{project.draft ? t.draft : t.overview}</p>
              <h4 translate="no">{project.name}</h4>
              <p className="ox-deck-back-title">{project.headline}</p>
              <p className="ox-deck-description">{project.description}</p>
              <ul className="ox-deck-back-tags">{project.tags.map((tag, _index) => <li key={_index}><Icon name="check-circle-fill" size={21}/>{tag}</li>)}</ul>

              <div className="ox-deck-links">
                <SiteLink className="ox-button" href={project.projectHref} aria-label={t.open + ' — ' + project.name}>{t.open}<Icon name="arrow-right" size={19}/></SiteLink>
                <SiteLink className="ox-button ox-button-secondary" href={project.demo} aria-label={t.demo + ' — ' + project.name}>{t.demo}<Icon name="arrow-right" size={19}/></SiteLink>
                <SiteLink className="ox-project-demo-link" href={project.github} aria-label={t.github + ' — ' + project.name}>GitHub</SiteLink>
              </div>
              <button className="ox-deck-return" data-deck-back type="button"><Icon name="arrow-left" size={17}/>{deck.back}</button>
            </div>
          </div>
        </article>)}
        <button className="ox-deck-cover" type="button" data-deck-reveal aria-expanded="false">
          <span className="ox-brand"><img src="/images/redesign/brand-mark-graphite.svg" width="18" height="18" alt=""/><span translate="no">OPTIMIX</span></span>
          <span className="ox-deck-emblem"><Icon name="table" size={54}/></span>
          <strong>{t.eyebrow}</strong><span>{deck.reveal}</span>
        </button>
      </div>
      <p className="ox-deck-hint"><span className="ox-deck-pointer-hint">{deck.hint}</span><span className="ox-deck-touch-hint">{deck.touchHint}</span></p>
      <div className="ox-deck-picker" role="group" aria-label={deck.choose}>{projects.map((project, _index) => <button key={_index} type="button" data-deck-select={project.slug} aria-pressed="false" translate="no">{project.name}</button>)}</div>
    </div>
    <article className="ox-project-card ox-project-all" aria-labelledby="project-crm"><div className="ox-project-copy"><div className="ox-project-category"><Icon name={crm.icon} size={19}/><span>{crm.category}</span></div><h3 id="project-crm" translate="no">{crm.name}</h3><p className="ox-project-headline">{crm.headline}</p><p className="ox-project-description">{crm.description}</p><ul className="ox-project-tags">{crm.tags.map((tag, _index) => <li key={_index}>{tag}</li>)}</ul><SiteLink className="ox-button" href={crm.projectHref}>{t.open}<Icon name="arrow-right" size={20}/></SiteLink><div className="ox-project-links"><SiteLink className="ox-project-open" href={crm.demo}>{t.demo}<Icon name="arrow-right" size={18}/></SiteLink><SiteLink className="ox-project-demo-link" href={crm.github}>{t.github}</SiteLink></div></div><Visual project={crm} locale={locale}/></article>
  </div>
    </section>
    </>);
}
