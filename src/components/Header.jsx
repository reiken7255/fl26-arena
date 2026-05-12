import { memo } from 'react';

const Header = memo(({ currentUser, onLogout, onNavigate, activeTab }) => {
  const handleLogout = async () => {
    await fetch("/.netlify/functions/auth-logout", { method: "POST" });
    onLogout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-12 py-5 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate("dashboard")}>
          <img src="/logo.png" className="h-14 w-auto transition-transform group-hover:scale-105" alt="Logo" />
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <h1 className="text-xl font-black tracking-tighter text-[#0f172a]">FL - PES TOURNAMENTS</h1>
        </div>
        <nav className="hidden lg:flex gap-4">
          {[
            { id: "dashboard", l: "DASHBOARD" }, 
            { id: "tournaments", l: "TOURNAMENTS" }, 
            { id: "halloffame", l: "HALL OF FAME" }, 
            { id: "create", l: "NEW TOURNAMENT", admin: true }, 
            { id: "admin", l: "ADMIN PORTAL", admin: true }
          ].map(t => (
            (!t.admin || currentUser) && (
              <button 
                key={t.id} 
                onClick={() => onNavigate(t.id)} 
                className={`px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest transition-all ${
                  activeTab === t.id ? "bg-[#1e293b] text-white" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {t.l}
              </button>
            )
          ))}
        </nav>
      </div>
      <div>
        {currentUser ? (
          <button 
            onClick={handleLogout} 
            className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 tracking-widest"
          >
            LOGOUT
          </button>
        ) : (
          <button 
            onClick={() => onNavigate("login")} 
            className="px-8 py-3 bg-[#1e293b] text-white rounded-2xl text-[11px] font-black tracking-widest shadow-xl"
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
});

export default Header;
