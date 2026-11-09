import type { Locale } from './index';
import { catalogLinks } from './portfolio-catalog';

export const portfolioPageSlugs = ['crm', 'erp'] as const;
export type PortfolioPageSlug = typeof portfolioPageSlugs[number];

interface PortfolioPageCopy {
  metaTitle: string;
  description: string;
  title: string;
  intro: string;
}

interface PortfolioPagesCopy {
  eyebrow: string;
  openDemo: string;
  github: string;
  back: string;
  projects: Record<PortfolioPageSlug, PortfolioPageCopy>;
}

export const portfolioPageLinks: Record<PortfolioPageSlug, { demo: string; github: string }> = { crm: catalogLinks.crm, erp: catalogLinks.erp };

export const portfolioPages: Record<Locale, PortfolioPagesCopy> = {
  en: {
    eyebrow: 'OptiMix portfolio',
    openDemo: 'Open demo',
    github: 'GitHub',
    back: 'All demo projects',
    projects: {
      crm: {
        metaTitle: 'CRM Platform — OptiMix Portfolio',
        description: 'Explore a CRM platform for contacts, deals and sales workflows. Open the demo or browse the source code on GitHub.',
        title: 'CRM Portfolio',
        intro: 'Contacts, deals and sales workflows in one workspace.',
      },
      erp: {
        metaTitle: 'ERP System — OptiMix Portfolio',
        description: 'Explore Evo ERP for finance, inventory and team operations. Open the demo or browse the source code on GitHub.',
        title: 'Evo ERP',
        intro: 'Finance, inventory and team operations in one system.',
      },
    },
  },
  ru: {
    eyebrow: 'Портфолио OptiMix',
    openDemo: 'Открыть демо',
    github: 'GitHub',
    back: 'Все демо-проекты',
    projects: {
      crm: {
        metaTitle: 'CRM-платформа — Портфолио OptiMix',
        description: 'CRM-платформа для контактов, сделок и процессов продаж. Откройте демо или изучите исходный код на GitHub.',
        title: 'CRM Portfolio',
        intro: 'Контакты, сделки и процессы продаж в одном рабочем пространстве.',
      },
      erp: {
        metaTitle: 'ERP-система — Портфолио OptiMix',
        description: 'Evo ERP для финансов, склада и работы команды. Откройте демо или изучите исходный код на GitHub.',
        title: 'Evo ERP',
        intro: 'Финансы, склад и работа команды в одной системе.',
      },
    },
  },
  ro: {
    eyebrow: 'Portofoliu OptiMix',
    openDemo: 'Deschide demonstrația',
    github: 'GitHub',
    back: 'Toate proiectele demo',
    projects: {
      crm: {
        metaTitle: 'Platformă CRM — Portofoliu OptiMix',
        description: 'O platformă CRM pentru contacte, tranzacții și procese de vânzări. Deschide demonstrația sau consultă codul sursă pe GitHub.',
        title: 'CRM Portfolio',
        intro: 'Contacte, tranzacții și procese de vânzări într-un singur spațiu de lucru.',
      },
      erp: {
        metaTitle: 'Sistem ERP — Portofoliu OptiMix',
        description: 'Evo ERP pentru finanțe, stocuri și activitatea echipei. Deschide demonstrația sau consultă codul sursă pe GitHub.',
        title: 'Evo ERP',
        intro: 'Finanțe, stocuri și activitatea echipei într-un singur sistem.',
      },
    },
  },
};

export interface PortfolioFeature {
  title: string;
  description: string;
  icon: 'table' | 'address-book' | 'files' | 'gear' | 'sparkles' | 'chart-line-up';
}

interface CrmPageCopy {
  heroAccent: string;
  technologyLabel: string;
  featuresEyebrow: string;
  featuresTitle: string;
  featuresIntro: string;
  preview: {
    label: string;
    title: string;
    caption: string;
    stages: [string, string, string];
    deals: [string[], string[], string[]];
    owner: string;
  };
  features: PortfolioFeature[];
}

export const crmTechnologies = ['Next.js', 'Prisma', 'PostgreSQL', 'AI'] as const;

