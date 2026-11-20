import NotFoundPage from '../components/NotFoundPage';
import { siteName } from '../lib/brand';
import './site.css';
export default function GlobalNotFound(){return <html lang="en"><head><title>{`404 — ${siteName}`}</title></head><body><NotFoundPage locale="en"/></body></html>;}
