import { endpoint, isoDate } from './provider-utils.js';

const workerBase = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://127.0.0.1:8787'
  : 'https://skystation-sports-gateway.cgarrett4.workers.dev';

const school = { id: 'OLATHE:ONW:FOOTBALL', providerId: '1240', league: 'OLATHE', name: 'Olathe Northwest High School', abbreviation: 'ONW', logo: null };

export default {
  league: 'OLATHE',
  games: async date => {
    const current = isoDate(date).replaceAll('-', '');
    const requests = [endpoint(`${workerBase}/api/olathe/scores?date=${current}`)];
    if (typeof window !== 'undefined' && window.location.hash === '#home') {
      const previous = new Date(date);
      previous.setUTCDate(previous.getUTCDate() - 1);
      requests.push(endpoint(`${workerBase}/api/olathe/scores?date=${isoDate(previous).replaceAll('-', '')}`));
    }
    const responses = await Promise.all(requests);
    return responses.flatMap(data => data.games || []);
  },
  standings: async () => [],
  teams: async () => [school]
};
