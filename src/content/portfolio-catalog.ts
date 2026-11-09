import { pathFor, type Locale } from './index';

/** Owner's complete portfolio. Keep URLs here; product copy is intentionally local. */
export const catalogSlugs = ['pdf-editor', 'erp', 'commerce', 'founder', 'recruiting', 'crm'] as const;
export type CatalogSlug = typeof catalogSlugs[number];
export const catalogLinks: Record<CatalogSlug, { demo: string; github: string }> = {
  'pdf-editor': { demo:'https://ai-pdf-editor.pages.dev/', github:'https://github.com/academ1cian/ai-pdf-editor' },
  erp: { demo:'https://erp-xi-pink.vercel.app/', github:'https://github.com/EsinencuP/ERP' },
  commerce: { demo:'https://optimix-commerce-northstar.academ1cian.chatgpt.site/#overview', github:'https://github.com/academ1cian/commerce-operations-workspace' },
  founder: { demo:'https://founder-workspace-portfolio.tealrice.chatgpt.site/workspace/', github:'https://github.com/academ1cian/founder-workspace-portfolio' },
  recruiting: { demo:'https://recruiting-workspace-demo.tealrice.chatgpt.site/', github:'https://github.com/academ1cian/recruiting-automation-workspace' },
  crm: { demo:'https://crm-portfolio-omega.vercel.app/', github:'https://github.com/EsinencuP/crm-portfolio' },
};

export interface CatalogProject {
  slug: CatalogSlug;
  name: string;
  fullName: string;
  icon: string;
  category: string;
  headline: string;
  description: string;
  tags: string[];
  draft: boolean;
  features: { title: string; description: string; icon: string }[];
  projectHref: string;
  demo: string;
  github: string;
}

export function portfolioCatalog(locale: Locale): CatalogProject[] {
  const s = (ru: string, en: string, ro: string) => ({ru,en,ro})[locale];
  const products: Omit<CatalogProject,'projectHref'|'demo'|'github'>[] = [
    { slug:'pdf-editor', name:'AI PDF Editor', fullName:'AI PDF Editor', icon:'file-pdf',
      category:s('Документы и AI','Documents & AI','Documente și AI'),
      headline:s('Точные правки. Тот же документ.','Precise edits. The same document.','Modificări precise. Același document.'),
      description:s('Редактирование текста и изображений PDF с просмотром изменений до скачивания. Ручные правки работают локально, AI-предложения подключаются отдельно.','Edit PDF text and images, review changes, then download. Manual editing runs locally; AI proposals are optional.','Editează textul și imaginile PDF, verifică modificările, apoi descarcă. Editarea manuală este locală; propunerile AI sunt opționale.'),
      tags:['PDF',s('Локальная обработка','Local processing','Procesare locală'),s('Проверка изменений','Change review','Verificarea modificărilor')], draft:false,
      features:[
        {icon:'file-text',title:s('Текст и изображения','Text and images','Text și imagini'),description:s('Поиск и замена текста, выбор отдельных вхождений, пакетные правки и инструменты изображений для поддерживаемых PDF.','Find and replace text, select individual occurrences, batch changes and use image tools in supported PDFs.','Caută și înlocuiește text, selectează aparițiile, aplică modificări în lot și folosește instrumentele pentru imagini în PDF-uri compatibile.')},
        {icon:'eye',title:s('Проверка перед экспортом','Review before export','Verificare înainte de export'),description:s('Сравнение оригинала и результата, подсветка изменений, история и отмена. Скачивается проверенная версия документа.','Compare the original and edited document, inspect highlights, use history and undo, then download the validated version.','Compară originalul cu documentul editat, verifică evidențierile, folosește istoricul și anularea, apoi descarcă versiunea validată.')},
        {icon:'gear',title:s('AI по выбору','Optional AI','AI opțional'),description:s('Запрос на естественном языке превращается в предложение. Облачному провайдеру передаётся только выбранный контекст с согласия пользователя.','A natural-language request becomes a proposal. Only selected context is sent to the cloud provider, with user consent.','O cerere în limbaj natural devine o propunere. Doar contextul selectat este trimis furnizorului cloud, cu acordul utilizatorului.')},
      ] },
    { slug:'erp', name:'Evo ERP', fullName:'Evo ERP', icon:'gear', category:s('ERP и операции','ERP & operations','ERP și operațiuni'),
      headline:s('Операции бизнеса в одной системе.','Business operations in one system.','Operațiunile afacerii într-un singur sistem.'),
      description:s('CRM, финансы, склад, персонал и проекты в рабочем пространстве компании. Роли и доступ помогают организовать совместную работу.','CRM, finance, inventory, HR and projects in a company workspace, with roles and access for the team.','CRM, finanțe, stocuri, resurse umane și proiecte într-un spațiu al companiei, cu roluri și acces pentru echipă.'),
      tags:[s('Финансы','Finance','Finanțe'),s('Склад','Inventory','Stocuri'),s('Команда и проекты','Team & projects','Echipă și proiecte')], draft:false,features:[] },
    { slug:'commerce', name:'Commerce Operations', fullName:'Commerce Operations Workspace', icon:'shopping-cart',
      category:s('Торговые операции','Commerce operations','Operațiuni comerciale'),
      headline:s('Рабочее пространство торговых операций.','A workspace for commerce operations.','Un spațiu pentru operațiuni comerciale.'),
      description:s('Проект в портфолио Optimix. Здесь появится подробный обзор Commerce Operations Workspace.','An Optimix portfolio project. A detailed overview of Commerce Operations Workspace will be added here.','Un proiect din portofoliul Optimix. Aici va fi adăugată prezentarea detaliată a Commerce Operations Workspace.'),
      tags:[s('Торговые операции','Commerce','Comerț'),s('Рабочее пространство','Workspace','Spațiu de lucru')], draft:true,features:[] },
    { slug:'founder', name:'Founder Workspace', fullName:'Founder Workspace', icon:'house',
      category:s('Управление бизнесом','Business management','Managementul afacerii'),
      headline:s('Рабочее пространство основателя.','A founder’s workspace.','Spațiul de lucru al fondatorului.'),
      description:s('Проект в портфолио Optimix. Страница подготовлена для будущего обзора Founder Workspace.','An Optimix portfolio project. This page is prepared for a future overview of Founder Workspace.','Un proiect din portofoliul Optimix. Pagina este pregătită pentru viitoarea prezentare a Founder Workspace.'),
      tags:[s('Основатель','Founder','Fondator'),s('Рабочее пространство','Workspace','Spațiu de lucru')], draft:true,features:[] },
    { slug:'recruiting', name:'Recruiting Workspace', fullName:'Recruiting Automation Workspace', icon:'users',
      category:s('HR и рекрутинг','HR & recruiting','HR și recrutare'),
      headline:s('Рабочее пространство для рекрутинга.','A workspace for recruiting.','Un spațiu pentru recrutare.'),
      description:s('Проект в портфолио Optimix. Подробный обзор Recruiting Automation Workspace будет добавлен на эту страницу.','An Optimix portfolio project. A detailed overview of Recruiting Automation Workspace will be added to this page.','Un proiect din portofoliul Optimix. Prezentarea detaliată a Recruiting Automation Workspace va fi adăugată pe această pagină.'),
      tags:[s('Рекрутинг','Recruiting','Recrutare'),'HR'], draft:true,features:[] },
    { slug:'crm', name:'CRM Portfolio', fullName:'CRM Portfolio', icon:'address-book', category:s('CRM и продажи','CRM & sales','CRM și vânzări'),
      headline:s('Клиенты, сделки и следующие шаги — вместе.','Customers, deals and next steps, together.','Clienți, tranzacții și pașii următori, împreună.'),
      description:s('Контакты и компании, воронка сделок, задачи, аналитика и работа команды. Откройте подробный обзор или перейдите к приложению.','Contacts and companies, a deal pipeline, activities, analytics and teamwork. Explore the project or open the app.','Contacte și companii, un flux de vânzări, activități, analiză și colaborare. Explorează proiectul sau deschide aplicația.'),
      tags:[s('Контакты и компании','Contacts & companies','Contacte și companii'),s('Воронка сделок','Deal pipeline','Flux de vânzări'),s('Аналитика','Analytics','Analiză')], draft:false,features:[] },
  ];
  return products.map(project=>({...project,...catalogLinks[project.slug],projectHref:pathFor(locale,'portfolio',project.slug)}));
}

