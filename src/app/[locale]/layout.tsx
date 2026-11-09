import type {ReactNode} from 'react';
import {ViewTransition,Suspense} from 'react';
import {locales,type Locale} from '../../content';
import SiteRuntime from '../../components/SiteRuntime';
import '../site.css';
export function generateStaticParams(){return locales.map(locale=>({locale}));}
export const metadata={title:'404 — Optimix',robots:{index:false,follow:false}};
export default async function RootLayout({children,params}:{children:ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params;
 const language=locales.includes(locale as Locale)?locale:'en';
 return <html lang={language}><head><link rel="icon" href="/images/redesign/brand-mark-graphite.svg" type="image/svg+xml"/><link rel="preload" href="/fonts/redesign/Roboto-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body><noscript><style>{'.ox-start-grid>li{opacity:1!important;transform:none!important}'}</style></noscript><ViewTransition name="optimix-page" default="page-fade">{children}</ViewTransition><Suspense fallback={null}><SiteRuntime/></Suspense></body></html>;
}
