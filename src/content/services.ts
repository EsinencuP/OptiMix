import { pathFor, type Locale } from './index';
import { homeRedesign } from './home-redesign';
import type { CatalogSlug } from './portfolio-catalog';

export const serviceSlugs = ['hr','documents','crm','erp','procurement','analytics'] as const;
export type ServiceSlug = typeof serviceSlugs[number];

/** Service scope describes the work we discuss, not undocumented product features. */
export function servicesFor(locale: Locale) {
  const s = (ru: string, en: string, ro: string) => ({ru,en,ro})[locale];
  const processes = [
    [s('Приём и адаптация сотрудников','Hiring and onboarding','Recrutare și integrare'),s('Внутренние запросы команды','Internal team requests','Cereri interne ale echipei'),s('Ответственные и статусы задач','Task owners and statuses','Responsabili și stările sarcinilor')],
    [s('Подготовка и правки документов','Document preparation and editing','Pregătirea și editarea documentelor'),s('Маршруты проверки и согласования','Review and approval routes','Trasee de verificare și aprobare'),s('Передача документов между участниками','Document handoffs','Transmiterea documentelor între participanți')],
    [s('Контакты и компании','Contacts and companies','Contacte și companii'),s('Воронка и этапы сделок','Pipeline and deal stages','Fluxul și etapele tranzacțiilor'),s('Задачи и следующие действия','Activities and next actions','Sarcini și acțiunile următoare')],
    [s('Склад и движение запасов','Inventory and stock movements','Stocuri și mișcări de inventar'),s('Финансовые операции','Financial operations','Operațiuni financiare'),s('Связь продаж, проектов и команды','Connecting sales, projects and teams','Conectarea vânzărilor, proiectelor și echipei')],
    [s('Остатки и потребность в пополнении','Stock levels and replenishment needs','Stocuri și necesarul de reaprovizionare'),s('История операций и качество данных','Operational history and data quality','Istoricul operațiunilor și calitatea datelor'),s('План закупок с учётом ограничений','Procurement plans and constraints','Planuri de achiziții și constrângeri')],
    [s('Показатели воронки продаж','Sales pipeline metrics','Indicatorii fluxului de vânzări'),s('Общие отчёты для команды','Shared team reports','Rapoarte comune pentru echipă'),s('Контроль статусов и ответственных','Status and ownership oversight','Controlul stărilor și responsabililor')],
  ];
  const exampleNotes = [
    s('Recruiting Workspace — проект портфолио по рекрутингу. Карточка проекта уже доступна, подробное описание готовится.','Recruiting Workspace is our recruiting portfolio project. Its project page is available, and a detailed overview is coming soon.','Recruiting Workspace este proiectul nostru de recrutare. Pagina proiectului este disponibilă, iar prezentarea detaliată este în pregătire.'),
    s('AI PDF Editor показывает редактирование текста и изображений PDF с проверкой изменений. Это пример работы с документом; маршруты согласования обсуждаются отдельно.','AI PDF Editor demonstrates PDF text and image editing with change review. It illustrates document work; approval routes are scoped separately.','AI PDF Editor demonstrează editarea textului și imaginilor PDF cu verificarea modificărilor. Traseele de aprobare se discută separat.'),
    s('CRM Portfolio объединяет контакты, компании, сделки и задачи. В обзоре можно изучить воронку и модули продукта.','CRM Portfolio brings together contacts, companies, deals and activities. Explore its pipeline and modules in the project overview.','CRM Portfolio reunește contacte, companii, tranzacții și activități. Explorează fluxul și modulele în prezentarea proiectului.'),
    s('Evo ERP объединяет Dashboard, Finance, Inventory, CRM, HR и Projects. В обзоре показаны связи операционных модулей.','Evo ERP brings together Dashboard, Finance, Inventory, CRM, HR and Projects. Its overview shows how the operational modules connect.','Evo ERP reunește Dashboard, Finance, Inventory, CRM, HR și Projects. Prezentarea arată legăturile dintre modulele operaționale.'),
    s('В Evo ERP можно изучить складской и финансовый контекст. Прогнозирование и автоматический план закупок не заявлены как готовые функции этого демо.','Evo ERP illustrates inventory and financial context. Forecasting and automatic procurement planning are not claimed as existing demo features.','Evo ERP ilustrează contextul stocurilor și finanțelor. Prognoza și planificarea automată a achizițiilor nu sunt prezentate ca funcții existente ale demonstrației.'),
    s('В CRM Portfolio есть аналитика продаж. Это пример отчётности по данным CRM, а состав показателей для вашей команды определим по задаче.','CRM Portfolio includes sales analytics. It illustrates reporting on CRM data; your team’s metrics are defined around the task.','CRM Portfolio include analiza vânzărilor. Este un exemplu de raportare pe date CRM; indicatorii echipei se definesc în funcție de sarcină.'),
  ];
  const projects: CatalogSlug[] = ['recruiting','pdf-editor','crm','erp','erp','crm'];
  return homeRedesign(locale).services.map((service,index) => ({...service,slug:serviceSlugs[index],href:pathFor(locale,'service',serviceSlugs[index]),processes:processes[index],project:projects[index],exampleNote:exampleNotes[index]}));
}

export function serviceUI(locale: Locale) {
  const s=(ru:string,en:string,ro:string)=>({ru,en,ro})[locale];
  return { label:s('Направления','Services','Direcții'), processes:s('Какие процессы автоматизируем','Processes we automate','Procese pe care le automatizăm'), scope:s('Начинаем с разбора текущей работы. Ниже — возможный состав задачи, который уточним вместе.','We start by reviewing how the work happens today. The scope below is refined together.','Începem cu analiza modului actual de lucru. Clarificăm împreună domeniul de mai jos.'), example:s('Пример из портфолио','A project from our portfolio','Un proiect din portofoliu'), open:s('Открыть проект','Open project','Deschide proiectul'), work:s('Как проходит работа','How we work','Cum lucrăm'), related:s('Другие направления','Other services','Alte direcții'), cta:s('Обсудим ваш процесс','Let’s discuss your process','Să discutăm procesul tău') };
}
