import { useState, useMemo, useCallback } from 'react';
import { memo } from 'react';
import TournamentCard from '../components/TournamentCard';
import StandingsRow from '../components/StandingsRow';
import MatchResult from '../components/MatchResult';
import { normalizeParticipants, calculateStandings, getLogoUrl } from '../utils/tournamentUtils';

const TournamentList = memo(({ tournaments, selectedId, onTournamentSelect }) => (
  <aside className="col-span-3 space-y-6">
    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-8">ACTIVE TOURNAMENTS</h3>
    <div className="space-y-2">
      {tournaments.map(t => (
        <TournamentCard 
          key={t.id} 
          tournament={t} 
          isSelected={selectedId === t.id}
          onClick={onTournamentSelect}
        />
      ))}
    </div>
  </aside>
));

const TournamentDetails = memo(({ selectedTournament, arenaSubTab, setArenaSubTab, matchForm, setMatchForm, onAddMatch, currentUser, tournamentParticipants, standings, unplayedFixtures, getTeamData }) => {
  if (!selectedTournament) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
        <span className="text-8xl mb-8 opacity-5">🎮</span>
        <p className="font-black uppercase tracking-[0.8em] text-[10px] text-slate-300">SELECT TOURNAMENT</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{selectedTournament.name}</h2>
          <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mt-2">{selectedTournament.matches.length} MATCHES RECORDED</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {["standings", "matches"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setArenaSubTab(tab)} 
              className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                arenaSubTab === tab ? "bg-white text-[#0f172a] shadow-lg" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "standings" ? "STANDINGS" : "MATCHES"}
            </button>
          ))}
        </div>
      </div>

      {currentUser && unplayedFixtures.length > 0 && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-pink-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] font-black text-9xl text-pink-600 select-none">RESULT</div>
          <h4 className="text-[11px] font-black uppercase text-pink-600 tracking-[0.4em] mb-10 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" /> LIVE MATCH BROADCAST
          </h4>
          <form onSubmit={onAddMatch} className="grid grid-cols-5 gap-6 items-end relative z-10">
            <div className="col-span-1 space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">HOME</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase appearance-none" 
                value={matchForm.home} 
                onChange={e => setMatchForm({ ...matchForm, home: e.target.value })} 
                required
              >
                {tournamentParticipants.map(p => (
                  <option key={p.name} value={p.name} disabled={p.name === matchForm.away}>
                    {getTeamData(p.teamId)?.name || "N/A"} ({p.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-4 mb-1">
              <input 
                type="number" 
                className="w-24 bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-center text-4xl font-black shadow-inner focus:ring-4 ring-pink-50 outline-none" 
                value={matchForm.homeGoals} 
                onChange={e => setMatchForm({ ...matchForm, homeGoals: Number(e.target.value) })} 
              />
              <span className="font-black text-slate-200 text-2xl">VS</span>
              <input 
                type="number" 
                className="w-24 bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-center text-4xl font-black shadow-inner focus:ring-4 ring-pink-50 outline-none" 
                value={matchForm.awayGoals} 
                onChange={e => setMatchForm({ ...matchForm, awayGoals: Number(e.target.value) })} 
              />
            </div>
            <div className="col-span-1 space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">AWAY</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase appearance-none" 
                value={matchForm.away} 
                onChange={e => setMatchForm({ ...matchForm, away: e.target.value })} 
                required
              >
                {tournamentParticipants.map(p => (
                  <option key={p.name} value={p.name} disabled={p.name === matchForm.home}>
                    {getTeamData(p.teamId)?.name || "N/A"} ({p.name})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="col-span-1 bg-pink-600 text-white h-[68px] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-100">
              SUBMIT
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
        {arenaSubTab === "standings" && (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1e293b] text-white text-[10px] font-black uppercase tracking-[0.3em]">
                <th className="px-12 py-6">TEAM / PLAYER</th>
                <th className="px-10">P</th>
                <th className="px-10">W</th>
                <th className="px-10">D</th>
                <th className="px-10">L</th>
                <th className="px-12 text-pink-500 text-center">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {standings.map((row, i) => {
                const participant = tournamentParticipants.find(x => x.name === row.team);
                return (
                  <StandingsRow 
                    key={i} 
                    row={row} 
                    index={i} 
                    participant={participant}
                    getTeamData={getTeamData}
                  />
                );
              })}
            </tbody>
          </table>
        )}

        {arenaSubTab === "matches" && (
          <div className="p-16 space-y-16">
            <div className="space-y-8">
              <p className="text-[10px] font-black uppercase text-pink-600 tracking-[0.4em] ml-8">RECENT RESULTS</p>
              <div className="grid gap-4">
                {selectedTournament.matches.slice().reverse().map((m, idx) => (
                  <MatchResult 
                    key={idx} 
                    match={m} 
                    participants={tournamentParticipants}
                    getTeamData={getTeamData}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-8">UPCOMING FIXTURES</p>
              <div className="grid gap-4">
                {unplayedFixtures.map((f, idx) => {
                  const hp = tournamentParticipants.find(x => x.name === f.home);
                  const ap = tournamentParticipants.find(x => x.name === f.away);
                  return (
                    <div key={idx} className="flex items-center justify-between p-8 bg-white rounded-[3rem] border border-slate-100">
                      <div className="flex-1 flex items-center justify-end gap-6 text-right">
                        <span className="text-sm font-black uppercase tracking-tight text-slate-300">{getTeamData(hp?.teamId)?.name}</span>
                        <img src={getLogoUrl(hp?.teamId, f.home)} className="h-10 w-10 rounded-xl grayscale opacity-10" alt="h" />
                      </div>
                      <div className="mx-12 bg-slate-50 px-8 py-3 rounded-2xl font-black text-[10px] text-slate-200 tracking-widest">VS</div>
                      <div className="flex-1 flex items-center gap-6 text-left">
                        <img src={getLogoUrl(ap?.teamId, f.away)} className="h-10 w-10 rounded-xl grayscale opacity-10" alt="a" />
                        <span className="text-sm font-black uppercase tracking-tight text-slate-300">{getTeamData(ap?.teamId)?.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

const Tournaments = ({ tournaments, selectedId, setSelectedId, matchForm, setMatchForm, onAddMatch, currentUser, getTeamData }) => {
  const [arenaSubTab, setArenaSubTab] = useState("standings");

  const selectedTournament = useMemo(() => tournaments.find((t) => t.id === selectedId), [tournaments, selectedId]);
  const tournamentParticipants = useMemo(() => normalizeParticipants(selectedTournament?.participants), [selectedTournament]);
  const standings = useMemo(() => (selectedTournament ? calculateStandings(selectedTournament.matches, tournamentParticipants) : []), [selectedTournament, tournamentParticipants]);

  const fixtures = useMemo(() => {
    if (!tournamentParticipants.length) return [];
    const list = [];
    for (let i = 0; i < tournamentParticipants.length; i++) {
      for (let j = 0; j < tournamentParticipants.length; j++) {
        if (i === j) continue;
        list.push({ home: tournamentParticipants[i].name, away: tournamentParticipants[j].name });
      }
    }
    return list;
  }, [tournamentParticipants]);

  const unplayedFixtures = useMemo(() => {
    if (!selectedTournament) return [];
    return fixtures.filter(f => !selectedTournament.matches.some(m => m.home === f.home && m.away === f.away));
  }, [fixtures, selectedTournament]);

  const handleTournamentSelect = useCallback((id) => {
    setSelectedId(id);
    setArenaSubTab("standings");
  }, [setSelectedId]);

  return (
    <div className="grid grid-cols-12 gap-12 animate-in fade-in duration-500">
      <TournamentList 
        tournaments={tournaments} 
        selectedId={selectedId} 
        onTournamentSelect={handleTournamentSelect}
      />
      <div className="col-span-9 space-y-10">
        <TournamentDetails 
          selectedTournament={selectedTournament}
          arenaSubTab={arenaSubTab}
          setArenaSubTab={setArenaSubTab}
          matchForm={matchForm}
          setMatchForm={setMatchForm}
          onAddMatch={onAddMatch}
          currentUser={currentUser}
          tournamentParticipants={tournamentParticipants}
          standings={standings}
          unplayedFixtures={unplayedFixtures}
          getTeamData={getTeamData}
        />
      </div>
    </div>
  );
};

export default Tournaments;
