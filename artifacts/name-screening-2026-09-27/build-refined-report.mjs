import { readFile, writeFile } from 'node:fs/promises';

const dir = new URL('./', import.meta.url);
const read = async (name) => readFile(new URL(name, dir), 'utf8');
const names = (await read('refined-51.txt')).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const oldReport = await read('final-60-report.md');
const oldDescriptions = new Map([...oldReport.matchAll(/^\d+\. \*\*(.+?)\*\* — (.+)$/gm)].map((match) => [match[1].toLowerCase(), match[2]]));
const newDescriptions = {
  ariadtrace: 'нить Ариадны + отслеживаемый след: путь задачи виден даже в сложном процессе.',
  ariadloop: 'нить Ариадны проходит через повторяющиеся циклы и не даёт задаче потеряться.',
  gatespindle: 'контрольные точки собирают множество рабочих нитей в одну последовательность.',
  flowspindle: 'веретено как образ управляемого потока повторяющихся операций.',
  processlattice: 'решётка связей показывает зависимости, переходы и решения внутри процесса.',
  routelattice: 'сеть маршрутов для разных типов задач и исключений, а не один жёсткий сценарий.',
};
const descriptions = new Map([...oldDescriptions, ...Object.entries(newDescriptions)]);
const domains = new Map(JSON.parse(await read('domain-results.json')).map((x) => [x.name, x]));
const social = new Map(JSON.parse(await read('refined-social-results.json')).map((x) => [x.name, x]));
const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

if (names.length !== 51 || new Set(names.map((x) => x.toLowerCase())).size !== 51) throw new Error('Expected 51 unique names');
const records = names.map((name) => {
  const key = name.toLowerCase();
  const domain = domains.get(key);
  const profile = social.get(key);
  const why = descriptions.get(key);
  if (!domain || domain.status !== 'available' || !profile || profile.linkedin.status !== 404 || profile.instagram.title !== 'Instagram' || !why) {
    throw new Error(`Incomplete screening: ${name}`);
  }
  return {
    name, why, domain: domain.domain, domainCheckedAt: domain.checkedAt,
    socialCheckedAt: profile.checkedAt,
    exact: `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=I&basicSearch=${encodeURIComponent(name)}`,
    fuzzy: `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=F&basicSearch=${encodeURIComponent(name)}`,
    euipo: `https://euipo.europa.eu/eSearch/#basic/1+1+1+1/100+100+100+100/${encodeURIComponent(name)}`,
  };
});