export const erpTechnologies = ['Next.js', 'PostgreSQL', 'Docker', 'Prisma'] as const;
export const erpModuleIds = ['dashboard', 'finance', 'inventory', 'crm', 'hr', 'projects', 'settings'] as const;
export type ErpModuleId = typeof erpModuleIds[number];
export interface ErpModuleCopy { title: string; description: string; features: string[] }
export const erpModuleIcons: Record<ErpModuleId, string> = {
  dashboard: 'chart-bar', finance: 'file-text', inventory: 'database', crm: 'address-book',
  hr: 'users', projects: 'files', settings: 'gear',
};
interface ErpSupplementCopy {
  eyebrow: string; title: string; intro: string;
  modules: Record<ErpModuleId, ErpModuleCopy>;
  cta: { eyebrow: string; title: string; intro: string };
}
function erpModulesCopy(locale: Locale): ErpSupplementCopy {
  const s=(ru:string,en:string,ro:string)=>({ru,en,ro})[locale];
  return {
    eyebrow:s('Внутри Evo ERP','Inside Evo ERP','În Evo ERP'),
    title:s('Семь модулей для ежедневной работы.','Seven modules for everyday operations.','Șapte module pentru activitatea zilnică.'),
    intro:s('Обзор бизнеса, продажи, финансы, склад, персонал, проекты и настройки — в одном рабочем пространстве.','Business overview, sales, finance, inventory, HR, projects and settings in one workspace.','Privire de ansamblu, vânzări, finanțe, stocuri, HR, proiecte și setări într-un spațiu comun.'),
    modules:{
      dashboard:{title:s('Дашборд','Dashboard','Tablou de bord'),description:s('Поступления, открытые сделки, складские предупреждения и заявки на отпуск.','Receipts, open deals, stock alerts and leave requests.','Încasări, tranzacții deschise, alerte de stoc și cereri de concediu.'),features:[s('Поступления за шесть месяцев','Six-month receipt chart','Graficul încasărilor pe șase luni'),s('Последние счета','Recent invoices','Facturi recente'),s('Лента действий','Activity feed','Flux de activitate')]},
      finance:{title:s('Финансы','Finance','Finanțe'),description:s('Счета, оплаты и расходы с финансовыми отчётами.','Invoices, payments and expenses with financial reports.','Facturi, plăți și cheltuieli cu rapoarte financiare.'),features:[s('Счета в PDF','PDF invoices','Facturi PDF'),s('Частичные оплаты','Partial payments','Plăți parțiale'),s('Расходы и P&L','Expenses and P&L','Cheltuieli și P&L')]},
      inventory:{title:s('Склад','Inventory','Stocuri'),description:s('Товары, склады, остатки и история движений.','Products, warehouses, balances and movement history.','Produse, depozite, solduri și istoricul mișcărilor.'),features:[s('Каталог и предупреждения','Catalogue and stock alerts','Catalog și alerte de stoc'),s('Приход, расход, корректировка','Receipts, issues and adjustments','Intrări, ieșiri și ajustări'),s('Перемещения между складами','Warehouse transfers','Transferuri între depozite')]},
      crm:{title:'CRM',description:s('Контакты, воронка продаж и история общения.','Contacts, deal pipeline and communication history.','Contacte, flux de vânzări și istoricul comunicării.'),features:[s('Контакты и сделки','Contacts and deals','Contacte și tranzacții'),s('Воронка по этапам','Pipeline stages','Etapele vânzărilor'),s('Заметки и активности','Notes and activities','Note și activități')]},
      hr:{title:s('Персонал','HR','Resurse umane'),description:s('Каталог сотрудников, организационная структура и отпуска.','Employee directory, organisation chart and leave requests.','Catalogul angajaților, organigramă și cereri de concediu.'),features:[s('Карточки сотрудников','Employee profiles','Profiluri de angajați'),s('Структура подчинения','Reporting structure','Structura de subordonare'),s('Заявки на отпуск','Leave requests','Cereri de concediu')]},
      projects:{title:s('Проекты','Projects','Proiecte'),description:s('Задачи, сроки, команда и бюджет проекта.','Tasks, dates, team and project budget.','Sarcini, termene, echipă și bugetul proiectului.'),features:[s('Kanban и список','Kanban and list','Kanban și listă'),s('Исполнители и сроки','Assignees and due dates','Responsabili și termene'),s('Прогресс и связанные расходы','Progress and linked expenses','Progres și cheltuieli asociate')]},
      settings:{title:s('Настройки','Settings','Setări'),description:s('Параметры компании, участники, права и журнал аудита.','Company settings, members, access and audit log.','Setările companiei, membri, acces și jurnal de audit.'),features:[s('Пять ролей доступа','Five access roles','Cinci roluri de acces'),s('Приглашения в пространство','Workspace invitations','Invitații în spațiu'),s('История изменений','Change history','Istoricul modificărilor')]},
    },
    cta:{eyebrow:s('Знакомство с системой','Explore the system','Explorează sistemul'),title:s('Попробуйте Evo ERP в работе.','Try Evo ERP in action.','Încearcă Evo ERP în acțiune.'),intro:s('Откройте учебное пространство или изучите реализацию на GitHub.','Open the sample workspace or explore the implementation on GitHub.','Deschide spațiul demonstrativ sau explorează implementarea pe GitHub.')},
  };
}
export const erpSupplementContent: Record<Locale, ErpSupplementCopy> = {en:erpModulesCopy('en'),ru:erpModulesCopy('ru'),ro:erpModulesCopy('ro')};
export const erpHubModuleIds = ['finance', 'inventory', 'crm', 'team', 'projects', 'dashboard'] as const;
export type ErpHubModuleId = typeof erpHubModuleIds[number];
export const erpHubIcons: Record<ErpHubModuleId, string> = {
  finance: 'file-text', inventory: 'database', crm: 'address-book', team: 'users', projects: 'files', dashboard: 'chart-bar',
};
interface ErpPageCopy {
  heroAccent: string; technologyLabel: string; previewLabel: string; previewTitle: string; previewCaption: string;
  previewRows: [string, string, string];
  hub: {
    eyebrow: string; title: string; intro: string; diagramLabel: string; detailsTitle: string;
    hint: string; pause: string; play: string;
    modules: Record<ErpHubModuleId, { title: string; summary: string; features: string[] }>;
  };
}
export const erpPageContent: Record<Locale, ErpPageCopy> = {
  en: {
    heroAccent: 'Your operations, connected.', technologyLabel: 'Technology stack',
    previewLabel: 'Illustrative ERP interface', previewTitle: 'Operations overview',
    previewCaption: 'Illustrative interface. Explore the working system in the demo.',
    previewRows: ['Invoices & payments', 'Stock movements', 'Roles & workspaces'],
    hub: {
      eyebrow: 'ERP architecture', title: 'Six perspectives. One shared core.',
      intro: 'Explore how modules connect around ERP Core. Hover for context or choose a module to open its details.',
      diagramLabel: 'Illustrative hub-and-spoke diagram of six ERP modules', detailsTitle: 'Explore each module',
      hint: 'Choose a node above or open a module below.', pause: 'Pause data flow', play: 'Resume data flow',
      modules: {
        finance: { title: 'Finance', summary: 'Invoices, payments and document history in one operational context.', features: ['Numbered invoices and PDF documents', 'Partial payments', 'Document archive'] },
        inventory: { title: 'Inventory', summary: 'Products, warehouses and stock movements connected to operations.', features: ['SKU and categories', 'Multiple warehouses and IN / OUT / TRANSFER movements', 'Low-stock alerts'] },
        crm: { title: 'CRM', summary: 'A sales pipeline with filters and export for customer-facing work.', features: ['Drag-and-drop Kanban', 'Table filters', 'CSV export'] },
        team: { title: 'Team', summary: 'Workspace membership and roles define who works with shared data.', features: ['Five roles', 'Workspace isolation', 'Team invitations'] },
        projects: { title: 'Projects', summary: 'Project tasks, deadlines, team and budget in one workspace.', features: ['Kanban and task list', 'Assignees and deadlines', 'Progress and linked expenses'] },
        dashboard: { title: 'Dashboard', summary: 'A view of revenue, receivables and financial reporting.', features: ['Revenue KPIs', 'Accounts-receivable ageing and P&L charts', 'CSV export'] },
      },
    },
  },
  ru: {
    heroAccent: 'Операции связаны между собой.', technologyLabel: 'Технологии проекта',
    previewLabel: 'Иллюстративный интерфейс ERP', previewTitle: 'Обзор операций',
    previewCaption: 'Иллюстративный интерфейс. Рабочая система доступна в демо.',
    previewRows: ['Счета и платежи', 'Движения товаров', 'Роли и рабочие пространства'],
    hub: {
      eyebrow: 'Архитектура ERP', title: 'Шесть направлений. Единое ядро.',
      intro: 'Посмотрите, как модули связаны с ERP Core. Наведите на узел для подсказки или выберите его, чтобы открыть подробности.',
      diagramLabel: 'Иллюстративная схема шести модулей вокруг ядра ERP', detailsTitle: 'Подробнее о каждом модуле',
      hint: 'Выберите узел на схеме или откройте модуль ниже.', pause: 'Приостановить поток данных', play: 'Продолжить поток данных',
      modules: {
        finance: { title: 'Финансы', summary: 'Счета, платежи и история документов в общем контексте операций.', features: ['Нумерация счетов и PDF-документы', 'Частичные платежи', 'Архив документов'] },
        inventory: { title: 'Склад', summary: 'Товары, склады и движения запасов связаны с операционной работой.', features: ['SKU и категории', 'Несколько складов и движения IN / OUT / TRANSFER', 'Уведомления о низких остатках'] },
        crm: { title: 'CRM', summary: 'Воронка продаж с фильтрами и экспортом для работы с клиентами.', features: ['Kanban с перетаскиванием', 'Фильтры таблицы', 'Экспорт CSV'] },
        team: { title: 'Команда', summary: 'Участники рабочих пространств и роли определяют доступ к общим данным.', features: ['Пять ролей', 'Изоляция рабочих пространств', 'Приглашения в команду'] },
        projects: { title: 'Проекты', summary: 'Задачи, сроки, команда и бюджет проекта в одном пространстве.', features: ['Kanban и список задач', 'Исполнители и сроки', 'Прогресс и связанные расходы'] },
        dashboard: { title: 'Дашборд', summary: 'Обзор выручки, дебиторской задолженности и финансовых отчётов.', features: ['KPI выручки', 'Сроки дебиторской задолженности и графики P&L', 'Экспорт CSV'] },
      },
    },
  },
  ro: {
    heroAccent: 'Operațiunile tale, conectate.', technologyLabel: 'Tehnologiile proiectului',
    previewLabel: 'Interfață ERP ilustrativă', previewTitle: 'Privire de ansamblu',
    previewCaption: 'Interfață ilustrativă. Explorează sistemul funcțional în demonstrație.',
    previewRows: ['Facturi și plăți', 'Mișcări de stoc', 'Roluri și spații de lucru'],
    hub: {
      eyebrow: 'Arhitectură ERP', title: 'Șase perspective. Un nucleu comun.',
      intro: 'Explorează legăturile dintre module și ERP Core. Treci peste un nod pentru context sau selectează-l pentru detalii.',
      diagramLabel: 'Schemă ilustrativă cu șase module în jurul nucleului ERP', detailsTitle: 'Explorează fiecare modul',
      hint: 'Alege un nod din schemă sau deschide un modul mai jos.', pause: 'Oprește fluxul de date', play: 'Continuă fluxul de date',
      modules: {
        finance: { title: 'Finanțe', summary: 'Facturi, plăți și istoricul documentelor într-un context operațional comun.', features: ['Facturi numerotate și documente PDF', 'Plăți parțiale', 'Arhiva documentelor'] },
        inventory: { title: 'Stocuri', summary: 'Produsele, depozitele și mișcările de stoc sunt conectate la operațiuni.', features: ['SKU și categorii', 'Mai multe depozite și mișcări IN / OUT / TRANSFER', 'Alerte pentru stoc redus'] },
        crm: { title: 'CRM', summary: 'Un flux de vânzări cu filtre și export pentru lucrul cu clienții.', features: ['Kanban drag-and-drop', 'Filtre pentru tabel', 'Export CSV'] },
        team: { title: 'Echipă', summary: 'Membrii spațiilor de lucru și rolurile stabilesc accesul la datele comune.', features: ['Cinci roluri', 'Izolarea spațiilor de lucru', 'Invitații pentru echipă'] },
        projects: { title: 'Proiecte', summary: 'Sarcini, termene, echipă și buget într-un spațiu comun.', features: ['Kanban și listă de sarcini', 'Responsabili și termene', 'Progres și cheltuieli asociate'] },
        dashboard: { title: 'Tablou de bord', summary: 'O vedere asupra veniturilor, creanțelor și rapoartelor financiare.', features: ['Indicatori de venituri', 'Vechimea creanțelor și grafice P&L', 'Export CSV'] },
      },
    },
  },
};


