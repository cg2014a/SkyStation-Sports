import{endpoint,normalizeEspnGame,isoDate}from'./provider-utils.js';

const workerBase=typeof window!=='undefined'&&['localhost','127.0.0.1'].includes(window.location.hostname)?'http://127.0.0.1:8787':'https://skystation-sports-gateway.cgarrett4.workers.dev';

const normalize=event=>{
  const game=normalizeEspnGame(event,'NCAAF'),competition=event.competitions?.[0],competitors=competition?.competitors||[];
  const enrich=team=>{
    if(!team)return null;
    const source=competitors.find(entry=>entry.team?.id===team.providerId);
    return {...team,league:'NCAAF',ranking:source?.curatedRank?.current??source?.rank??null,conference:source?.team?.conference?.name??source?.conference?.name??source?.team?.conferenceId??source?.conferenceId??null};
  };
  return {...game,homeTeam:enrich(game.homeTeam),awayTeam:enrich(game.awayTeam)};
};

const mapTeams=data=>(data.teams||[]).map(team=>({id:`NCAAF:${team.id}`,providerId:team.id,league:'NCAAF',name:team.displayName||team.name,abbreviation:team.abbreviation,logo:team.logo||null,conference:team.conference||null}));

export default{league:'NCAAF',games:async date=>{const data=await endpoint(`${workerBase}/api/ncaaf/scores?date=${isoDate(date).replaceAll('-','')}`);return(Array.isArray(data)?data:data.events||[]).map(normalize)},standings:async()=>endpoint(`${workerBase}/api/ncaaf/standings`),teams:async()=>mapTeams(await endpoint(`${workerBase}/api/ncaaf/teams`))};
