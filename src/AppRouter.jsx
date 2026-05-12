import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Notice from './components/Notice';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import HallOfFame from './pages/HallOfFame';
import CreateTournament from './pages/CreateTournament';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { useTournamentData } from './hooks/useTournamentData';
import { normalizeParticipants, calculateStandings } from './utils/tournamentUtils';

const AppRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    leagues, teams, tournaments, currentUser, admins, form, adminCreateForm, loginForm,
    selectedId, matchForm, loading, notice, selectedTournament, activeLeagues,
    setForm, setAdminCreateForm, setLoginForm, setSelectedId, setMatchForm, setLoading, setNotice,
    apiRequest, refreshAll, getTeamData
  } = useTournamentData();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  const tournamentParticipants = useMemo(() => normalizeParticipants(selectedTournament?.participants), [selectedTournament]);
  const standings = useMemo(() => (selectedTournament ? calculateStandings(selectedTournament.matches, tournamentParticipants) : []), [selectedTournament, tournamentParticipants]);

  useEffect(() => {
    if (!tournamentParticipants.length) return;
    
    const fixtures = [];
    for (let i = 0; i < tournamentParticipants.length; i++) {
      for (let j = 0; j < tournamentParticipants.length; j++) {
        if (i === j) continue;
        fixtures.push({ home: tournamentParticipants[i].name, away: tournamentParticipants[j].name });
      }
    }
    
    const unplayedFixtures = fixtures.filter(f => 
      !selectedTournament?.matches.some(m => m.home === f.home && m.away === f.away)
    );
    
    if (unplayedFixtures.length > 0) {
      const first = unplayedFixtures[0];
      setMatchForm(prev => ({ ...prev, home: first.home, away: first.away }));
    } else {
      setMatchForm(prev => ({ ...prev, home: "", away: "" }));
    }
  }, [selectedId, selectedTournament, tournamentParticipants]);

  const handleNavigate = (path) => {
    navigate(`/${path === 'dashboard' ? '' : path}`);
  };

  const handleLogout = () => {
    refreshAll();
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const r = await apiRequest("/.netlify/functions/auth-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm)
    });
    if (r.ok) {
      await refreshAll();
      navigate('/');
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await apiRequest("/.netlify/functions/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "league" })
    });
    setLoading(false);
    if (r.ok) {
      setForm({ name: "", season: "2026", type: "league", participants: [{ name: "", leagueId: "", teamId: "" }, { name: "", leagueId: "", teamId: "" }] });
      navigate('/tournaments');
      refreshAll();
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await apiRequest("/.netlify/functions/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminCreateForm)
    });
    setLoading(false);
    if (r.ok) {
      setAdminCreateForm({ displayName: "", username: "", password: "" });
      setNotice("Admin Created!");
      refreshAll();
    }
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!selectedTournament) return;
    if (matchForm.home === matchForm.away) {
      setNotice("A team cannot play itself!");
      return;
    }
    const r = await apiRequest("/.netlify/functions/tournaments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedTournament.id,
        action: "addMatch",
        match: matchForm
      })
    });
    if (r.ok) {
      setNotice("Result Saved!");
      refreshAll();
      setMatchForm(prev => ({ ...prev, homeGoals: 0, awayGoals: 0 }));
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tournaments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fl26_tournaments_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleImportJson = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const items = JSON.parse(event.target.result);
        await apiRequest("/.netlify/functions/tournaments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "any", action: "bulkImport", items })
        });
        setNotice("Import Successful!");
        refreshAll();
      } catch {
        setNotice("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = async () => {
    if (confirm("DELETE ALL DATA?")) {
      await fetch("/.netlify/functions/tournaments", { method: "DELETE" });
      refreshAll();
      setSelectedId("");
    }
  };

  const activeTab = location.pathname === '/' ? 'dashboard' : location.pathname.replace('/', '');

  const pageProps = {
    tournaments,
    currentUser,
    selectedId,
    setSelectedId,
    matchForm,
    setMatchForm,
    onAddMatch: handleAddMatch,
    getTeamData,
    onNavigate: handleNavigate,
    form,
    setForm,
    activeLeagues,
    teams,
    onCreateTournament: handleCreateTournament,
    loginForm,
    setLoginForm,
    onLogin: handleLogin,
    adminCreateForm,
    setAdminCreateForm,
    onCreateAdmin: handleCreateAdmin,
    onExportJson: handleExportJson,
    onImportJson: handleImportJson,
    onResetDatabase: handleResetDatabase
  };

  const renderPage = () => {
    const pageProps = {
      tournaments,
      currentUser,
      selectedId,
      setSelectedId,
      matchForm,
      setMatchForm,
      onAddMatch: handleAddMatch,
      getTeamData,
      onNavigate: handleNavigate,
      form,
      setForm,
      activeLeagues,
      teams,
      onCreateTournament: handleCreateTournament,
      loginForm,
      setLoginForm,
      onLogin: handleLogin,
      adminCreateForm,
      setAdminCreateForm,
      onCreateAdmin: handleCreateAdmin,
      onExportJson: handleExportJson,
      onImportJson: handleImportJson,
      onResetDatabase: handleResetDatabase
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'tournaments':
        return <Tournaments {...pageProps} />;
      case 'halloffame':
        return <HallOfFame {...pageProps} />;
      case 'create':
        return <CreateTournament {...pageProps} />;
      case 'login':
        return <Login {...pageProps} />;
      case 'admin':
        return <Admin {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />
      
      <main className="max-w-[1600px] mx-auto p-12 lg:p-16">
        <Notice notice={notice} />
        {renderPage()}
      </main>

      <footer className="py-24 text-center opacity-10 text-[10px] font-black uppercase tracking-[1.5em]">
        Reiken Tournament Engine
      </footer>
    </div>
  );
};

export default AppRouter;