export function portfolioUI(locale: Locale) {
  const s=(ru:string,en:string,ro:string)=>({ru,en,ro})[locale];
  return {
    eyebrow:s('Портфолио Optimix','Optimix portfolio','Portofoliu Optimix'),
    title:s('Шесть продуктов. Разные задачи бизнеса.','Six products. Different business challenges.','Șase produse. Nevoi diferite ale afacerii.'),
    intro:s('Документы, продажи, операции, управление и рекрутинг — весь текущий состав портфолио.','Documents, sales, operations, management and recruiting — our complete current portfolio.','Documente, vânzări, operațiuni, management și recrutare — întregul portofoliu actual.'),
    open:s('О проекте','Explore project','Despre proiect'), demo:s('Открыть демо','Open demo','Deschide demonstrația'), github:s('Код на GitHub','Code on GitHub','Cod pe GitHub'),
    all:s('Все проекты','All projects','Toate proiectele'), overview:s('Обзор продукта','Product overview','Prezentarea produsului'),
    draft:s('Обзор готовится','Overview coming soon','Prezentare în pregătire'),
    draftNote:s('Эта страница — место для будущего подробного обзора. Уже доступны ссылки на приложение и репозиторий проекта.','This page is reserved for a detailed project overview. Links to the app and repository are already available.','Această pagină este rezervată prezentării detaliate. Linkurile către aplicație și depozitul proiectului sunt deja disponibile.'),
    auth:s('Внешнее демо пока может запрашивать вход.','The external demo may currently require sign-in.','Demonstrația externă poate solicita momentan autentificarea.'),
    next:s('Следующий проект','Next project','Proiectul următor'), previous:s('Предыдущий проект','Previous project','Proiectul anterior'),
    more:s('Другие продукты','More products','Alte produse'),
    capabilities:s('Что умеет продукт','What the product does','Ce poate face produsul'),
    workflow:s('От документа до проверенной правки','From document to validated edit','De la document la modificarea validată'),
    steps:[s('Открыть PDF','Open a PDF','Deschide un PDF'),s('Внести правки','Make changes','Aplică modificările'),s('Проверить и скачать','Review & download','Verifică și descarcă')],
    limits:s('Поддерживаются не все PDF. Сложная вёрстка, защищённые файлы и неподдерживаемые изменения могут быть отклонены; текущий подтверждённый результат сохраняется.','Not every PDF is supported. Complex layouts, protected files and unsupported changes may be rejected while preserving the last validated result.','Nu toate PDF-urile sunt compatibile. Structurile complexe, fișierele protejate și modificările incompatibile pot fi respinse, păstrând ultimul rezultat validat.'),
    screenshot:s('Снимок работающего приложения','Live application capture','Captură din aplicație'),
    ask:s('Обсудим похожую задачу?','Have a similar challenge?','Ai o nevoie similară?'),
    action:s('Описать задачу','Describe your task','Descrie sarcina'),
    count:s('6 продуктов','6 products','6 produse'),
  };
}
