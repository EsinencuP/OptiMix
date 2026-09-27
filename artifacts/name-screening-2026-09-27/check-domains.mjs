import { readFile, writeFile } from 'node:fs/promises';

const files = [new URL('./candidate-pool.txt', import.meta.url), new URL('./candidate-pool-2.txt', import.meta.url), new URL('./candidate-pool-3.txt', import.meta.url), new URL('./candidate-pool-4.txt', import.meta.url), new URL('./candidate-pool-5.txt', import.meta.url)];
const out = new URL('./domain-results.json', import.meta.url);
const names = [...new Set((await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n').split(/\r?\n/).map((x) => x.trim().toLowerCase()).filter(Boolean))];
const results = new Array(names.length);
let next = 0;

async function check(name) {
  const url = `https://rdap.verisign.com/com/v1/domain/${name}.com`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { accept: 'application/rdap+json' } });
      if (response.status === 404) return { name, domain: `${name}.com`, status: 'available', checkedAt: new Date().toISOString(), source: url };
      if (response.status === 200) return { name, domain: `${name}.com`, status: 'registered', checkedAt: new Date().toISOString(), source: url };
      if (response.status !== 429 && response.status < 500) return { name, domain: `${name}.com`, status: `http_${response.status}`, checkedAt: new Date().toISOString(), source: url };
    } catch (error) {
      if (attempt === 2) return { name, domain: `${name}.com`, status: 'error', error: String(error), checkedAt: new Date().toISOString(), source: url };
    }
    await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
  }
  return { name, domain: `${name}.com`, status: 'unverified', checkedAt: new Date().toISOString(), source: url };
}

async function worker() {
  while (next < names.length) {
    const index = next++;
    results[index] = await check(names[index]);
  }
}

await Promise.all(Array.from({ length: 8 }, worker));
await writeFile(out, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({ total: results.length, available: results.filter((x) => x.status === 'available').length, registered: results.filter((x) => x.status === 'registered').length, other: results.filter((x) => !['available', 'registered'].includes(x.status)), availableNames: results.filter((x) => x.status === 'available').map((x) => x.name) }, null, 2));
