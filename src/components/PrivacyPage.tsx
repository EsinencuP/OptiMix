import BaseLayout from '../layouts/BaseLayout';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Icon from './Icon';
import { content, pathFor, type Locale } from '../content';
import { siteRedesign } from '../content/site-redesign';
import SiteLink from './SiteLink';
interface Props {
    locale: Locale;
}
export default function PrivacyPage(props: Props) {
    const { locale } = props;
    const t = content[locale];
    const l = siteRedesign(locale);
    return (<>
    <BaseLayout title={t.meta.privacyTitle} description={t.meta.privacyDescription} locale={locale} page="privacy">
  <SiteHeader locale={locale} page="privacy"/>
  <main id="main" className="inner-main privacy-main"><section className="ox-page-hero" id="top"><div className="ox-container ox-page-heading"><p className="ox-page-kicker">{l.privacy}</p><h1>{t.privacyPage.title}</h1><p className="ox-page-lead">{t.privacyPage.lead}</p></div></section><div className="ox-container privacy-content"><article className="ox-privacy-card"><span className="ox-panel-symbol"><Icon name="eye" size={32}/></span><p className="privacy-detail">{t.privacyPage.detail}</p><SiteLink className="ox-button" href={pathFor(locale, 'contact')}>{t.privacyPage.back}<Icon name="arrow-right" size={20}/></SiteLink><SiteLink className="ox-text-link" href={pathFor(locale, 'home')}>{l.home}<Icon name="arrow-right" size={19}/></SiteLink></article></div></main>
  <SiteFooter locale={locale} page="privacy"/>
    </BaseLayout>
    </>);
}
