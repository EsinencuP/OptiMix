import type {Metadata,Viewport} from 'next';
import {notFound} from 'next/navigation';
import HomePage from '../../../components/HomePage';
import ContactPage from '../../../components/ContactPage';
import PrivacyPage from '../../../components/PrivacyPage';
import ProjectPage from '../../../components/ProjectPage';
import DemoPage from '../../../components/DemoPage';
import ModulePage from '../../../components/ModulePage';
import ServicePage from '../../../components/ServicePage';
import PortfolioIndexPage from '../../../components/PortfolioIndexPage';
import PortfolioEntry from '../../../components/PortfolioEntry';
import NotFoundPage from '../../../components/NotFoundPage';
import {locales,pathFor,type Locale} from '../../../content';
import {routeManifest,findRoute,pageMeta} from '../../../lib/routes';
import type {ModuleSlug} from '../../../content/portfolio';
import type {CatalogSlug} from '../../../content/portfolio-catalog';
import type {ServiceSlug} from '../../../content/services';
type Params={locale:Locale;segments?:string[]};
export const dynamicParams=true;
export const viewport:Viewport={themeColor:'#5a5f69'};
export function generateStaticParams(){return locales.flatMap(locale=>routeManifest.map(route=>({locale,segments:route.segments})));}
export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
 const {locale,segments}=await params,route=findRoute(segments);
 if(!locales.includes(locale)||!route)notFound();
 const meta=pageMeta(locale,route),site=process.env.PUBLIC_SITE_URL||'https://opti-mix-three.vercel.app';
 return {metadataBase:new URL(site),title:meta.title,description:meta.description,robots:{index:false,follow:false},alternates:{canonical:meta.path,languages:{...Object.fromEntries(locales.map(target=>[target,pathFor(target,route.page,route.slug)])),'x-default':pathFor('en',route.page,route.slug)}},openGraph:{title:meta.title,description:meta.description,url:meta.path,type:'website',siteName:'OptiMix',locale:locale==='ro'?'ro_RO':locale==='ru'?'ru_RU':'en_GB'},twitter:{card:'summary',title:meta.title,description:meta.description}};
}
export default async function Page({params}:{params:Promise<Params>}){
 const {locale,segments}=await params,route=findRoute(segments);
 if(!locales.includes(locale)||!route)notFound();
 switch(route.page){
  case 'home':return <HomePage locale={locale}/>;
  case 'contact':return <ContactPage locale={locale}/>;
  case 'privacy':return <PrivacyPage locale={locale}/>;
  case 'project':return <ProjectPage locale={locale}/>;
  case 'demo':return <DemoPage locale={locale}/>;
  case 'portfolio':return route.slug?<PortfolioEntry locale={locale} slug={route.slug as CatalogSlug}/>:<PortfolioIndexPage locale={locale}/>;
  case 'solution':return <ModulePage locale={locale} slug={route.slug as ModuleSlug}/>;
  case 'service':return <ServicePage locale={locale} slug={route.slug as ServiceSlug}/>;
  default:return <NotFoundPage locale={locale}/>;
 }
}
