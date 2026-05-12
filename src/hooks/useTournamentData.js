import { useState, useCallback, useMemo } from 'react';

const initialForm = { name: "", season: "2026", type: "league", participants: [{ name: "", leagueId: "", teamId: "" }, { name: "", leagueId: "", teamId: "" }] };
const initialAdminForm = { displayName: "", username: "", password: "" };

export const useTournamentData = () => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [adminCreateForm, setAdminCreateForm] = useState(initialAdminForm);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [selectedId, setSelectedId] = useState("");
  const [matchForm, setMatchForm] = useState({ home: "", away: "", homeGoals: 0, awayGoals: 0 });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const apiRequest = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      const raw = await response.text();
      let data = null;
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
    if (ld) setLeagues(ld.leagues || []);
    if (td) setTeams(td.teams || []);
    if (tr) setTournaments(tr.tournaments || []);
    setCurrentUser(me?.user || null);
    if (me?.user) {
      const ad = await fetch("/.netlify/functions/admin-users").then(r => r.json());
      setAdmins(ad?.users || []);
    }
    setLoading(false);
  }, [apiRequest]);

  const getTeamData = useCallback((teamId) => teams.find(t => t.id === teamId), [teams]);

  const selectedTournament = useMemo(() => tournaments.find((t) => t.id === selectedId), [tournaments, selectedId]);
  const activeLeagues = useMemo(() => leagues.filter(l => teams.some(t => t.leagueId === l.id)), [leagues, teams]);

  return {
    // State
    leagues, teams, tournaments, currentUser, admins, form, adminCreateForm, loginForm,
    selectedId, matchForm, loading, notice, selectedTournament, activeLeagues,
    
    // Setters
    setLeagues, setTeams, setTournaments, setCurrentUser, setAdmins, setForm, setAdminCreateForm,
    setLoginForm, setSelectedId, setMatchForm, setLoading, setNotice,
    
    // Actions
    apiRequest, refreshAll, getTeamData
  };
};
