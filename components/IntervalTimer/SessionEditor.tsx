
import React, { useState } from 'react';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import { Session, Interval, Task } from '../../types';
import { generateId, parseTimeToSeconds } from '../../utils';
import { DEFAULT_SOUND_ID, SOUND_OPTIONS } from '../../constants';

interface SessionEditorProps {
  onSave: (session: Session) => void;
  onCancel: () => void;
  initialSession?: Session;
}

const SessionEditor: React.FC<SessionEditorProps> = ({ onSave, onCancel, initialSession }) => {
  const [name, setName] = useState(initialSession?.name || '');
  const [cycles, setCycles] = useState(initialSession?.cycles || 1);
  const [intervals, setIntervals] = useState<Interval[]>(
    initialSession?.intervals || [
      { id: generateId(), name: 'Work', durationSeconds: 1500, soundId: DEFAULT_SOUND_ID, tasks: [] }
    ]
  );

  const addInterval = () => {
    setIntervals([...intervals, { 
      id: generateId(), 
      name: 'Interval ' + (intervals.length + 1), 
      durationSeconds: 60, 
      soundId: DEFAULT_SOUND_ID, 
      tasks: [] 
    }]);
  };

  const removeInterval = (id: string) => {
    if (intervals.length > 1) {
      setIntervals(intervals.filter(i => i.id !== id));
    }
  };

  const moveInterval = (index: number, direction: 'up' | 'down') => {
    const newIntervals = [...intervals];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newIntervals.length) {
      [newIntervals[index], newIntervals[targetIndex]] = [newIntervals[targetIndex], newIntervals[index]];
      setIntervals(newIntervals);
    }
  };

  const duplicateInterval = (interval: Interval) => {
    const newInterval = { ...interval, id: generateId(), tasks: interval.tasks.map(t => ({ ...t, id: generateId() })) };
    const index = intervals.findIndex(i => i.id === interval.id);
    const newIntervals = [...intervals];
    newIntervals.splice(index + 1, 0, newInterval);
    setIntervals(newIntervals);
  };

  const updateInterval = (id: string, updates: Partial<Interval>) => {
    setIntervals(intervals.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleSave = () => {
    if (!name.trim()) return alert("Please enter a session name");
    onSave({
      id: initialSession?.id || generateId(),
      name,
      cycles,
      intervals,
      createdAt: initialSession?.createdAt || Date.now()
    });
  };

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{initialSession ? 'Edit Session' : 'Create New Session'}</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Session Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. Study Session"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Cycles</label>
            <input 
              type="number" 
              min="1" 
              max="99"
              value={cycles} 
              onChange={e => setCycles(clamp(parseInt(e.target.value) || 1, 1, 99))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-200">Interval Blocks</h3>
            <button onClick={addInterval} className="flex items-center gap-2 text-xs bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all"><Plus size={16} /> Add</button>
          </div>

          <div className="space-y-3">
            {intervals.map((interval, idx) => {
              const h = Math.floor(interval.durationSeconds / 3600);
              const m = Math.floor((interval.durationSeconds % 3600) / 60);
              const s = interval.durationSeconds % 60;
              return (
                <div key={interval.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 transition-all hover:border-slate-600">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 w-full space-y-3">
                      <input 
                        type="text"
                        value={interval.name}
                        onChange={e => updateInterval(interval.id, { name: e.target.value })}
                        className="bg-transparent text-lg font-semibold w-full outline-none border-b border-transparent focus:border-indigo-500"
                      />
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>Duration:</span>
                          <div className="flex gap-1 items-center font-mono">
                            <input type="number" min="0" max="23" className="bg-slate-700 w-10 text-center rounded py-0.5" value={h} onChange={e => updateInterval(interval.id, { durationSeconds: parseTimeToSeconds(clamp(parseInt(e.target.value) || 0, 0, 23), m, s) })} />
                            <span>:</span>
                            <input type="number" min="0" max="59" className="bg-slate-700 w-10 text-center rounded py-0.5" value={m} onChange={e => updateInterval(interval.id, { durationSeconds: parseTimeToSeconds(h, clamp(parseInt(e.target.value) || 0, 0, 59), s) })} />
                            <span>:</span>
                            <input type="number" min="0" max="59" className="bg-slate-700 w-10 text-center rounded py-0.5" value={s} onChange={e => updateInterval(interval.id, { durationSeconds: parseTimeToSeconds(h, m, clamp(parseInt(e.target.value) || 0, 0, 59)) })} />
                          </div>
                        </div>
                        <select className="bg-slate-700 rounded py-0.5 px-2 text-xs" value={interval.soundId} onChange={e => updateInterval(interval.id, { soundId: e.target.value })}>
                          {SOUND_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg">
                      <button onClick={() => moveInterval(idx, 'up')} className="p-1.5 hover:text-indigo-400"><ArrowUp size={16} /></button>
                      <button onClick={() => moveInterval(idx, 'down')} className="p-1.5 hover:text-indigo-400"><ArrowDown size={16} /></button>
                      <button onClick={() => duplicateInterval(interval)} className="p-1.5 hover:text-emerald-400"><Copy size={16} /></button>
                      <button onClick={() => removeInterval(interval.id)} className="p-1.5 hover:text-rose-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"><Save size={20} /> Save Session</button>
      </div>
    </div>
  );
};

export default SessionEditor;
