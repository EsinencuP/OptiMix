import { Image } from 'lucide-react';
import type { Locale } from '../content';
interface Props {
    locale: Locale;
    name?: string;
}
export default function ScreenshotPlaceholder({ locale, name }: Props) {
    const text = { ru: ['Экран проекта готовится', 'Здесь появится снимок приложения'], en: ['Project screen coming soon', 'An application screenshot will appear here'], ro: ['Ecranul proiectului este în pregătire', 'Aici va apărea o captură a aplicației'] }[locale];
    return <figure className="ox-screenshot-placeholder" data-screenshot-placeholder><Image size={48} strokeWidth={1.5} aria-hidden="true"/><figcaption><strong>{name || text[0]}</strong><span>{text[1]}</span></figcaption></figure>;
}
