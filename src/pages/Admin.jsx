import { memo } from 'react';

const Admin = memo(({ adminCreateForm, setAdminCreateForm, onCreateAdmin, onExportJson, onImportJson, onResetDatabase }) => (
  <div className="grid grid-cols-2 gap-10">
    <section className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-8 shadow-sm">
      <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Authorized Access</h2>
      <form onSubmit={onCreateAdmin} className="space-y-4">
        <input 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" 
          placeholder="Full Name" 
          value={adminCreateForm.displayName} 
          onChange={e => setAdminCreateForm({ ...adminCreateForm, displayName: e.target.value })} 
          required 
        />
        <input 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" 
          placeholder="Username" 
          value={adminCreateForm.username} 
          onChange={e => setAdminCreateForm({ ...adminCreateForm, username: e.target.value })} 
          required 
        />
        <input 
          type="password" 
          title="password" 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" 
          placeholder="Password" 
          value={adminCreateForm.password} 
          onChange={e => setAdminCreateForm({ ...adminCreateForm, password: e.target.value })} 
          required 
        />
        <button className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          REGISTER ADMIN
        </button>
      </form>
    </section>
    <section className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-8 shadow-sm flex flex-col justify-between">
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Maintenance & Data</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onExportJson} 
            className="bg-slate-900 text-white p-6 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all"
          >
            EXPORT JSON
          </button>
          <label className="bg-slate-100 text-slate-900 p-6 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center cursor-pointer hover:bg-slate-200 transition-all">
            IMPORT JSON
            <input type="file" className="hidden" accept=".json" onChange={onImportJson} />
          </label>
        </div>
      </div>
      <button 
        onClick={onResetDatabase} 
        className="w-full bg-rose-600 text-white p-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100"
      >
        RESET DATABASE
      </button>
    </section>
  </div>
));

export default Admin;
