import type {Locale} from './index';
import type {CatalogSlug} from './portfolio-catalog';

/** Public training accounts only. Never populate this registry from .env or real users. */
type DemoRole = 'admin' | 'manager' | 'member' | 'sales' | 'finance' | 'warehouse' | 'projects' | 'analyst';
export interface DemoAccount { role: string; email: string; password: string }
const publicAccounts: Partial<Record<CatalogSlug, {role:DemoRole; email:string; password:string}[]>> = {
  crm: [
    {role:'admin',email:'admin@demo.com',password:'admin123'},
    {role:'manager',email:'manager@demo.com',password:'manager123'},
    {role:'member',email:'member@demo.com',password:'member123'},
  ],
  erp: [
    {role:'admin',email:'admin@erp.dev',password:'Admin123!'},
    {role:'sales',email:'sales@sample.erp.example',password:'Admin123!'},
    {role:'finance',email:'finance@sample.erp.example',password:'Admin123!'},
    {role:'warehouse',email:'warehouse@sample.erp.example',password:'Admin123!'},
    {role:'projects',email:'projects@sample.erp.example',password:'Admin123!'},
    {role:'analyst',email:'analyst@sample.erp.example',password:'Admin123!'},
  ],
};
const roles:Record<Locale,Record<DemoRole,string>> = {
  ru:{admin:'Администратор',manager:'Руководитель',member:'Сотрудник',sales:'Продажи · менеджер',finance:'Финансы · сотрудник',warehouse:'Склад · сотрудник',projects:'Проекты · менеджер',analyst:'Аналитик · просмотр'},
  en:{admin:'Administrator',manager:'Manager',member:'Member',sales:'Sales · manager',finance:'Finance · agent',warehouse:'Inventory · agent',projects:'Projects · manager',analyst:'Analyst · read-only'},
  ro:{admin:'Administrator',manager:'Manager',member:'Membru',sales:'Vânzări · manager',finance:'Finanțe · operator',warehouse:'Stocuri · operator',projects:'Proiecte · manager',analyst:'Analist · doar citire'},
};
const accessModes:Record<CatalogSlug,'accounts'|'none'|'chatgpt'> = {
  'pdf-editor':'none',erp:'accounts',commerce:'chatgpt',founder:'chatgpt',recruiting:'chatgpt',crm:'accounts',
};

export function demoAccessFor(slug:CatalogSlug,locale:Locale):{mode:'accounts'|'none'|'chatgpt';accounts:DemoAccount[]} {
  const accounts=publicAccounts[slug];
  const mode=accessModes[slug];
  if(mode==='accounts'){
    if(!accounts?.length)throw new Error(`Public demo accounts are required for ${slug}.`);
    return {mode,accounts:accounts.map(account=>({...account,role:roles[locale][account.role]}))};
  }
  return {mode,accounts:[]};
}

export function demoAccessUI(locale:Locale){
  const s=(ru:string,en:string,ro:string)=>({ru,en,ro})[locale];
  return {
    title:s('Демо-доступ','Demo access','Acces demo'), role:s('Войти как','Sign in as','Autentificare ca'),
    email:s('Логин','Login','Utilizator'), password:s('Пароль','Password','Parolă'),
    copy:s('Скопировать','Copy','Copiază'), copying:s('Копирование…','Copying…','Se copiază…'),
    copied:s('Скопировано','Copied','Copiat'), failed:s('Выделено для копирования вручную.','Selected for manual copying.','Selectat pentru copiere manuală.'),
    note:s('Общие учебные аккаунты. Не вводите реальные данные.','Shared demo accounts. Do not enter real data.','Conturi demo comune. Nu introduce date reale.'),
    noAccount:s('Ручное редактирование PDF — без аккаунта.','Manual PDF editing needs no account.','Editarea manuală PDF nu necesită cont.'),
    chatgpt:s('Сейчас демо запрашивает вход через ChatGPT. Общего логина и пароля для него нет.','The demo currently requires ChatGPT sign-in. There is no shared login or password.','Demonstrația solicită momentan autentificarea prin ChatGPT. Nu există un cont și o parolă comune.'),
    all:s('Все учебные аккаунты','All demo accounts','Toate conturile demo'),
  };
}
