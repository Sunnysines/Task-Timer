import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Save, Trash2, Hourglass } from 'lucide-react';
import { TimerPreset } from '../../types';
import { formatTime, parseTimeToSeconds, playSound, generateId } from '../../utils';
import { DEFAULT_SOUND_ID } from '../../constants';

const PresetTimer: React.FC = () => {
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [h, sH] = useState(0);
  const [m, sM] = useState(5);
  const [s, sS] = useState(0);
  const [presetName, setPresetName] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('task-timer-presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  const saveToLocalStorage = (updatedPresets: TimerPreset[]) => {
    localStorage.setItem('task-timer-presets', JSON.stringify(updatedPresets));
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!endTimeRef.current) endTimeRef.current = Date.now() + (timeLeft * 1000);
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsActive(false); endTimeRef.current = null;
          const defaultSound = localStorage.getItem('task-timer-default-sound') || DEFAULT_SOUND_ID;
          playSound(defaultSound); 
          alert("Timer Finished!");
        }
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      endTimeRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const handleStartManual = () => {
    const duration = parseTimeToSeconds(h, m, s);
    if (duration > 0) {
      endTimeRef.current = Date.now() + (duration * 1000);
      setTimeLeft(duration); 
      setIsActive(true);
    }
  };

  const savePreset = () => {
    const duration = parseTimeToSeconds(h, m, s);
    if (duration > 0 && presetName.trim()) {
      const newPreset: TimerPreset = { id: generateId(), name: presetName, durationSeconds: duration };
      const nextPresets = [...presets, newPreset];
      setPresets(nextPresets);
      saveToLocalStorage(nextPresets);
      setPresetName('');
    } else if (!presetName.trim()) {
      alert("Please enter a name for the preset.");
    }
  };

  const deletePreset = (id: string) => {
    const nextPresets = presets.filter(p => p.id !== id);
    setPresets(nextPresets);
    saveToLocalStorage(nextPresets);
  };

  const usePreset = (preset: TimerPreset) => {
    setTimeLeft(preset.durationSeconds);
    endTimeRef.current = Date.now() + (preset.durationSeconds * 1000);
    setIsActive(true);
  };

  const reset = () => { setTimeLeft(0); setIsActive(false); endTimeRef.current = null; };

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-3xl font-bold">Single Timer</h1>
        <p className="text-slate-400 text-sm">Set a custom duration or use a preset</p>
      </header>

      <div className="flex flex-col items-center">
        <div className="font-mono text-8xl md:text-[140px] font-bold mb-10 tracking-tighter tabular-nums leading-none">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-6 mb-12">
          <button onClick={reset} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"><RotateCcw size={24} /></button>
          <button onClick={() => setIsActive(!isActive)} disabled={timeLeft === 0} className={`p-6 rounded-3xl text-white shadow-xl transition-all active:scale-95 ${isActive ? 'bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 shadow-indigo-500/20'} disabled:opacity-20`}>
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        <div className="w-full max-w-md bg-slate-900 p-6 rounded-[32px] border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center bg-slate-800 rounded-2xl p-4 font-mono text-2xl border border-slate-700">
            <div className="flex flex-col items-center"><span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">H</span><input type="number" min="0" max="23" value={h} onChange={e => sH(clamp(parseInt(e.target.value) || 0, 0, 23))} className="bg-transparent w-12 text-center outline-none" /></div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="flex flex-col items-center"><span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">M</span><input type="number" min="0" max="59" value={m} onChange={e => sM(clamp(parseInt(e.target.value) || 0, 0, 59))} className="bg-transparent w-12 text-center outline-none" /></div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="flex flex-col items-center"><span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">S</span><input type="number" min="0" max="59" value={s} onChange={e => sS(clamp(parseInt(e.target.value) || 0, 0, 59))} className="bg-transparent w-12 text-center outline-none" /></div>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={presetName} 
              onChange={e => setPresetName(e.target.value)} 
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-500 text-sm" 
              placeholder="Preset Label (e.g. Focus)" 
            />
            <button onClick={savePreset} title="Save as preset" className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"><Save size={20} /></button>
          </div>
          <button onClick={handleStartManual} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/10">Start Timer</button>
        </div>
      </div>

      {presets.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Hourglass size={20} className="text-indigo-400" />
            <h3 className="text-xl font-bold">Saved Presets</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100">{p.name}</span>
                  <span className="font-mono text-xs text-indigo-400 font-bold tracking-widest">{formatTime(p.durationSeconds)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => usePreset(p)} className="p-3 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"><Play size={18} fill="currentColor" /></button>
                  <button onClick={() => deletePreset(p.id)} className="p-3 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetTimer;