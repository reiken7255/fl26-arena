import { memo } from 'react';
import { getLogoUrl } from '../utils/tournamentUtils';

const StandingsRow = memo(({ row, index, participant, getTeamData }) => (
  <tr className="hover:bg-slate-50 group transition-all">
    <td className="px-12 py-8 flex items-center gap-10">
      <span className={`text-xs font-black ${index < 3 ? "text-pink-600" : "text-slate-300"} w-6`}>{index + 1}</span>
      <img src={getLogoUrl(participant?.teamId, row.team)} className="h-16 w-16 rounded-2xl border bg-white shadow-sm p-0.5" alt="logo" />
      <div>
        <p className="text-xl font-black tracking-tight text-[#0f172a] leading-none uppercase">{getTeamData(participant?.teamId)?.name || "N/A"}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">PLAYER: {row.team}</p>
      </div>
    </td>
    <td className="px-10 text-sm font-bold text-slate-500">{row.played}</td>
    <td className="px-10 text-sm font-bold text-slate-500">{row.win}</td>
    <td className="px-10 text-sm font-bold text-slate-500">{row.draw}</td>
    <td className="px-10 text-sm font-bold text-slate-500">{row.lose}</td>
    <td className="px-12 text-2xl font-black text-pink-600 text-center">{row.pts}</td>
  </tr>
));

export default StandingsRow;
