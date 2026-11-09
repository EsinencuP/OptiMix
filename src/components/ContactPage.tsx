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
export default function ContactPage(props: Props) {
    const { locale } = props;
    const t = content[locale];
    const l = siteRedesign(locale);
    return (<>
    <BaseLayout title={t.meta.contactTitle} description={t.meta.contactDescription} locale={locale} page="contact">
  <SiteHeader locale={locale} page="contact"/>
  <main id="main" className="inner-main">
    <section className="ox-page-hero" id="top"><div className="ox-container ox-page-heading"><p className="ox-page-kicker">{l.brief}</p><h1>{t.contactPage.title}</h1><p className="ox-page-lead">{t.contactPage.lead}</p></div></section>
    <div className="ox-container brief-layout">
      <aside className="brief-status"><span className="ox-panel-symbol"><Icon name="file-text" size={31}/></span><h2>{l.briefStatus}</h2><p>{t.contactPage.status}</p><p>{t.contactPage.details}</p><SiteLink className="ox-text-link" href={pathFor(locale, 'privacy')}>{t.contactPage.privacyLink}<Icon name="arrow-right" size={19}/></SiteLink><div className="ox-brief-help"><Icon name="check-circle-fill" size={21}/><span>{t.contactPage.builderIntro}</span></div></aside>
      <section className="brief-builder" data-brief-builder data-filename={`optimix-process-brief-${locale}.txt`} data-title={t.contactPage.builderTitle} data-download-notice={t.contactPage.downloadNotice} aria-labelledby="brief-builder-title">
        <h2 id="brief-builder-title">{t.contactPage.builderTitle}</h2><p className="brief-builder-intro">{t.contactPage.builderIntro}</p>
        <div className="brief-fields"><label>{t.contactPage.process}<input type="text" name="process" data-brief-field/></label><label>{t.contactPage.description}<textarea name="description" rows={5} data-brief-field></textarea></label><div className="form-two"><label>{t.contactPage.systems}<input type="text" name="systems" data-brief-field/></label><label>{t.contactPage.frequency}<input type="text" name="frequency" data-brief-field/></label></div><label>{t.contactPage.problem}<textarea name="problem" rows={3} data-brief-field></textarea></label></div>
        <button className="ox-button" type="button" data-download-brief disabled>{t.contactPage.download}<Icon name="arrow-down" size={20}/></button><p className="download-status" role="status" data-download-status></p><noscript><p className="ox-alert">{l.noScript}</p></noscript>
      </section>
    </div>
  </main><SiteFooter locale={locale} page="contact"/>
    </BaseLayout>
    </>);
}
