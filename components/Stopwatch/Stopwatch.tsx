
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ClipboardList } from 'lucide-react';

const Stopwatch: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeAtPauseRef = useRef<number>(0);

  const animate = (now: number) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = now - timeAtPauseRef.current;
    }
    const elapsed = now - startTimeRef.current;
    setTime(elapsed);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      timeAtPauseRef.current = time;
      startTimeRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  const formatMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const msRemainder = Math.floor((ms % 1000) / 10);

    const hStr = h > 0 ? h.toString().padStart(2, '0') + ':' : '';
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    const msStr = msRemainder.toString().padStart(2, '0');

    return `${hStr}${mStr}:${sStr}.${msStr}`;
  };

  const recordLap = () => {
    setLaps([time, ...laps]);
  };

  const reset = () => {
    setIsActive(false);
    setTime(0);
    setLaps([]);
    startTimeRef.current = 0;
    timeAtPauseRef.current = 0;
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto py-10 space-y-12 relative z-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stopwatch</h1>
        <p className="text-slate-400">High-precision millisecond timing</p>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Glow decoration - pointer-events-none prevents it from blocking clicks to the buttons */}
        <div className="absolute -inset-20 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative font-mono text-[80px] md:text-[140px] font-bold tracking-tighter tabular-nums leading-none mb-12">
          {formatMs(time)}
        </div>

        <div className="relative z-20 flex items-center gap-6">
          <button 
            onClick={reset}
            className="w-16 h-16 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all text-slate-500 active:scale-95 shadow-lg"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-24 h-24 flex items-center justify-center rounded-[40px] transition-all shadow-2xl active:scale-95 ${
              isActive 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 text-white'
            }`}
          >
            {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
          </button>

          <button 
            onClick={recordLap}
            disabled={!isActive && time === 0}
            className="w-16 h-16 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all text-slate-500 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-lg"
          >
            <ClipboardList size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
           <h3 className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">Lap Records</h3>
           <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">{laps.length} Splits</span>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {laps.map((lapTime, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-900/40 border border-slate-800 px-6 py-4 rounded-2xl animate-in slide-in-from-top duration-300">
              <span className="text-slate-600 font-mono font-bold text-xs">LAP {laps.length - idx}</span>
              <span className="font-mono text-xl font-bold text-slate-200">{formatMs(lapTime)}</span>
            </div>
          ))}
          {laps.length === 0 && (
            <div className="text-center py-10 text-slate-700 italic text-sm">
              Press the clipboard icon to record lap times.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;
