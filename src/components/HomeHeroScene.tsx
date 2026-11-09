import Icon from './Icon';
import { homeRedesign } from '../content/home-redesign';
import type { Locale } from '../content';
import { heroSheets } from '../content/hero-sheets';
interface Props {
    locale: Locale;
}
export default function HomeHeroScene(props: Props) {
    const { locale } = props;
    const t = homeRedesign(locale);
    const scene = t.heroScene;
    const shares = [45, 30, 15, 10];
    const sheets = heroSheets(locale);
    return (<>
    <figure className="ox-hero-scene ox-hero-shuffle" aria-label={scene.chartLabel} data-hero-charts data-hero-shuffle>
  <div className="ox-hero-artboard">
    <div className="ox-hero-layers">
      {[...sheets.sheets].reverse().map((sheet, i) => <div key={i} className={`ox-hero-layer ox-hero-layer-${i}`} data-hero-sheet={sheet.key} data-sheet-order={3 - i} data-depth={3 - i} aria-hidden="true"><div className="ox-hero-layer-label"><Icon name={sheet.icon} size={24}/><span>{sheet.title}</span></div><div className="ox-sheet-face"><p className="ox-sheet-subtitle">{sheet.subtitle}</p><ul>{sheet.rows.map((row, index) => <li key={index}><span className="ox-sheet-symbol"><Icon name={sheet.key === 'people' ? 'users' : sheet.key === 'processes' ? 'check-circle-fill' : index === 0 ? 'circle' : index === 1 ? 'database' : 'chart-line-up'} size={28}/></span><span>{row}</span>{index < 2 && sheet.key !== 'people' && <Icon className="ox-sheet-connector" name="arrow-right" size={20}/>}</li>)}</ul><p className="ox-sheet-footer"><Icon name="check-circle-fill" size={20}/>{sheet.footer}</p></div></div>)}
    </div>
    <div className="ox-hero-process" data-hero-sheet="crm" data-sheet-order="0" data-depth="0">
      <div className="ox-hero-process-bar"><p>{t.processLabel}</p><div className="ox-hero-process-dots" aria-hidden="true"><Icon name="circle-muted" className="is-current" size={14}/><Icon name="circle-muted" size={14}/><Icon name="circle-muted" size={14}/></div></div>
      <div className="ox-hero-process-body">
        <div className="ox-hero-crm">
          <h2><Icon name="circle" className="ox-hero-blue-icon" size={28}/><span>CRM<small>{t.deal}</small></span></h2>
          <dl><div><dt>{t.client}</dt><dd>{t.demoCompany}</dd></div><div><dt>{t.owner}</dt><dd>{t.owner}</dd></div><div><dt>{t.stages[4]}</dt><dd>{t.inProgress}</dd></div></dl>
        </div>
        <div className="ox-hero-sync"><Icon name="arrow-right" className="ox-hero-blue-icon" size={22}/><span>{t.sync}</span><Icon name="arrow-right" className="ox-hero-blue-icon" size={22}/></div>
        <div className="ox-hero-analytics">
          <h2><Icon name="chart-bar" size={26}/><span>{scene.analytics}</span></h2>
          <div className="ox-hero-revenue ox-hero-chart-panel"><h3>{scene.revenue}</h3><canvas data-hero-chart="revenue" width="480" height="240" role="img" aria-label={`${scene.revenue}: 72–178`}>{scene.revenue}: 72, 94, 81, 103, 99, 128, 115, 149, 151, 178.</canvas></div>
          <div className="ox-hero-analytics-bottom">
            <div className="ox-hero-shares ox-hero-chart-panel"><h3>{scene.deals}</h3><div className="ox-hero-shares-body"><canvas data-hero-chart="shares" width="200" height="200" aria-hidden="true"></canvas><ul>{shares.map((share, i) => <li key={i}><span className={`ox-hero-share-key ox-hero-share-${i}`} aria-hidden="true"></span><span>{share}%</span><span className="ox-hero-chart-a11y"> — {scene.statuses[i]}</span></li>)}</ul></div></div>
            <div className="ox-hero-teams ox-hero-chart-panel"><h3>{scene.teams}</h3><canvas data-hero-chart="teams" width="160" height="200" role="img" aria-label={`${scene.teams}: 35, 60, 45, 75`}>{scene.teams}: 35, 60, 45, 75.</canvas></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="ox-hero-switcher" role="group" aria-label={sheets.choose}><button type="button" data-hero-choose="0" aria-pressed="true">CRM</button>{sheets.sheets.map((sheet, i) => <button key={i} type="button" data-hero-choose={i + 1} aria-pressed="false">{sheet.title}</button>)}<button type="button" data-hero-pause data-pause-label={sheets.pause} data-play-label={sheets.play} aria-label={sheets.pause}><span aria-hidden="true">Ⅱ</span></button></div>
  <figcaption className="ox-hero-chart-a11y">{scene.chartCaption}</figcaption>
    </figure>
    </>);
}
