import { memo } from 'react';

const Login = memo(({ loginForm, setLoginForm, onLogin }) => (
  <div className="max-w-sm mx-auto py-32 animate-in fade-in zoom-in-95">
    <form onSubmit={onLogin} className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-2xl space-y-8">
      <h2 className="text-xl font-black uppercase text-center tracking-[0.3em]">Authorize</h2>
      <input 
        className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 font-bold text-sm" 
        placeholder="Username" 
        value={loginForm.username} 
        onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} 
        required 
      />
      <input 
        type="password" 
        title="password" 
        className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 font-bold text-sm" 
        placeholder="Password" 
        value={loginForm.password} 
        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} 
        required 
      />
      <button className="w-full bg-[#1e293b] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">
        LOGIN
      </button>
    </form>
  </div>
));

export default Login;
