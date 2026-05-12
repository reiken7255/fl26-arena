import { memo } from 'react';

const Notice = memo(({ notice }) => {
  if (!notice) return null;
  
  return (
    <div className="fixed top-24 right-12 bg-pink-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl text-[10px] font-black uppercase tracking-widest z-[100] animate-in slide-in-from-right">
      {notice}
    </div>
  );
});

export default Notice;
