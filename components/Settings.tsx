
import React, { useState, useEffect } from 'react';
import { Volume2, Play, CheckCircle2, ShieldCheck, Music, FastForward } from 'lucide-react';
import { SOUND_OPTIONS, DEFAULT_SOUND_ID } from '../constants';
import { playSound } from '../utils';

const Settings: React.FC = () => {
  const [autoCheck, setAutoCheck] = useState(true);
  const [skipSound, setSkipSound] = useState(false);
  const [defaultSound, setDefaultSound] = useState(DEFAULT_SOUND_ID);

  useEffect(() => {
    const savedAutoCheck = localStorage.getItem('task-timer-auto-check');
    if (savedAutoCheck !== null) setAutoCheck(JSON.parse(savedAutoCheck));

    const savedSkipSound = localStorage.getItem('task-timer-skip-sound-enabled');
    if (savedSkipSound !== null) setSkipSound(JSON.parse(savedSkipSound));
    
    const savedSound = localStorage.getItem('task-timer-default-sound');
    if (savedSound) setDefaultSound(savedSound);
  }, []);

  const toggleAutoCheck = () => {
    const nextValue = !autoCheck;
    setAutoCheck(nextValue);
    localStorage.setItem('task-timer-auto-check', JSON.stringify(nextValue));
  };

  const toggleSkipSound = () => {
    const nextValue = !skipSound;
    setSkipSound(nextValue);
    localStorage.setItem('task-timer-skip-sound-enabled', JSON.stringify(nextValue));
  };

  const handleDefaultSoundChange = (id: string) => {
    setDefaultSound(id);
    localStorage.setItem('task-timer-default-sound', id);
    playSound(id);
  };

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400">Personalize your timer and productivity experience</p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <ShieldCheck size={20} className="text-indigo-400" />
           <h3 className="text-xl font-bold">General Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-100">Auto-check on Timeout</h4>
              <p className="text-xs text-slate-400">Automatically mark tasks/intervals as completed when the timer hits zero.</p>
            </div>
            <button 
              onClick={toggleAutoCheck}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${autoCheck ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoCheck ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FastForward size={14} className="text-indigo-400" />
                <h4 className="font-bold text-slate-100">Play sounds on interval skip</h4>
              </div>
              <p className="text-xs text-slate-400">Plays the interval's specific sound when skipping forward or backward.</p>
            </div>
            <button 
              onClick={toggleSkipSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${skipSound ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${skipSound ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <Music size={20} className="text-indigo-400" />
           <h3 className="text-xl font-bold">Default Alert Sound</h3>
        </div>
        <p className="text-xs text-slate-400 -mt-4">Used for To-do list, Preset timers, and Stopwatches. Interval timers use their own specific settings.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOUND_OPTIONS.map(sound => (
            <button 
              key={sound.id} 
              onClick={() => handleDefaultSoundChange(sound.id)}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                defaultSound === sound.id 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-100' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold">{sound.name}</span>
                {defaultSound === sound.id && <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">Selected</span>}
              </div>
              <Play size={18} fill={defaultSound === sound.id ? "currentColor" : "none"} className={defaultSound === sound.id ? "text-indigo-400" : "text-slate-600"} />
            </button>
          ))}
        </div>
      </section>

      <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
         <p className="text-slate-500 text-sm">
           Task-Timer keeps your data locally in your browser. <br/>
           Settings are saved automatically to your device.
         </p>
      </div>
    </div>
  );
};

export default Settings;
