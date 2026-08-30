export const endpoint = async url => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { headers:{ Accept:'application/json' }, signal:controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('[SkyStation Sports] Provider request failed', { url, message:error.message });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
export const isoDate = value => value.toISOString().slice(0, 10);
const valueOr = (value, fallback) => value == null ? fallback : value;
export const normalizeEspnGame = (event, league) => {
  const competition=event.competitions?.[0], competitors=competition?.competitors || [];
  const home=competitors.find(team => team.homeAway === 'home'), away=competitors.find(team => team.homeAway === 'away');
  const type=(competition?.status || event.status || {}).type || {};
  const team = entry => entry ? { id:`${league}:${entry.team.id}`, providerId:entry.team.id, name:entry.team.displayName, shortName:entry.team.shortDisplayName, abbreviation:entry.team.abbreviation, logo:entry.team.logo, record:valueOr(entry.records?.find(record => record.name === 'overall')?.summary, null) } : null;
  return { id:`${league}:${event.id}`, providerId:event.id, league, sport:league, date:event.date, status:type.state === 'in' ? 'live' : type.completed ? 'final' : type.name?.includes('POSTPONED') ? 'postponed' : type.name?.includes('CANCELED') ? 'canceled' : 'scheduled', statusDetail:type.shortDetail || type.detail || type.description || 'Unavailable', homeTeam:team(home), awayTeam:team(away), homeScore:valueOr(home?.score, null), awayScore:valueOr(away?.score, null), venue:valueOr(competition?.venue?.fullName, null), broadcast:competition?.broadcast || competition?.broadcasts?.[0]?.names?.join(', ') || null, periods:valueOr(competition?.competitors?.[0]?.linescores?.map((period, index) => ({ label:String(index + 1), home:valueOr(home?.linescores?.[index]?.displayValue, null), away:valueOr(away?.linescores?.[index]?.displayValue, null) })), []), leaders:competition?.leaders || [] };
};
