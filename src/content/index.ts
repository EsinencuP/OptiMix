import { en } from './en';
import { ro } from './ro';
import { ru } from './ru';

export type Locale = 'en' | 'ro' | 'ru';
export type PageKind = 'home' | 'contact' | 'privacy';

export const content = { en, ro, ru };
export const locales: Locale[] = ['en', 'ro', 'ru'];

export function pathFor(locale: Locale, page: PageKind): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return page === 'home' ? `${prefix}/` : `${prefix}/${page}/`;
}

export function homeAnchor(locale: Locale, anchor: string): string {
  return `${pathFor(locale, 'home')}#${anchor}`;
}