const top = ['RelaySplice', 'ProcessHinge', 'Loomentia', 'Gatecerta', 'AriadThread', 'LoopSpindle', 'AriadTrace', 'RelayTrellis'];
const report = `# 51 кандидат после предварительного скрининга

Проверено 27.09.2026. Это более строгая версия [первого списка из 60](final-60-report.md). Отобраны имена для B2B-компании, которая улучшает повторяющиеся процессы, маршрутизацию задач, согласования и работу с исключениями.

Позднее добавлен [четвёртый круг с 89 новыми уникальными кандидатами](round-4-review.md): десять более естественно звучащих имён прошли только доменный и предварительный веб-фильтр, поэтому **пока не включены** в эти 51 строку и не названы готовыми.

## Результат скрининга

- **.com:** по каждому из 51 официальный Verisign RDAP вернул 404 (регистрационной записи нет на момент запроса); все домены перепроверены после отбора.
- **LinkedIn:** точный URL компании для каждого вернул HTTP 404.
- **Instagram:** прямой адрес каждого показал общий заголовок «Instagram», а не публичный профиль. Это **не** доказывает, что username доступен для регистрации.
- **TMview:** по каждому из 51 в интерфейсе TMview выполнен поиск «Точное совпадение» и «Нечёткий поиск»; оба показали «Строк не найдено». TMview содержит данные участвующих ведомств, включая румынский OSIM, но не заменяет актуальный первичный реестр и юридическую оценку. Ссылки на запросы — в [CSV](refined-51.csv).
- **EUIPO eSearch plus:** по каждому из 51 выполнен запрос в первичной базе знаков ЕС; интерфейс показал «Trade marks (0)» и «No results were found». Это не проверка национальных прав вне ЕС или незарегистрированных обозначений.
- **OSIM (Румыния):** национальный реестр не удалось проверить: сайт остановился на сообщении об исчерпанной квоте reCAPTCHA Enterprise. Мы не обходили защиту; статус каждого имени в OSIM — **не проверено**.
- **WIPO Madrid:** публичный Madrid Monitor остался на «Working…», а Global Brand Database не открылся в браузере. Статус международных регистраций — **не проверено**.
- **Веб-поиск:** точные написания искались в кавычках; очевидные совпадения с действующими брендами отсеивались. Поиск не охватывает всё неиндексируемое содержимое и незарегистрированные права.

Это **не юридическое заключение и не гарантия полной свободы**. TMview сам указывает, что не является официальным реестром с юридической силой. Проверка сходства по классам и территориям, фирменных наименований и незарегистрированных прав требует отдельной оценки. Домен и аккаунты не зарезервированы.

**Замечание по трафику:** RouteLattice оставлено в полном исследовательском списке, но снято с восьмёрки лидеров: выражение «Route Lattice» уже используется как название раздела и понятия на другом сайте. Поиск по написанию без пробела может вести и к нему. Сходство не доказывает правового конфликта, но ослабляет SEO-уникальность. Аналогично мифологическое сокращение **Ariad** уже встречается в действующих брендах; AriadThread и AriadTrace требуют дополнительной оценки сходства, особенно при выходе за пределы ЕС.

## Восемь наиболее выразительных вариантов

${top.map((name) => `- **${name}** — ${descriptions.get(name.toLowerCase())}`).join('\n')}

## Все 51 название и краткий смысл

${records.map((record, index) => `${index + 1}. **${record.name}** — ${record.why}`).join('\n')}

## Почему прежние кандидаты исключены

- **Weavelis:** действующий WAVELIS, классы 9/41/42/45 (Франция).
- **Arcalora:** близкая заявка Arcaloria, в том числе класс 9 (Франция).
- **Tracearis:** заявки TRACERIS MOBILE WORKFORCE MANAGER, классы 9/38 (Мексика); близко по сфере и звучанию.
- **Praxivis:** близкие PRAXIDIS Executive Search (действует, класс 35) и другие знаки; слишком неоднозначный для строгого списка.
- **Clarimeris:** CLARIMEDIS действует в ЕС, в том числе классы 35/42; другая сфера, но близкое написание.
- **Gateentra:** действующий GateEntry, класс 9 (Корея).
- **Opercerta:** прежний OPERCERT в классах 9/35/42, хотя срок действия истёк; слабая собственность имени.
- Остальные восемь из первого списка с нечёткими совпадениями тоже временно исключены консервативно: Loomancia, Loopmeria, Routentia, Gatentia, Praxielis, Opermeris, Opercenta, Ariadova. Проверка TMview даёт кандидатов для анализа, но не автоматический вывод о нарушении.

## Следующий обязательный порог перед использованием

1. Для выбранных 3–5 имён завершить проверку национального реестра OSIM и международных регистраций WIPO, повторно оценить фонетически близкие знаки и релевантные классы услуг; при планах на другие рынки — их национальные реестры. OSIM предлагает платный документальный поиск для официального ответа о доступности.
2. Проверить юридическое фирменное наименование и незарегистрированные коммерческие обозначения в целевых странах.
3. Повторно проверить домен .com и доступность username непосредственно в момент регистрации, затем резервировать. Ни один из 51 доменов или аккаунтов сейчас не принадлежит нам.
4. Если юридическое лицо регистрируется в Румынии, проверить название через ONRC: результат веб-поиска не заменяет проверку и резервирование фирменного наименования. ONRC оценивает и уже зарегистрированные, и ранее зарезервированные названия. Онлайн-сервис «Rezervare denumire firmă» перенаправил на вход в аккаунт; проверка из него не выполнена.

Источники: [TMview](https://www.tmdn.org/tmview/#/tmview), [позиция EUIPO о поиске похожих знаков](https://www.euipo.europa.eu/en/trade-marks/before-applying/availability), [FAQ OSIM о трёх реестрах и официальном поиске](https://www.osim.ro/intrebari-frecvente/marci-si-indicatii-geografice), [WIPO Global Brand Database](https://www.wipo.int/en/web/global-brand-database), [правила ONRC о проверке и резервировании наименования](https://www.onrc.ro/index.php/ro/inmatriculari/operatiuni-prealabile/verificare-si-rezervare-firma), [пример использования «Route Lattice»](https://edukatesg.com/what-is-strategizeos/civ0s-runtime-strategizeos-runtime-master-index/strategizeos-encoding-registry-v1-0/), [Verisign RDAP](https://rdap.verisign.com/com/v1/domain/relaysplice.com).
`;

const columns = ['name', 'why_ru', 'domain', 'rdap_observation', 'domain_checked_at', 'linkedin_http_status', 'instagram_page_title', 'social_checked_at', 'tmview_exact_observation', 'tmview_exact_url', 'tmview_fuzzy_observation', 'tmview_fuzzy_url', 'euipo_esearch_observation', 'euipo_esearch_url', 'osim_national_observation', 'wipo_madrid_observation', 'onrc_firm_name_observation', 'search_collision_note', 'legal_clearance'];
const rows = [columns, ...records.map((record) => [record.name, record.why, record.domain, '404: no registration record at check time', record.domainCheckedAt, 404, 'Instagram (generic page; username availability unknown)', record.socialCheckedAt, 'No rows in TMview UI on 2026-09-27', record.exact, 'No rows in TMview UI on 2026-09-27', record.fuzzy, 'Trade marks (0); No results on 2026-09-27', record.euipo, 'NOT CHECKED: OSIM captcha quota', 'NOT CHECKED: public WIPO UI unavailable', 'NOT CHECKED: ONRC firm-name availability/reservation', record.name === 'RouteLattice' ? 'Route Lattice is used as a named concept/section on an indexed third-party site' : record.name.startsWith('Ariad') ? 'ARIAD is an existing brand stem; assess similarity by country/class' : '', 'NOT CLEARED'])];

await writeFile(new URL('refined-51-report.md', dir), report);
await writeFile(new URL('refined-51.csv', dir), '\uFEFF' + rows.map((row) => row.map(csv).join(',')).join('\r\n') + '\r\n');
process.stdout.write(`Wrote ${records.length} names to refined report and CSV\n`);
