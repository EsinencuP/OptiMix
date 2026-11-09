import type { CSSProperties } from 'react';
type ClassValue = string | false | null | undefined | Record<string, boolean> | ClassValue[];
export function cx(...values: ClassValue[]): string {
  return values.flatMap(value => Array.isArray(value) ? cx(...value) : typeof value === 'object' && value ? Object.keys(value).filter(key => value[key]) : value || []).join(' ');
}
export function styleFromCss(value: string): CSSProperties {
  return Object.fromEntries(value.split(';').filter(Boolean).map(declaration => {
    const colon = declaration.indexOf(':');
    const property = declaration.slice(0, colon).trim();
    return [property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_,letter:string)=>letter.toUpperCase()), declaration.slice(colon+1).trim()];
  })) as CSSProperties;
}
