import { memo } from 'react';
import Select from 'react-select';
import { createParticipant } from '../utils/tournamentUtils';

const CreateTournament = memo(({ form, setForm, activeLeagues, teams, onCreateTournament, discordMembers, discordLoading, discordError }) => {
  const handleParticipantChange = (index, field, value) => {
    const list = [...form.participants];
    list[index][field] = value;
    if (field === 'leagueId') {
      list[index].teamId = "";
    }
    setForm({ ...form, participants: list });
  };

  const addParticipant = () => {
    setForm({ ...form, participants: [...form.participants, createParticipant()] });
  };

  const removeParticipant = (index) => {
    if (form.participants.length > 2) {
      const list = form.participants.filter((_, i) => i !== index);
      setForm({ ...form, participants: list });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-4xl font-black mb-10 tracking-tighter">Initialize Tournament</h2>
      <form onSubmit={onCreateTournament} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Tournament Title</label>
          <input 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm" 
            placeholder="e.g. Pro League 2026" 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            required 
          />
        </div>
        <div className="space-y-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-black uppercase text-pink-600 tracking-widest ml-4">Player Registry</h3>
            <button 
              type="button" 
              onClick={addParticipant} 
              className="bg-pink-50 text-pink-600 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-100 transition-all"
            >
              + Add New
            </button>
          </div>
          {form.participants.map((p, idx) => (
            <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
              {discordError && (
                <div className="text-red-500 text-[10px] mb-1">Discord Error: {discordError}</div>
              )}
              {discordMembers.length > 0 ? (
                <Select
                  className="flex-1"
                  classNamePrefix="react-select"
                  placeholder="Search Discord Member..."
                  value={p.name ? { value: p.name, label: p.name } : null}
                  onChange={opt => handleParticipantChange(idx, 'name', opt?.value || '')}
                  options={discordMembers.map(m => ({
                    value: m.displayName,
                    label: `${m.displayName} (@${m.username})`
                  }))}
                  isSearchable={true}
                  isClearable={true}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      minHeight: '3rem',
                    }),
                    input: (base) => ({
                      ...base,
                      fontSize: '0.75rem',
                      fontWeight: '700',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: '#94a3b8',
                    }),
                    option: (base, state) => ({
                      ...base,
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: state.isSelected ? '#fce7f3' : 'white',
                      color: '#1e293b',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }),
                  }}
                  required
                />
              ) : (
                <input
                  className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-bold"
                  placeholder={discordLoading ? "Loading Discord members..." : "Player Name"}
                  value={p.name}
                  onChange={e => handleParticipantChange(idx, 'name', e.target.value)}
                  disabled={discordLoading}
                  required
                />
              )}
              {discordLoading && (
                <div className="text-blue-500 text-[10px] animate-pulse">Loading...</div>
              )}
              <select 
                className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase" 
                value={p.leagueId} 
                onChange={e => handleParticipantChange(idx, 'leagueId', e.target.value)} 
                required
              >
                <option value="">League</option>
                {activeLeagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select 
                className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-black uppercase" 
                value={p.teamId} 
                onChange={e => handleParticipantChange(idx, 'teamId', e.target.value)} 
                disabled={!p.leagueId} 
                required
              >
                <option value="">Team</option>
                {teams.filter(t => t.leagueId === p.leagueId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => removeParticipant(idx)} 
                className="text-slate-200 hover:text-rose-600 font-black text-xl px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button 
          type="submit" 
          className="w-full bg-[#1e293b] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] shadow-xl"
        >
          START TOURNAMENT
        </button>
      </form>
    </div>
  );
});

export default CreateTournament;