interface CrmSupplementCopy {
  modules: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; description: string; icon: 'file-text' | 'phone' | 'eye' | 'users' | 'clock' | 'shield' }[];
  };
  cta: { eyebrow: string; title: string; intro: string };
}

export const crmSupplementContent: Record<Locale, CrmSupplementCopy> = {
  en: {
    modules: {
      eyebrow: 'Additional modules', title: 'The tools around your daily sales work.',
      intro: 'Capture enquiries, stay in touch and keep access and changes under control.',
      items: [
        { icon: 'file-text', title: 'Lead Capture Forms', description: 'Collect enquiries through forms and bring the submitted details into your CRM.' },
        { icon: 'phone', title: 'Telephony Click-to-Call', description: 'Start a call from a contact record without entering the number manually.' },
        { icon: 'eye', title: 'Email Tracking', description: 'Track email opens and keep communication history alongside the contact.' },
        { icon: 'users', title: 'Multi-Workspace', description: 'Separate teams and their data into individual workspaces.' },
        { icon: 'clock', title: 'Audit Log', description: 'Review the history of actions and changes made in the CRM.' },
        { icon: 'shield', title: 'Role-Based Access', description: 'Assign roles and define who can access sections and perform actions.' },
      ],
    },
    cta: { eyebrow: 'Explore the demo', title: 'Try the CRM in action.', intro: 'Explore the pipeline, contacts and workflows in the demo, or browse the source code.' },
  },
  ru: {
    modules: {
      eyebrow: 'Дополнительные модули', title: 'Инструменты для ежедневной работы с клиентами.',
      intro: 'Собирайте заявки, поддерживайте связь и контролируйте доступ и изменения.',
      items: [
        { icon: 'file-text', title: 'Формы захвата лидов', description: 'Собирайте обращения через формы и передавайте данные заявки в CRM.' },
        { icon: 'phone', title: 'Звонок в один клик', description: 'Начинайте звонок из карточки контакта без ручного набора номера.' },
        { icon: 'eye', title: 'Отслеживание писем', description: 'Отслеживайте открытия писем и храните историю общения рядом с контактом.' },
        { icon: 'users', title: 'Рабочие пространства', description: 'Разделяйте команды и их данные по отдельным рабочим пространствам.' },
        { icon: 'clock', title: 'Журнал действий', description: 'Просматривайте историю действий и изменений, сделанных в CRM.' },
        { icon: 'shield', title: 'Доступ по ролям', description: 'Назначайте роли и определяйте доступ к разделам и действиям.' },
      ],
    },
    cta: { eyebrow: 'Знакомство с демо', title: 'Попробуйте CRM в деле.', intro: 'Изучите воронку, контакты и процессы в демо или откройте исходный код проекта.' },
  },
  ro: {
    modules: {
      eyebrow: 'Module suplimentare', title: 'Instrumente pentru lucrul zilnic cu clienții.',
      intro: 'Colectează cereri, păstrează legătura și controlează accesul și modificările.',
      items: [
        { icon: 'file-text', title: 'Formulare pentru leaduri', description: 'Colectează cereri prin formulare și transferă datele trimise în CRM.' },
        { icon: 'phone', title: 'Apel cu un singur clic', description: 'Inițiază un apel din fișa contactului, fără a introduce manual numărul.' },
        { icon: 'eye', title: 'Urmărirea emailurilor', description: 'Urmărește deschiderile emailurilor și păstrează istoricul comunicării lângă contact.' },
        { icon: 'users', title: 'Spații de lucru', description: 'Separă echipele și datele lor în spații de lucru individuale.' },
        { icon: 'clock', title: 'Jurnal de audit', description: 'Consultă istoricul acțiunilor și al modificărilor efectuate în CRM.' },
        { icon: 'shield', title: 'Acces pe bază de roluri', description: 'Atribuie roluri și stabilește accesul la secțiuni și acțiuni.' },
      ],
    },
    cta: { eyebrow: 'Explorează demonstrația', title: 'Încearcă CRM în acțiune.', intro: 'Explorează fluxul, contactele și procesele în demonstrație sau consultă codul sursă.' },
  },
};

