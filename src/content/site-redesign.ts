import type { Locale } from './index';
export function siteRedesign(locale: Locale) {
  const s = (ru: string, en: string, ro: string) => ({ru,en,ro})[locale];
  return {
    briefStatus:s('Бриф остаётся у вас','Your brief stays with you','Brief-ul rămâne la tine'),
    notFound:s('Такой страницы нет','This page could not be found','Pagina nu a fost găsită'),
    notFoundIntro:s('Ссылка могла измениться. Вернитесь на главную или выберите нужный раздел в меню.','The link may have changed. Return to the homepage or choose a section from the menu.','Este posibil ca adresa să se fi schimbat. Revino la pagina principală sau alege o secțiune din meniu.'),
    brief:s('Начнём с вашей задачи','Start with your task','Începem cu sarcina ta'),
    privacy:s('Данные и конфиденциальность','Data and privacy','Date și confidențialitate'),
    project:s('Демо-проект Optimix','Optimix demo project','Proiect demo Optimix'),
    demo:s('Интерактивный демо-сценарий','Interactive demo scenario','Scenariu demo interactiv'),
    route:s('Модули процесса','Process modules','Modulele procesului'),
    home:s('На главную','Back to home','Înapoi la pagina principală'),
    noScript:s('Чтобы сохранить бриф или пройти демо, включите JavaScript. Содержимое страниц доступно без него.','Enable JavaScript to save the brief or run the demo. Page content remains available without it.','Activează JavaScript pentru a salva brief-ul sau a parcurge demonstrația. Conținutul paginilor rămâne disponibil fără el.'),
  };
}
