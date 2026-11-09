import { pathFor, type Locale } from './index';
import { homeRedesign } from './home-redesign';

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
  return homeRedesign(locale).services.map((service,index) => ({...service,slug:serviceSlugs[index],href:pathFor(locale,'service',serviceSlugs[index]),processes:processes[index]}));
}

export function serviceUI(locale: Locale) {
  const s=(ru:string,en:string,ro:string)=>({ru,en,ro})[locale];
  return { label:s('Направления','Services','Direcții'), processes:s('Какие процессы автоматизируем','Processes we automate','Procese pe care le automatizăm'), scope:s('Начинаем с разбора текущей работы. Ниже — возможный состав задачи, который уточним вместе.','We start by reviewing how the work happens today. The scope below is refined together.','Începem cu analiza modului actual de lucru. Clarificăm împreună domeniul de mai jos.'), example:s('Пример из портфолио','A project from our portfolio','Un proiect din portofoliu'), open:s('Открыть проект','Open project','Deschide proiectul'), work:s('Как проходит работа','How we work','Cum lucrăm'), related:s('Другие направления','Other services','Alte direcții'), cta:s('Обсудим ваш процесс','Let’s discuss your process','Să discutăm procesul tău') };
}
