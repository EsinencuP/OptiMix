'use client';
import {useParams} from 'next/navigation';
import NotFoundPage from '../../components/NotFoundPage';
import {locales,type Locale} from '../../content';
export default function NotFound(){const params=useParams();const locale=locales.includes(params?.locale as Locale)?params!.locale as Locale:'en';return <NotFoundPage locale={locale}/>;}
