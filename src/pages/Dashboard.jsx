import { memo } from 'react';

const Dashboard = memo(({ tournaments, currentUser, onNavigate }) => {
  const totalMatches = tournaments.reduce((acc, t) => acc + t.matches.length, 0);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-black tracking-tighter text-[#0f172a]">Tournament Center</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Manage your football tournaments with ease</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <button 
          onClick={() => onNavigate("tournaments")} 
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
          onClick={() => currentUser ? onNavigate("create") : onNavigate("login")}
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
          onClick={() => onNavigate("halloffame")}
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
            <p className="text-3xl font-black text-[#0f172a]">{totalMatches}</p>
            <p className="text-xs font-black uppercase tracking-widest">Matches Played</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-[#0f172a]">1</p>
            <p className="text-xs font-black uppercase tracking-widest">Administrators</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
