import type { Locale } from '../content';
import { portfolioCatalog } from '../content/portfolio-catalog';
import { serviceUI } from '../content/services';
import ScreenshotPlaceholder from './ScreenshotPlaceholder';
import Icon from './Icon';
import SiteLink from './SiteLink';
export default function ProductExamples({ locale }: {
    locale: Locale;
}) {
    const description = { ru: 'Проект портфолио Optimix. Краткий обзор и экран приложения появятся здесь позже.', en: 'An Optimix portfolio project. A short overview and application screen will be added here.', ro: 'Un proiect din portofoliul Optimix. Prezentarea scurtă și ecranul aplicației vor fi adăugate aici.' }[locale];
    const products = portfolioCatalog(locale);
    return <div className="ox-product-examples">{[{ id: 'people-documents', slug: 'pdf-editor' }, { id: 'planning-analytics', slug: 'erp' }].map((example, _index) => {
            const project = products.find(item => item.slug === example.slug)!;
            return <article key={example.id} id={example.id} className="ox-real-example" data-project-placeholder={project.slug}><ScreenshotPlaceholder locale={locale} name={project.name}/><div className="ox-real-copy"><h2 translate="no">{project.name}</h2><p>{description}</p><SiteLink className="ox-text-link" href={project.projectHref}>{serviceUI(locale).open}<Icon name="arrow-right" size={20}/></SiteLink></div></article>;
        })}</div>;
}
