import type { ReactNode } from 'react';
import { content, type Locale, type PageKind } from '../content';
import { cx } from '../lib/ui';
interface Props { children: ReactNode; locale: Locale; page: PageKind; slug?: string; title: string; description: string }
export default function BaseLayout({children,locale,page}:Props) {
 return <><a className="skip-link" href="#main">{content[locale].ui.skip}</a><div className={cx('ox-home',page!=='home'&&'ox-inner',page==='portfolio'&&'ox-portfolio')}>{children}</div></>;
}
