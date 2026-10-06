import { en } from './en';
import { ro } from './ro';
import { ru } from './ru';

export type Locale = 'en' | 'ro' | 'ru';
export type PageKind = 'home' | 'contact' | 'privacy' | 'solution' | 'demo' | 'project';

export const content = { en, ro, ru };
export const locales: Locale[] = ['en', 'ro', 'ru'];

export function pathFor(locale: Locale, page: PageKind, slug?: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  if (page === 'home') return `${prefix}/`;
  if (page === 'demo') return `${prefix}/demo/procurement/`;
  if (page === 'project') return `${prefix}/projects/procurement/`;
  if (page === 'solution') {
    if (!slug) throw new Error('A solution slug is required.');
    return `${prefix}/solutions/${slug}/`;
  }
  return `${prefix}/${page}/`;
}

export function homeAnchor(locale: Locale, anchor: string): string {
  return `${pathFor(locale, 'home')}#${anchor}`;
}
