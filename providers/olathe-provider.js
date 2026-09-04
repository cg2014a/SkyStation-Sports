import { endpoint, isoDate } from './provider-utils.js';

const workerBase = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://127.0.0.1:8787'
  : 'https://skystation-sports-gateway.cgarrett4.workers.dev';

const schools = [
  ['OE', 'Olathe East High School', '1181'],
  ['ON', 'Olathe North High School', '677'],
  ['ONW', 'Olathe Northwest High School', '1240'],
  ['OS', 'Olathe South High School', '679'],
  ['OW', 'Olathe West High School', '6770']
];
const sports = [
  ['FOOTBALL', 'Football'],
  ['BOYS_BASKETBALL', "Boys' Basketball"],
  ['BOYS_CROSS_COUNTRY', "Boys' Cross-Country"],
  ['BOYS_SOCCER', "Boys' Soccer"],
  ['BOYS_TRACK_FIELD', "Boys' Track & Field"]
];
const levels = [['VARSITY', 'Varsity'], ['JV', 'JV'], ['B_TEAM', 'B Team'], ['C_TEAM', 'C Team'], ['FRESHMAN', 'Freshman']];
const teams = schools.flatMap(([schoolKey, name, providerId]) => sports.flatMap(([sportKey, sport]) => levels.map(([levelKey, level]) => ({
  id: `OLATHE:${schoolKey}:${sportKey}:${levelKey}`,
  providerId,
  league: 'OLATHE',
  schoolKey,
  sportKey,
  sport,
  levelKey,
  level,
  scoresAvailable: schoolKey === 'ONW' && sportKey === 'FOOTBALL' && levelKey === 'VARSITY',
  name,
  abbreviation: schoolKey,
  logo: null
}))));

export default {
  league: 'OLATHE',
  games: async date => {
    const current = isoDate(date).replaceAll('-', '');
    const dates = [isoDate(date)];
    const requests = [endpoint(`${workerBase}/api/olathe/scores?date=${current}`)];
    if (typeof window !== 'undefined' && window.location.hash === '#home') {
      const previous = new Date(date);
      previous.setUTCDate(previous.getUTCDate() - 1);
      dates.push(isoDate(previous));
      requests.push(endpoint(`${workerBase}/api/olathe/scores?date=${isoDate(previous).replaceAll('-', '')}`));
    }
    const responses = await Promise.all(requests);
    const allowedDates = new Set(dates);
    const games = responses.flatMap(data => data.games || []).filter(game => allowedDates.has(String(game.date || '').slice(0, 10)));
    return games.map(game => {
      const mapTeam = team => team?.id === 'OLATHE:ONW:FOOTBALL' ? { ...team, id: 'OLATHE:ONW:FOOTBALL:VARSITY' } : team;
      return { ...game, sport: game.sport || 'Football', homeTeam: mapTeam(game.homeTeam), awayTeam: mapTeam(game.awayTeam), school: mapTeam(game.school) };
    }).filter((game, index, all) => game.id && all.findIndex(item => item.id === game.id) === index);
  },
  standings: async () => [],
  teams: async () => teams
};
