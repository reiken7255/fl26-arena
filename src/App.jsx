import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { useDiscordMembers } from "./hooks/useDiscordMembers";

const teamLogoMap = {
  "ars": "9825", "mci": "8456", "liv": "8650", "mun": "10260", "che": "8455", "tot": "8586", "avl": "10252", "new": "10261", "whu": "8191", "bha": "10204",
  "rma": "8633", "bar": "8634", "atm": "9906", "rso": "8560", "villarreal": "10205", "sevilla": "8302", "betis": "8603",
  "bay": "9823", "bvb": "9789", "lev": "8178", "rbl": "178474", "stuttgart": "10269",
  "int": "8636", "juv": "9885", "acm": "8564", "nap": "9875", "rom": "8686", "laz": "8543", "ata": "8524",
  "psg": "9847", "monaco": "9831", "mar": "8592", "lyon": "8027",
  "gal": "10077", "fen": "8695", "bes": "8659", "tra": "8654", "bas": "284351", "eye": "686733", "sam": "8352",
  "aln": "247076", "alhi": "102431", "alit": "102430", "al ahli": "102429",
  "mia": "906233", "lafc": "808930", "lag": "6363"
};

function getLogoUrl(teamId, fallbackName) {
  if (teamId && teamLogoMap[teamId]) {
    return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamLogoMap[teamId]}.png`;
  }
  const seed = encodeURIComponent(fallbackName || "U");
  return `https://ui-avatars.com/api/?name=${seed}&background=ec4899&color=fff&rounded=true&bold=true`;
}

const normalizeParticipants = (participants) => {
  if (!participants || !Array.isArray(participants)) return [];
  return participants.map(p => {
    let name = "Unknown"; let leagueId = ""; let teamId = "";
    if (typeof p === 'string') { name = p; }
    else if (p && typeof p === 'object') {
      name = String(p.name || "Unknown");
      leagueId = String(p.leagueId || "");
      teamId = String(p.teamId || "");
    }
    return { name, leagueId, teamId };
  });
};

const createParticipant = () => ({ name: "", leagueId: "", teamId: "" });
const initialForm = { name: "", season: "2026", type: "league", participants: [createParticipant(), createParticipant()] };
const initialAdminForm = { displayName: "", username: "", password: "" };

