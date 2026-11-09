import type {Locale} from './index';
export function heroSheets(locale:Locale){
 const s=(ru:string,en:string,ro:string)=>({ru,en,ro})[locale];
 return {
  pause:s('Приостановить анимацию','Pause animation','Oprește animația'),play:s('Продолжить анимацию','Play animation','Pornește animația'),choose:s('Выбрать карточку примера','Choose an example card','Alege un exemplu'),
  sheets:[
   {key:'people',title:s('Люди','People','Oameni'),subtitle:s('Команда, которая ведёт процесс','The team behind the process','Echipa din spatele procesului'),icon:'users',rows:[s('Координатор · распределяет запрос','Coordinator · routes the request','Coordonator · distribuie cererea'),s('Менеджер · готовит решение','Manager · prepares the decision','Manager · pregătește decizia'),s('Руководитель · подтверждает','Team lead · approves','Coordonator de echipă · aprobă')],footer:s('У каждого шага есть ответственный','Every step has an owner','Fiecare pas are un responsabil')},
   {key:'processes',title:s('Процессы','Processes','Procese'),subtitle:s('От запроса до результата','From request to outcome','De la cerere la rezultat'),icon:'gear',rows:[s('Запрос принят','Request received','Cerere primită'),s('Данные проверены','Data reviewed','Date verificate'),s('Решение согласовано','Decision approved','Decizie aprobată')],footer:s('Исключения передаются ответственному','Exceptions go to the owner','Excepțiile ajung la responsabil')},
   {key:'systems',title:s('Системы','Systems','Sisteme'),subtitle:s('Общий контекст между инструментами','Shared context across tools','Context comun între instrumente'),icon:'database',rows:[s('CRM · контакты и сделки','CRM · contacts and deals','CRM · contacte și tranzacții'),s('ERP · операции и запасы','ERP · operations and inventory','ERP · operațiuni și stocuri'),s('Аналитика · показатели','Analytics · metrics','Analiză · indicatori')],footer:s('Данные передаются между этапами','Data moves between stages','Datele circulă între etape')}
  ]
 };
}
