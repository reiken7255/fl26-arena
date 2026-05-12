import { useState, useMemo } from 'react';
import { memo } from 'react';
import { normalizeParticipants, calculateStandings, getLogoUrl } from '../utils/tournamentUtils';

const ChampionsTab = memo(({ tournaments, getTeamData }) => (
  <div className="space-y-12">
    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
      <h2 className="text-3xl font-black text-center mb-12 text-[#0f172a]">Tournament Champions</h2>
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map(tournament => {
            const participants = normalizeParticipants(tournament.participants);
            const standings = calculateStandings(tournament.matches, participants);
            const champion = standings[0];
            const championData = participants.find(p => p.name === champion?.team);
            
            return (
              <div key={tournament.id} className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-[3rem] border-2 border-yellow-200 shadow-lg">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0f172a]">{tournament.name}</h3>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">{tournament.season} Season</p>
                  {champion && (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        <img src={getLogoUrl(championData?.teamId, champion.team)} className="h-12 w-12 rounded-xl border-2 border-white shadow-md" alt="champion" />
                        <div className="text-left">
                          <p className="text-lg font-black text-[#0f172a]">{getTeamData(championData?.teamId)?.name || "N/A"}</p>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{champion.team}</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl">
                        <p className="text-2xl font-black text-amber-600">{champion.pts} PTS</p>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">W: {champion.win} D: {champion.draw} L: {champion.lose}</p>
                      </div>
                    </>
                  )}
                  <p className="text-sm font-bold text-slate-600">{tournament.matches.length} Matches Played</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-6xl mb-6 block opacity-20">🏆</span>
          <p className="text-xl font-black text-slate-400 uppercase tracking-widest">No tournaments completed yet</p>
          <p className="text-slate-500 mt-4">Complete tournaments to see champions here</p>
        </div>
      )}
    </div>
  </div>
));

const HistoryTab = memo(({ tournaments }) => (
  <div className="space-y-12">
    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
      <h2 className="text-3xl font-black text-center mb-12 text-[#0f172a]">Tournament History</h2>
      {tournaments.length > 0 ? (
        <div className="space-y-6">
          {tournaments.sort((a, b) => new Date(b.season) - new Date(a.season)).map((tournament, index) => (
            <div key={tournament.id} className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0f172a]">{tournament.name}</h3>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{tournament.season} Season</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-lg font-black text-[#0f172a]">{tournament.participants.length} Participants</p>
                  <p className="text-sm font-bold text-slate-600">{tournament.matches.length} Matches</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-6xl mb-6 block opacity-20">📜</span>
          <p className="text-xl font-black text-slate-400 uppercase tracking-widest">No tournament history yet</p>
          <p className="text-slate-500 mt-4">Create and complete tournaments to build history</p>
        </div>
      )}
    </div>
  </div>
));

const RecordsTab = memo(({ tournaments }) => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
        <h2 className="text-2xl font-black mb-8 text-[#0f172a]">All-Time Statistics</h2>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
            <p className="text-3xl font-black text-blue-600">{tournaments.length}</p>
            <p className="text-sm font-black text-blue-800 uppercase tracking-widest">Total Tournaments</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <p className="text-3xl font-black text-green-600">{tournaments.reduce((acc, t) => acc + t.matches.length, 0)}</p>
            <p className="text-sm font-black text-green-800 uppercase tracking-widest">Total Matches Played</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
            <p className="text-3xl font-black text-purple-600">{tournaments.reduce((acc, t) => acc + t.participants.length, 0)}</p>
            <p className="text-sm font-black text-purple-800 uppercase tracking-widest">Total Participants</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
        <h2 className="text-2xl font-black mb-8 text-[#0f172a]">Top Performers</h2>
        <div className="space-y-4">
          {(() => {
            const allStandings = [];
            tournaments.forEach(tournament => {
              const participants = normalizeParticipants(tournament.participants);
              const standings = calculateStandings(tournament.matches, participants);
              standings.forEach(row => {
                allStandings.push({
                  ...row,
                  tournament: tournament.name,
                  season: tournament.season
                });
              });
            });
            
            const topPerformers = allStandings
              .sort((a, b) => b.pts - a.pts)
              .slice(0, 5);
            
            return topPerformers.length > 0 ? topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-400'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-black text-[#0f172a]">{performer.team}</p>
                    <p className="text-xs font-bold text-slate-600">{performer.tournament} - {performer.season}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-pink-600">{performer.pts} pts</p>
                  <p className="text-xs font-black text-slate-500">W: {performer.win} D: {performer.draw} L: {performer.lose}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-400 font-black">No performance data yet</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  </div>
));

const HallOfFame = ({ tournaments, getTeamData }) => {
  const [hallOfFameTab, setHallOfFameTab] = useState("champions");

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-black tracking-tighter text-[#0f172a]">Hall of Fame</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Celebrate tournament history, legendary champions, and all-time records</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white p-2 rounded-2xl shadow-lg">
          {["champions", "history", "records"].map(tab => (
            <button
              key={tab}
              onClick={() => setHallOfFameTab(tab)}
              className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                hallOfFameTab === tab ? "bg-[#1e293b] text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "champions" ? "🏆 CHAMPIONS" : tab === "history" ? "📜 HISTORY" : "📊 RECORDS"}
            </button>
          ))}
        </div>
      </div>

      {hallOfFameTab === "champions" && <ChampionsTab tournaments={tournaments} getTeamData={getTeamData} />}
      {hallOfFameTab === "history" && <HistoryTab tournaments={tournaments} />}
      {hallOfFameTab === "records" && <RecordsTab tournaments={tournaments} />}
    </div>
  );
};

export default HallOfFame;
