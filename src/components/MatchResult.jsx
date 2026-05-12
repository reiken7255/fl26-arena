import { memo } from 'react';
import { getLogoUrl } from '../utils/tournamentUtils';

const MatchResult = memo(({ match, participants, getTeamData }) => {
  const homeParticipant = participants.find(x => x.name === match.home);
  const awayParticipant = participants.find(x => x.name === match.away);
  
  return (
    <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[3rem] border border-slate-100 group">
      <div className="flex-1 flex items-center justify-end gap-6 text-right">
        <span className="text-sm font-black uppercase tracking-tight text-slate-700">{getTeamData(homeParticipant?.teamId)?.name}</span>
        <img src={getLogoUrl(homeParticipant?.teamId, match.home)} className="h-12 w-12 rounded-xl" alt="h" />
      </div>
      <div className="mx-12 bg-white border border-slate-200 px-10 py-4 rounded-2xl font-black text-3xl tracking-tighter shadow-sm">{match.homeGoals} - {match.awayGoals}</div>
      <div className="flex-1 flex items-center gap-6 text-left">
        <img src={getLogoUrl(awayParticipant?.teamId, match.away)} className="h-12 w-12 rounded-xl" alt="a" />
        <span className="text-sm font-black uppercase tracking-tight text-slate-700">{getTeamData(awayParticipant?.teamId)?.name}</span>
      </div>
    </div>
  );
});

export default MatchResult;
