// Dates in Europe/Bucharest, the site's time zone (docs/seo.md, language and locale).
const TZ = 'Europe/Bucharest';

/** ISO 8601 with the Bucharest offset of that moment: 2026-10-22T14:03:08+03:00. */
export function isoBucharest(date: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(date).map((x) => [x.type, x.value]),
  );
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  const offset = Math.round((local - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  const hhmm = `${String(Math.trunc(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`;
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${offset < 0 ? '-' : '+'}${hhmm}`;
}

/** The date as readers see it: "22 octombrie 2026". */
export function displayDate(date: Date): string {
  return new Intl.DateTimeFormat('ro-RO', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

const SHORT_MONTHS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];

/** Month and year, as list cards show them: "Oct 2026". */
export function shortDate(date: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: 'numeric' })
      .formatToParts(date).map((x) => [x.type, x.value]),
  );
  return `${SHORT_MONTHS[+p.month - 1]} ${p.year}`;
}
