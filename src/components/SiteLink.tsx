import Link from 'next/link';
import type { ComponentProps } from 'react';
export default function SiteLink(props: ComponentProps<typeof Link>) {
    return <Link prefetch={false} transitionTypes={['page-navigation']} {...props}/>;
}
