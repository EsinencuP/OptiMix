import { content, pathFor, type Locale, type PageKind } from '../content';
import { homeRedesign } from '../content/home-redesign';
import { portfolio } from '../content/portfolio';
import { portfolioCatalog, portfolioUI } from '../content/portfolio-catalog';
import { serviceSlugs, servicesFor } from '../content/services';
export interface Route { page:PageKind; slug?:string; segments:string[] }
export const routeManifest:Route[] = [
 {page:'home',segments:[]},{page:'contact',segments:['contact']},{page:'privacy',segments:['privacy']},
 {page:'project',segments:['projects','procurement']},{page:'demo',segments:['demo','procurement']},
 {page:'portfolio',segments:['portfolio']},
 ...['pdf-editor','erp','commerce','founder','recruiting','crm'].map(slug=>({page:'portfolio' as const,slug,segments:['portfolio',slug]})),
 ...['intake','budget','approval','erp','visibility'].map(slug=>({page:'solution' as const,slug,segments:['solutions',slug]})),
 ...serviceSlugs.map(slug=>({page:'service' as const,slug,segments:['services',slug]})),
 {page:'not-found',segments:['404']},
];
export function findRoute(segments:string[]=[]) { return routeManifest.find(route=>route.segments.join('/')===segments.join('/')); }
export function pageMeta(locale:Locale,route:Route) {
 const t=content[locale],home=homeRedesign(locale);
 let title='Optimix',description=home.intro;
 switch(route.page){
  case 'home':title=`Optimix — ${home.eyebrow}`;break;
  case 'contact':title=t.meta.contactTitle;description=t.meta.contactDescription;break;
  case 'privacy':title=t.meta.privacyTitle;description=t.meta.privacyDescription;break;
  case 'portfolio': {const ui=portfolioUI(locale),project=portfolioCatalog(locale).find(item=>item.slug===route.slug);title=project?`${project.fullName} — ${ui.eyebrow}`:ui.eyebrow;description=project?.description??ui.intro;break;}
  case 'service':{const service=servicesFor(locale).find(item=>item.slug===route.slug)!;title=`${service.title} — Optimix`;description=service.description;break;}
  case 'solution':{const module=portfolio[locale].modules.find(item=>item.slug===route.slug)!;title=`${module.title} — Optimix`;description=module.proposal;break;}
  case 'demo':title=`${portfolio[locale].demo.title} — Optimix`;description=portfolio[locale].demo.intro;break;
  case 'project':title=`${portfolio[locale].project.title} — Optimix`;description=portfolio[locale].project.intro;break;
  case 'not-found':title='404 — Optimix';break;
 }
 return {title,description,path:pathFor(locale,route.page,route.slug)};
}
