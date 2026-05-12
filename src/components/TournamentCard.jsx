import { memo } from 'react';

const TournamentCard = memo(({ tournament, isSelected, onClick }) => (
  <button 
    onClick={() => onClick(tournament.id)} 
    className={`w-full text-left p-7 rounded-[2.5rem] border transition-all ${
      isSelected ? "bg-[#1e293b] border-[#1e293b] text-white shadow-xl scale-105" : "bg-white border-slate-100 hover:border-pink-200"
    }`}
  >
    <p className="text-xs font-black uppercase tracking-wider truncate leading-none">{tournament.name}</p>
    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{tournament.season} SEASON</p>
  </button>
));

export default TournamentCard;
