import ical from 'ical';
import danny from './calendars/danny.ics?raw';
const calendars = import.meta.glob('./calendars/*.ics', { as: 'raw' });

console.log(calendars); //.then(console.log);

Promise.all(Object.values(calendars).map((fn) => fn()))
  .then((cals) =>
    cals
      .reduce((acc, calString) => acc.concat(getCalendar(calString)), [])
      .map(pick('summary', 'start'))
      .map((e) => {
        e.weeksUntil = getWeeksFromNow(e.start);
        return e;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .filter(
        (item, pos, a) => a.findIndex((e) => e.summary === item.summary) == pos
      )
      .map((e) => {
        e.html = e.weeksUntil
          ? `<tr><td>${e.summary}</td> <td>in ${e.weeksUntil} weeks</td></tr>`
          : `<tr><td>${e.summary}</td> <td>this week</td></tr>`;
        return e;
      })
  )
  .then((res) => {
    console.log(res);
    return res;
  })
  .then((res) => {
    const html = res.map((event) => event.html).join('');

    document.querySelector('#app').innerHTML = `<table>${html}</table>`;
  });

function pick(...keys) {
  return (obj) =>
    keys.reduce((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
}

const orderDates = (a, b) => a - b;

function getCalendar(eventStr) {
  const events = Object.values(ical.parseICS(danny));
  return events.filter((event) => new Date(event.start) >= Date.now());
}

function getWeeksFromNow(endDate) {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const startDate = Date.now();
  return Math.round(Math.abs(endDate - startDate) / msInWeek);
}
