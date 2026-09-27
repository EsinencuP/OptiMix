import { readFile, writeFile } from 'node:fs/promises';

const dir = new URL('./', import.meta.url);
const read = async (name) => readFile(new URL(name, dir), 'utf8');
const names = (await read('final-60.txt')).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const report = await read('final-60-report.md');
const domains = JSON.parse(await read('domain-results.json'));
const social = JSON.parse(await read('final-social-results.json'));
const descriptions = new Map([...report.matchAll(/^\d+\. \*\*(.+?)\*\* — (.+)$/gm)].map((match) => [match[1].toLowerCase(), match[2]]));
const domainByName = new Map(domains.map((x) => [x.name, x]));
const socialByName = new Map(social.map((x) => [x.name, x]));
const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

if (names.length !== 60 || new Set(names.map((x) => x.toLowerCase())).size !== 60 || descriptions.size !== 60) {
  throw new Error('Expected 60 distinct names and 60 descriptions');
}

const rows = [['name', 'why_ru', 'domain', 'rdap_status', 'rdap_checked_at', 'linkedin_http_status', 'instagram_page_title', 'social_checked_at', 'trademark_status']];
for (const name of names) {
  const key = name.toLowerCase();
  const domain = domainByName.get(key);
  const profile = socialByName.get(key);
  const why = descriptions.get(key);
  if (!domain || domain.status !== 'available' || !profile || profile.linkedin.status !== 404 || profile.instagram.title !== 'Instagram' || !why) {
    throw new Error(`Incomplete or changed screening for ${name}`);
  }
  rows.push([name, why, domain.domain, 'RDAP 404: no registration record at check time', domain.checkedAt, profile.linkedin.status, profile.instagram.title, profile.checkedAt, 'not checked; legal clearance required']);
}

await writeFile(new URL('final-60.csv', dir), '\uFEFF' + rows.map((row) => row.map(csv).join(',')).join('\r\n') + '\r\n');
process.stdout.write(`Wrote ${rows.length - 1} candidates to final-60.csv\n`);