interface CrmWorkflowCopy {
  eyebrow: string;
  title: string;
  intro: string;
  tabLabel: string;
  pause: string;
  play: string;
  autoHint: string;
  reducedHint: string;
  noScript: string;
  steps: { title: string; heading: string; description: string; icon: string }[];
}

export const crmWorkflowContent: Record<Locale, CrmWorkflowCopy> = {
  en: {
    eyebrow: 'CRM workflow', title: 'From first enquiry to a clear next step.',
    intro: 'Follow a lead through five connected stages. Choose a stage to see what happens there.',
    tabLabel: 'CRM workflow stages', pause: 'Pause autoplay', play: 'Resume autoplay',
    autoHint: 'The next stage opens every 4 seconds.', reducedHint: 'Reduced motion is on. Choose stages manually.',
    noScript: 'JavaScript is off. All five stage descriptions are available below.',
    steps: [
      { title: 'Lead', heading: 'Capture the first enquiry', description: 'Record a new enquiry and its source. Give the sales team one starting point for the next conversation.', icon: 'file-text' },
      { title: 'Contact', heading: 'Keep customer context together', description: 'Connect the contact and company with notes, tasks and conversation history, so the next person has the same context.', icon: 'address-book' },
      { title: 'Deal', heading: 'Move the opportunity forward', description: 'Create a deal, assign its owner and move it through the Kanban pipeline. Keep its stage and next action visible.', icon: 'table' },
      { title: 'Automation', heading: 'Follow up on the right event', description: 'Use event triggers and conditions to create tasks, prepare emails or call a webhook as the deal moves forward.', icon: 'gear' },
      { title: 'Analytics', heading: 'Review the sales pipeline', description: 'Bring deal stages and sales KPIs into reports. Use the pipeline and weighted forecast to plan the next action.', icon: 'chart-line-up' },
    ],
  },
  ru: {
    eyebrow: 'Как работает CRM', title: 'От первой заявки к следующему шагу.',
    intro: 'Пять связанных этапов работы с клиентом. Выберите этап, чтобы увидеть его роль в процессе.',
    tabLabel: 'Этапы CRM-процесса', pause: 'Приостановить показ', play: 'Продолжить показ',
    autoHint: 'Следующий этап открывается каждые 4 секунды.', reducedHint: 'Уменьшение движения включено. Выбирайте этапы вручную.',
    noScript: 'JavaScript отключён. Ниже доступны описания всех пяти этапов.',
    steps: [
      { title: 'Лид', heading: 'Зафиксируйте первую заявку', description: 'Сохраните новое обращение и его источник. У отдела продаж появится единая отправная точка для следующего разговора.', icon: 'file-text' },
      { title: 'Контакт', heading: 'Соберите контекст клиента', description: 'Свяжите контакт и компанию с заметками, задачами и историей переписки, чтобы передавать коллегам полный контекст.', icon: 'address-book' },
      { title: 'Сделка', heading: 'Продвигайте возможность по воронке', description: 'Создайте сделку, назначьте ответственного и перемещайте её по Kanban-воронке. Этап и следующее действие остаются на виду.', icon: 'table' },
      { title: 'Автоматизация', heading: 'Запускайте действия по событиям', description: 'Используйте события и условия для создания задач, подготовки писем или вызова webhook при продвижении сделки.', icon: 'gear' },
      { title: 'Аналитика', heading: 'Оцените состояние продаж', description: 'Соберите этапы сделок и KPI продаж в отчётах. Используйте воронку и взвешенный прогноз для планирования следующих действий.', icon: 'chart-line-up' },
    ],
  },
  ro: {
    eyebrow: 'Cum funcționează CRM', title: 'De la prima cerere la următorul pas.',
    intro: 'Cinci etape conectate în relația cu clientul. Alege o etapă pentru a vedea rolul ei în proces.',
    tabLabel: 'Etapele procesului CRM', pause: 'Oprește redarea', play: 'Continuă redarea',
    autoHint: 'Următoarea etapă se deschide la fiecare 4 secunde.', reducedHint: 'Mișcarea redusă este activă. Alege etapele manual.',
    noScript: 'JavaScript este dezactivat. Descrierile celor cinci etape sunt disponibile mai jos.',
    steps: [
      { title: 'Lead', heading: 'Înregistrează prima cerere', description: 'Salvează o cerere nouă și sursa ei. Echipa de vânzări are astfel un punct de pornire comun pentru următoarea conversație.', icon: 'file-text' },
      { title: 'Contact', heading: 'Păstrează contextul clientului', description: 'Conectează persoana și compania cu note, sarcini și istoricul conversațiilor, astfel încât colegii să aibă același context.', icon: 'address-book' },
      { title: 'Tranzacție', heading: 'Avansează oportunitatea', description: 'Creează o tranzacție, atribuie un responsabil și mut-o prin fluxul Kanban. Etapa și următoarea acțiune rămân vizibile.', icon: 'table' },
      { title: 'Automatizare', heading: 'Lansează acțiuni pe bază de evenimente', description: 'Folosește evenimente și condiții pentru a crea sarcini, a pregăti emailuri sau a apela un webhook pe parcursul tranzacției.', icon: 'gear' },
      { title: 'Analiză', heading: 'Evaluează situația vânzărilor', description: 'Reunește etapele tranzacțiilor și indicatorii de vânzări în rapoarte. Folosește fluxul și prognoza ponderată pentru a planifica următoarea acțiune.', icon: 'chart-line-up' },
    ],
  },
};

