import { writeFile } from 'node:fs/promises';

const items = [
  ['RelaySplice', 'Передача и соединение разорванных этапов'],
  ['ProcessHinge', 'Точка решения, меняющая ход процесса'],
  ['Loomentia', 'Рабочие нити как единая система'],
  ['Gatecerta', 'Надёжные согласования и переходы'],
  ['AriadThread', 'Нить Ариадны через сложный процесс'],
  ['LoopSpindle', 'Повторяющиеся нити собраны в цикл'],
  ['AriadTrace', 'Прослеживаемый путь через сложность'],
  ['RelayTrellis', 'Опора для передачи задач между этапами'],
];
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const rows = items.map(([name, why], index) => {
  const y = 333 + index * 111;
  return `<g transform="translate(80,${y})"><rect width="1440" height="99" rx="14" class="row"/>
    <text x="25" y="38" class="name">${esc(name)}</text><text x="350" y="38" class="why">${esc(why)}</text>
    <text x="25" y="72" class="ok">.COM: RDAP 404</text><text x="220" y="72" class="ok">LINKEDIN 404</text><text x="430" y="72" class="small">IG: публичный профиль не показан</text><text x="925" y="72" class="ok">TMVIEW: 0 СТРОК</text><text x="1230" y="72" class="pending">ПРАВА?</text>
  </g>`;
}).join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1280" viewBox="0 0 1600 1280">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#09151d"/><stop offset="1" stop-color="#0f3037"/></linearGradient>
<style>.title{font:700 48px Arial;fill:#f3f4ed}.sub{font:400 20px Arial;fill:#aec5c3}.section{font:700 15px Arial;letter-spacing:1.6px;fill:#7faeaa}.name{font:700 27px Arial;fill:#f5f5ee}.why{font:400 18px Arial;fill:#c9d9d4}.ok{font:700 14px Arial;fill:#8cddbe}.pending{font:700 14px Arial;fill:#edbf81}.small{font:400 15px Arial;fill:#99b5b3}.row{fill:#14343c;stroke:#285059;stroke-width:1}</style></defs>
<rect width="1600" height="1280" fill="url(#bg)"/>
<text x="80" y="80" class="title">51 КАНДИДАТ · ПРЕДВАРИТЕЛЬНЫЙ СКРИНИНГ</text>
<text x="80" y="118" class="sub">27.09.2026 · 455 проверенных .com · 60 точных и 60 нечётких запросов TMview + 8 замен</text>
<rect x="80" y="151" width="1440" height="111" rx="16" fill="#193c42"/>
<text x="105" y="187" class="section">ЧТО ОЗНАЧАЮТ ЗЕЛЁНЫЕ МЕТКИ</text>
<text x="105" y="224" class="why">Наблюдение на момент проверки, не бронь и не гарантия прав на имя или username</text>
<text x="80" y="307" class="section">8 ИМЁН ДЛЯ ПЕРВОГО ОБСУЖДЕНИЯ</text>
${rows}
<rect x="80" y="1230" width="1440" height="37" rx="10" fill="#4a3928"/>
<text x="102" y="1255" class="small" style="fill:#f1d5aa">НУЖНО: OSIM, WIPO, ONRC и проверка никнеймов; домены и аккаунты пока не зарезервированы.</text>
</svg>`;
await writeFile(new URL('refined-51-screen.svg', import.meta.url), svg);
process.stdout.write('Wrote refined-51-screen.svg\n');