function calculateStandings(matches = [], participants = []) {
  const table = Object.fromEntries(participants.map((p) => [p.name, { team: p.name, teamId: p.teamId, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]));
  for (const match of (matches || [])) {
    const h = table[match.home]; const a = table[match.away];
    if (!h || !a) continue;
    h.played += 1; a.played += 1; h.gf += Number(match.homeGoals); h.ga += Number(match.awayGoals); a.gf += Number(match.awayGoals); a.ga += Number(match.homeGoals);
    if (Number(match.homeGoals) > Number(match.awayGoals)) { h.win += 1; a.lose += 1; h.pts += 3; }
    else if (Number(match.homeGoals) < Number(match.awayGoals)) { a.win += 1; h.lose += 1; a.pts += 3; }
    else { h.draw += 1; a.draw += 1; h.pts += 1; a.pts += 1; }
  }
  return Object.values(table).map((row) => ({ ...row, gd: row.gf - row.ga })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

// Memoized components for performance
const TournamentCard = memo(({ tournament, isSelected, onClick }) => (
  <button onClick={() => onClick(tournament.id)} className={`w-full text-left p-7 rounded-[2.5rem] border transition-all ${isSelected ? "bg-[#1e293b] border-[#1e293b] text-white shadow-xl scale-105" : "bg-white border-slate-100 hover:border-pink-200"}`}>
    <p className="text-xs font-black uppercase tracking-wider truncate leading-none">{tournament.name}</p>
    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{tournament.season} SEASON</p>
  </button>
));

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

function App() {
  console.log('App component rendered');
  const [leagues, setLeagues] = useState([]); const [teams, setTeams] = useState([]); const [tournaments, setTournaments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(initialForm); const [adminCreateForm, setAdminCreateForm] = useState(initialAdminForm);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [selectedId, setSelectedId] = useState("");
  const [matchForm, setMatchForm] = useState({ home: "", away: "", homeGoals: 0, awayGoals: 0 });
  const [loading, setLoading] = useState(false); const [notice, setNotice] = useState(""); const [activeTab, setActiveTab] = useState("dashboard");
  const [arenaSubTab, setArenaSubTab] = useState("standings"); const [hallOfFameTab, setHallOfFameTab] = useState("champions");
  
  // Discord members (hardcoded configuration)
  const { members: discordMembers, loading: discordLoading, error: discordError } = useDiscordMembers();

  const selectedTournament = useMemo(() => tournaments.find((t) => t.id === selectedId), [tournaments, selectedId]);
  const tournamentParticipants = useMemo(() => normalizeParticipants(selectedTournament?.participants), [selectedTournament]);
  const standings = useMemo(() => (selectedTournament ? calculateStandings(selectedTournament.matches, tournamentParticipants) : []), [selectedTournament, tournamentParticipants]);
  const activeLeagues = useMemo(() => leagues.filter(l => teams.some(t => t.leagueId === l.id)), [leagues, teams]);
  const getTeamData = useCallback((teamId) => teams.find(t => t.id === teamId), [teams]);

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

  const apiRequest = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, options); const raw = await response.text(); let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
      return { ok: response.ok, data };
    } catch { return { ok: false }; }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [ld, td, tr, me] = await Promise.all([
      fetch("/data/fl26-leagues.json").then(r => r.json()),
      fetch("/data/fl26-teams.json").then(r => r.json()),
      fetch("/.netlify/functions/tournaments").then(r => r.json()),
      fetch("/.netlify/functions/auth-me").then(r => r.json()).catch(() => null)
    ]);
    if (ld) setLeagues(ld.leagues || []); if (td) setTeams(td.teams || []); if (tr) setTournaments(tr.tournaments || []);
    setCurrentUser(me?.user || null); if (me?.user) { const ad = await fetch("/.netlify/functions/admin-users").then(r => r.json()); setAdmins(ad?.users || []); }
    setLoading(false);
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => { if (notice) { const t = setTimeout(() => setNotice(""), 3000); return () => clearTimeout(t); } }, [notice]);

  useEffect(() => {
    if (unplayedFixtures.length > 0) {
      const first = unplayedFixtures[0];
      setMatchForm(prev => ({ ...prev, home: first.home, away: first.away }));
    } else {
      setMatchForm(prev => ({ ...prev, home: "", away: "" }));
    }
  }, [unplayedFixtures, selectedId]);

  const addMatch = async (e) => {
    e.preventDefault(); if (!selectedTournament) return;
    if (matchForm.home === matchForm.away) { setNotice("A team cannot play itself!"); return; }
    const r = await apiRequest("/.netlify/functions/tournaments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedTournament.id, action: "addMatch", match: matchForm }) });
    if (r.ok) { setNotice("Result Saved!"); refreshAll(); setMatchForm(prev => ({ ...prev, homeGoals: 0, awayGoals: 0 })); }
  };

  const createTournament = async (e) => {
    e.preventDefault(); setLoading(true);
    const r = await apiRequest("/.netlify/functions/tournaments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type: "league" }) });
    setLoading(false); if (r.ok) { setForm(initialForm); setActiveTab("tournaments"); refreshAll(); }
  };

  const createAdmin = async (e) => {
    e.preventDefault(); setLoading(true);
    const r = await apiRequest("/.netlify/functions/admin-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(adminCreateForm) });
    setLoading(false); if (r.ok) { setAdminCreateForm(initialAdminForm); setNotice("Admin Created!"); refreshAll(); }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tournaments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fl26_arenas_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importJson = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const items = JSON.parse(event.target.result);
        await apiRequest("/.netlify/functions/tournaments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "any", action: "bulkImport", items }) });
        setNotice("Import Successful!"); refreshAll();
      } catch { setNotice("Invalid JSON file"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-12 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab("dashboard")}>
            <img src="/logo.png" className="h-14 w-auto transition-transform group-hover:scale-105" alt="Logo" />
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <h1 className="text-xl font-black tracking-tighter text-[#0f172a]">FL - PES TOURNAMENTS</h1>
          </div>
          <nav className="hidden lg:flex gap-4">
            {[{ id: "dashboard", l: "DASHBOARD" }, { id: "tournaments", l: "TOURNAMENTS" }, { id: "halloffame", l: "HALL OF FAME" }, { id: "create", l: "NEW TOURNAMENT", admin: true }, { id: "admin", l: "ADMIN PORTAL", admin: true }].map(t => (
              (!t.admin || currentUser) && <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest transition-all ${activeTab === t.id ? "bg-[#1e293b] text-white" : "text-slate-400 hover:text-slate-900"}`}>{t.l}</button>
            ))}
          </nav>
        </div>
        <div>
          {currentUser ? <button onClick={async () => { await fetch("/.netlify/functions/auth-logout", { method: "POST" }); refreshAll(); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 tracking-widest">LOGOUT</button> : <button onClick={() => setActiveTab("login")} className="px-8 py-3 bg-[#1e293b] text-white rounded-2xl text-[11px] font-black tracking-widest shadow-xl">SIGN IN</button>}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-12 lg:p-16">
        {notice && <div className="fixed top-24 right-12 bg-pink-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl text-[10px] font-black uppercase tracking-widest z-[100] animate-in slide-in-from-right">{notice}</div>}

        {activeTab === "dashboard" && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <div className="text-center space-y-8">
              <h1 className="text-6xl font-black tracking-tighter text-[#0f172a]">Tournament Center</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">Manage your football tournaments with ease</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <button 
                onClick={() => setActiveTab("tournaments")} 
                className="group bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-pink-200"
              >
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#0f172a]">Current Tournament</h3>
                  <p className="text-slate-600 leading-relaxed">View active tournaments, standings, and live match results</p>
                  <div className="text-pink-600 font-black text-sm uppercase tracking-widest">View Now →</div>
                </div>
              </button>

              <button 
                onClick={() => currentUser ? setActiveTab("create") : setActiveTab("login")}
                className="group bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-blue-200"
              >
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#0f172a]">Register for Next Tournament</h3>
                  <p className="text-slate-600 leading-relaxed">Create or join upcoming tournaments and register participants</p>
                  <div className="text-blue-600 font-black text-sm uppercase tracking-widest">Register →</div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab("halloffame")}
                className="group bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-green-200"
              >
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <span className="text-3xl">🏛️</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#0f172a]">Hall of Fame</h3>
                  <p className="text-slate-600 leading-relaxed">View tournament history, champions, and all-time records</p>
                  <div className="text-green-600 font-black text-sm uppercase tracking-widest">View Now →</div>
                </div>
              </button>
            </div>

            <div className="text-center space-y-4 mt-16">
              <div className="flex justify-center gap-8 text-slate-400">
                <div className="text-center">
                  <p className="text-3xl font-black text-[#0f172a]">{tournaments.length}</p>
                  <p className="text-xs font-black uppercase tracking-widest">Active Tournaments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-[#0f172a]">{tournaments.reduce((acc, t) => acc + t.matches.length, 0)}</p>
                  <p className="text-xs font-black uppercase tracking-widest">Matches Played</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-[#0f172a]">{admins.length || 1}</p>
                  <p className="text-xs font-black uppercase tracking-widest">Administrators</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tournaments" && (
          <div className="grid grid-cols-12 gap-12 animate-in fade-in duration-500">
            <aside className="col-span-3 space-y-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-8">ACTIVE TOURNAMENTS</h3>
              <div className="space-y-2">
                {tournaments.map(t => (
                  <TournamentCard 
                    key={t.id} 
                    tournament={t} 
                    isSelected={selectedId === t.id}
                    onClick={(id) => { setSelectedId(id); setArenaSubTab("standings"); }}
                  />
                ))}
              </div>
            </aside>

            <div className="col-span-9 space-y-10">
              {selectedTournament ? (
                <>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedTournament.name}</h2>
                      <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest mt-2">{selectedTournament.matches.length} MATCHES RECORDED</p>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      {["standings", "matches"].map(tab => (
                        <button key={tab} onClick={() => setArenaSubTab(tab)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${arenaSubTab === tab ? "bg-white text-[#0f172a] shadow-lg" : "text-slate-400 hover:text-slate-600"}`}>{tab === "standings" ? "STANDINGS" : "MATCHES"}</button>
                      ))}
                    </div>
                  </div>

                  {currentUser && unplayedFixtures.length > 0 && (
                    <div className="bg-white p-12 rounded-[3.5rem] border-2 border-pink-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] font-black text-9xl text-pink-600 select-none">RESULT</div>
                      <h4 className="text-[11px] font-black uppercase text-pink-600 tracking-[0.4em] mb-10 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" /> LIVE MATCH BROADCAST</h4>
                      <form onSubmit={addMatch} className="grid grid-cols-5 gap-6 items-end relative z-10">
                        <div className="col-span-1 space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">HOME</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase appearance-none" value={matchForm.home} onChange={e => setMatchForm({ ...matchForm, home: e.target.value })} required>
                            {tournamentParticipants.map(p => <option key={p.name} value={p.name} disabled={p.name === matchForm.away}>{getTeamData(p.teamId)?.name || "N/A"} ({p.name})</option>)}
                          </select>
                        </div>
                        <div className="col-span-2 flex items-center justify-center gap-4 mb-1">
                          <input type="number" className="w-24 bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-center text-4xl font-black shadow-inner focus:ring-4 ring-pink-50 outline-none" value={matchForm.homeGoals} onChange={e => setMatchForm({ ...matchForm, homeGoals: Number(e.target.value) })} />
                          <span className="font-black text-slate-200 text-2xl">VS</span>
                          <input type="number" className="w-24 bg-slate-50 border border-slate-200 rounded-[2rem] p-5 text-center text-4xl font-black shadow-inner focus:ring-4 ring-pink-50 outline-none" value={matchForm.awayGoals} onChange={e => setMatchForm({ ...matchForm, awayGoals: Number(e.target.value) })} />
                        </div>
                        <div className="col-span-1 space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">AWAY</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase appearance-none" value={matchForm.away} onChange={e => setMatchForm({ ...matchForm, away: e.target.value })} required>
                            {tournamentParticipants.map(p => <option key={p.name} value={p.name} disabled={p.name === matchForm.home}>{getTeamData(p.teamId)?.name || "N/A"} ({p.name})</option>)}
                          </select>
                        </div>
                        <button type="submit" className="col-span-1 bg-pink-600 text-white h-[68px] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-100">SUBMIT</button>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
                    {arenaSubTab === "standings" && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#1e293b] text-white text-[10px] font-black uppercase tracking-[0.3em]">
                            <th className="px-12 py-6">TEAM / PLAYER</th><th className="px-10">P</th><th className="px-10">W</th><th className="px-10">D</th><th className="px-10">L</th><th className="px-12 text-pink-500 text-center">PTS</th>
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
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                  <span className="text-8xl mb-8 opacity-5">🎮</span>
                  <p className="font-black uppercase tracking-[0.8em] text-[10px] text-slate-300">SELECT TOURNAMENT</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="max-w-4xl mx-auto bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl animate-in fade-in duration-700">
            <h2 className="text-4xl font-black mb-10 tracking-tighter">Initialize Tournament</h2>
            <form onSubmit={createTournament} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Tournament Title</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" placeholder="e.g. Pro League 2026" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              
              {discordError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-black">
                  Discord Error: {discordError}
                </div>
              )}
              
              <div className="space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-black uppercase text-pink-600 tracking-widest ml-4">Player Registry</h3>
                  <button type="button" onClick={() => setForm({ ...form, participants: [...form.participants, createParticipant()] })} className="bg-pink-50 text-pink-600 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-100 transition-all">+ Add New</button>
                </div>
                {form.participants.map((p, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                    {discordMembers.length > 0 ? (
                      <select 
                        className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-bold" 
                        value={p.name} 
                        onChange={e => { const list = [...form.participants]; list[idx].name = e.target.value; setForm({ ...form, participants: list }); }} 
                        required
                      >
                        <option value="">Select Discord Member</option>
                        {discordMembers.map(member => (
                          <option key={member.id} value={member.displayName}>
                            {member.displayName} (@{member.username})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-bold" 
                        placeholder={discordLoading ? "Loading Discord members..." : "Player Name"} 
                        value={p.name} 
                        onChange={e => { const list = [...form.participants]; list[idx].name = e.target.value; setForm({ ...form, participants: list }); }} 
                        disabled={discordLoading}
                        required 
                      />
                    )}
                    <select className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase" value={p.leagueId} onChange={e => { const list = [...form.participants]; list[idx].leagueId = e.target.value; list[idx].teamId = ""; setForm({ ...form, participants: list }); }} required>
                      <option value="">League</option>
                      {activeLeagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <select className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase" value={p.teamId} onChange={e => { const list = [...form.participants]; list[idx].teamId = e.target.value; setForm({ ...form, participants: list }); }} disabled={!p.leagueId} required>
                      <option value="">Team</option>
                      {teams.filter(t => t.leagueId === p.leagueId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button type="button" onClick={() => { if (form.participants.length > 2) { const list = form.participants.filter((_, i) => i !== idx); setForm({ ...form, participants: list }); } }} className="text-slate-200 hover:text-rose-600 font-black text-xl px-2">✕</button>
                  </div>
                ))}
                {discordLoading && (
                  <div className="text-center text-blue-600 text-xs font-black animate-pulse">
                    Loading Discord members...
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-[#1e293b] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] shadow-xl">START TOURNAMENT</button>
            </form>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="grid grid-cols-2 gap-10">
            <section className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-8 shadow-sm">
              <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Authorized Access</h2>
              <form onSubmit={createAdmin} className="space-y-4">
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" placeholder="Full Name" value={adminCreateForm.displayName} onChange={e => setAdminCreateForm({ ...adminCreateForm, displayName: e.target.value })} required />
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" placeholder="Username" value={adminCreateForm.username} onChange={e => setAdminCreateForm({ ...adminCreateForm, username: e.target.value })} required />
                <input type="password" title="password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" placeholder="Password" value={adminCreateForm.password} onChange={e => setAdminCreateForm({ ...adminCreateForm, password: e.target.value })} required />
                <button className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">REGISTER ADMIN</button>
              </form>
            </section>
            <section className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Maintenance & Data</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={exportJson} className="bg-slate-900 text-white p-6 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all">EXPORT JSON</button>
                  <label className="bg-slate-100 text-slate-900 p-6 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center cursor-pointer hover:bg-slate-200 transition-all">
                    IMPORT JSON
                    <input type="file" className="hidden" accept=".json" onChange={importJson} />
                  </label>
                </div>
              </div>
              <button onClick={async () => { if (confirm("DELETE ALL DATA?")) { await fetch("/.netlify/functions/tournaments", { method: "DELETE" }); refreshAll(); setSelectedId(""); } }} className="w-full bg-rose-600 text-white p-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100">RESET DATABASE</button>
            </section>
          </div>
        )}

        {activeTab === "halloffame" && (
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
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${hallOfFameTab === tab ? "bg-[#1e293b] text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {tab === "champions" ? "🏆 CHAMPIONS" : tab === "history" ? "📜 HISTORY" : "📊 RECORDS"}
                  </button>
                ))}
              </div>
            </div>

            {hallOfFameTab === "champions" && (
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
            )}

            {hallOfFameTab === "history" && (
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
            )}

            {hallOfFameTab === "records" && (
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
            )}
          </div>
        )}

        {activeTab === "login" && (
          <div className="max-w-sm mx-auto py-32 animate-in fade-in zoom-in-95">
            <form onSubmit={async (e) => { e.preventDefault(); const r = await apiRequest("/.netlify/functions/auth-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginForm) }); if (r.ok) { await refreshAll(); setActiveTab("dashboard"); } }} className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-2xl space-y-8">
              <h2 className="text-xl font-black uppercase text-center tracking-[0.3em]">Authorize</h2>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 font-bold text-sm" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required />
              <input type="password" title="password" className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 font-bold text-sm" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <button className="w-full bg-[#1e293b] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">LOGIN</button>
            </form>
          </div>
        )}
      </main>

      <footer className="py-24 text-center opacity-10 text-[10px] font-black uppercase tracking-[1.5em]">Reiken Tournament Engine</footer>
    </div>
  );
}

export default App;
