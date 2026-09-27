import { readFile, writeFile } from 'node:fs/promises';

const dir = new URL('./', import.meta.url);
const inputName = process.argv[2] ?? 'shortlist-60.txt';
const outputName = process.argv[3] ?? 'social-results.json';
const names = (await readFile(new URL(inputName, dir), 'utf8'))
  .split(/\r?\n/).map((x) => x.trim().toLowerCase()).filter(Boolean);
const results = [];
let next = 0;

async function inspect(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36' },
    });
    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
    return { status: response.status, finalUrl: response.url, title };
  } catch (error) {
    return { status: null, error: String(error) };
  }
}

async function worker() {
  while (next < names.length) {
    const name = names[next++];
    const linkedin = await inspect(`https://www.linkedin.com/company/${name}/`);
    const instagram = await inspect(`https://www.instagram.com/${name}/`);
    results.push({ name, linkedin, instagram, checkedAt: new Date().toISOString() });
    process.stdout.write(`${results.length}/${names.length} ${name} LI:${linkedin.status} IG:${instagram.status} ${instagram.title.slice(0, 55)}\n`);
  }
}

await Promise.all(Array.from({ length: 3 }, worker));
results.sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));
await writeFile(new URL(outputName, dir), JSON.stringify(results, null, 2) + '\n');
