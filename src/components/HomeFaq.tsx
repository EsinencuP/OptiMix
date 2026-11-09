'use client';
import * as Accordion from '@radix-ui/react-accordion';
import Icon from './Icon';
import { homeRedesign } from '../content/home-redesign';
import { pathFor, type Locale } from '../content';
import SiteLink from './SiteLink';
export default function HomeFaq({ locale }: {
    locale: Locale;
}) {
    const t = homeRedesign(locale);
    return <section className="ox-faq ox-faq-expanded ox-section" id="faq" aria-labelledby="ox-faq-title"><div className="ox-container ox-faq-grid"><div><h2 id="ox-faq-title">{t.faqTitle}</h2><p>{t.faqIntro}</p></div><Accordion.Root className="ox-faq-list ox-faq-radix" type="single" collapsible>{t.faqs.map((faq, index) => <Accordion.Item className="ox-faq-item" key={faq.question} value={String(index)}><Accordion.Header className="ox-faq-question"><Accordion.Trigger className="ox-faq-trigger"><span className="ox-faq-marker" aria-hidden="true"/><span>{faq.question}</span><Icon name="plus" size={24}/></Accordion.Trigger></Accordion.Header><Accordion.Content className="ox-faq-answer"><p>{faq.answer}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root><noscript><style>{'.ox-faq-radix{display:none!important}'}</style><div className="ox-faq-list">{t.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></noscript><div className="ox-section-cta"><SiteLink className="ox-button" href={pathFor(locale, 'contact')}>{t.action}<Icon name="arrow-right" size={20}/></SiteLink></div></div></section>;
}
