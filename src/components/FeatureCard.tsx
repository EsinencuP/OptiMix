import Icon from './Icon';
import type { PortfolioFeature } from '../content/portfolio-pages';
import { cx } from '../lib/ui';
interface Props {
    feature: PortfolioFeature;
    wide?: boolean;
}
export default function FeatureCard(props: Props) {
    const { feature, wide = false } = props;
    return (<>
    <article className={cx(['ox-feature-card', wide && 'ox-feature-card-wide'])} data-crm-feature>
  <div className="ox-feature-card-top">
    <span className="ox-feature-icon" aria-hidden="true">
      {feature.icon === 'sparkles' ? (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z"/>
          <path d="M20 2v4m-2-2h4"/>
        </svg>) : <Icon name={feature.icon} size={28}/>}
    </span>
  </div>
  <h3>{feature.title}</h3>
  <p>{feature.description}</p>
    </article>
    </>);
}
