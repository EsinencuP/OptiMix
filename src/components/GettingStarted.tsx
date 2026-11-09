'use client';
import { motion, useReducedMotion } from 'motion/react';
import { homeRedesign } from '../content/home-redesign';
import { pathFor, type Locale } from '../content';
import Icon from './Icon';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
    id?: string;
}
export default function GettingStarted(props: Props) {
    const { locale, id = 'approach' } = props;
    const t = homeRedesign(locale);
    const reduce = useReducedMotion();
    return (<>
    <section className="ox-start ox-start-expanded ox-section" id={id} aria-labelledby={`${id}-title`}><div className="ox-container">
  <div className="ox-section-heading"><h2 id={`${id}-title`}>{t.startTitle}</h2><p>{t.startIntro}</p></div>
  <ol className="ox-start-grid">{t.steps.map((step, i) => <motion.li key={step.title} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .45, delay: reduce ? 0 : i * .1 }}><span className="ox-step-number">{i + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div>{i < 3 && <Icon name="arrow-right" className="ox-step-arrow" size={28}/>}</motion.li>)}</ol>
  <div className="ox-section-cta"><SiteLink className="ox-button" href={pathFor(locale, 'contact')}>{t.action}<Icon name="arrow-right" size={20}/></SiteLink></div>
    </div></section>
    </>);
}