export const crmPageContent: Record<Locale, CrmPageCopy> = {
  en: {
    heroAccent: 'Every deal in view.',
    technologyLabel: 'Technology stack',
    featuresEyebrow: 'CRM capabilities',
    featuresTitle: 'One workspace for the whole sales cycle.',
    featuresIntro: 'Keep customer context, conversations and the next action connected at every stage.',
    preview: {
      label: 'Illustrative CRM preview',
      title: 'Deal pipeline',
      caption: 'Illustrative data. Explore the working interface in the demo.',
      stages: ['New leads', 'In progress', 'Proposal'],
      deals: [['Website enquiry', 'Product demo'], ['Process audit'], ['CRM integration']],
      owner: 'Sales team',
    },
    features: [
      { icon: 'table', title: 'Deal Pipeline', description: 'Move deals through a drag-and-drop Kanban pipeline. Track stages and a weighted sales forecast.' },
      { icon: 'address-book', title: 'Contacts & Companies', description: 'Keep timelines, notes, tasks and call history together in complete contact and company records.' },
      { icon: 'files', title: 'Unified Inbox', description: 'Bring WhatsApp, Telegram and email conversations into one interface with a shared chat history.' },
      { icon: 'gear', title: 'Workflow Engine', description: 'Automate follow-ups with event triggers and 10+ step types, including conditions, emails, tasks and webhooks.' },
      { icon: 'sparkles', title: 'AI Assistance', description: 'Prepare contact briefs, score deals and draft emails with OpenAI assistance.' },
      { icon: 'chart-line-up', title: 'Analytics & Reports', description: 'Review sales KPIs, pipeline charts and reports with Recharts visualizations.' },
    ],
  },
  ru: {
    heroAccent: 'Каждая сделка на виду.',
    technologyLabel: 'Технологии проекта',
    featuresEyebrow: 'Возможности CRM',
    featuresTitle: 'Весь цикл продаж в одном рабочем пространстве.',
    featuresIntro: 'Контекст клиента, переписка и следующий шаг связаны на каждом этапе.',
    preview: {
      label: 'Иллюстративный макет CRM',
      title: 'Воронка сделок',
      caption: 'Иллюстративные данные. Рабочий интерфейс доступен в демо.',
      stages: ['Новые лиды', 'В работе', 'Предложение'],
      deals: [['Заявка с сайта', 'Демо продукта'], ['Аудит процесса'], ['Внедрение CRM']],
      owner: 'Отдел продаж',
    },
    features: [
      { icon: 'table', title: 'Воронка сделок', description: 'Kanban с перетаскиванием сделок между этапами и взвешенным прогнозом продаж.' },
      { icon: 'address-book', title: 'Контакты и компании', description: 'Полные карточки с хронологией событий, заметками, задачами и историей звонков.' },
      { icon: 'files', title: 'Единый inbox', description: 'WhatsApp, Telegram и email в одном интерфейсе с общей историей переписки.' },
      { icon: 'gear', title: 'Автоматизация процессов', description: 'Запуск по событиям и более 10 типов шагов: условия, письма, задачи и webhooks.' },
      { icon: 'sparkles', title: 'AI-помощник', description: 'Подготовка брифа по контакту, оценка сделок и черновики писем с помощью OpenAI.' },
      { icon: 'chart-line-up', title: 'Аналитика и отчёты', description: 'KPI продаж, графики воронки и отчёты с визуализациями Recharts.' },
    ],
  },
  ro: {
    heroAccent: 'Fiecare tranzacție, la vedere.',
    technologyLabel: 'Tehnologiile proiectului',
    featuresEyebrow: 'Funcționalități CRM',
    featuresTitle: 'Întregul ciclu de vânzări într-un singur spațiu.',
    featuresIntro: 'Contextul clientului, conversațiile și pasul următor rămân conectate în fiecare etapă.',
    preview: {
      label: 'Machetă ilustrativă CRM',
      title: 'Fluxul tranzacțiilor',
      caption: 'Date ilustrative. Explorează interfața funcțională în demonstrație.',
      stages: ['Leaduri noi', 'În lucru', 'Ofertă'],
      deals: [['Cerere de pe site', 'Demo de produs'], ['Audit de proces'], ['Integrare CRM']],
      owner: 'Echipa de vânzări',
    },
    features: [
      { icon: 'table', title: 'Fluxul tranzacțiilor', description: 'Mută tranzacțiile între etapele unui panou Kanban drag-and-drop și urmărește prognoza ponderată a vânzărilor.' },
      { icon: 'address-book', title: 'Contacte și companii', description: 'Fișe complete cu cronologia evenimentelor, note, sarcini și istoricul apelurilor.' },
      { icon: 'files', title: 'Inbox unificat', description: 'WhatsApp, Telegram și email într-o singură interfață, cu istoricul conversațiilor la îndemână.' },
      { icon: 'gear', title: 'Automatizarea proceselor', description: 'Declanșare pe bază de evenimente și peste 10 tipuri de pași: condiții, emailuri, sarcini și webhooks.' },
      { icon: 'sparkles', title: 'Asistență AI', description: 'Pregătește rezumate de contact, evaluează tranzacții și redactează emailuri cu ajutorul OpenAI.' },
      { icon: 'chart-line-up', title: 'Analiză și rapoarte', description: 'Urmărește indicatorii de vânzări, graficele fluxului și rapoartele cu vizualizări Recharts.' },
    ],
  },
};
