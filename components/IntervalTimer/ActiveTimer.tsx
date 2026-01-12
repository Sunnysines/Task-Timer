
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, CheckCircle2, Circle, ListTodo, X } from 'lucide-react';
import { Session, Task } from '../../types';
import { formatTime, playSound } from '../../utils';

interface ActiveTimerProps {
  session: Session;
  onClose: () => void;
  options: {
    syncTasks: boolean;
    repeatTasks: boolean;
    taskBasedProgress: boolean;
  };
}

const ActiveTimer: React.FC<ActiveTimerProps> = ({ session, onClose, options }) => {
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(session.intervals[0].durationSeconds);
  const [isActive, setIsActive] = useState(true);
  const [sessionTasks, setSessionTasks] = useState<Record<string, Task[]>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const currentInterval = session.intervals[currentIntervalIndex];

  const cycleDuration = useMemo(() => 
    session.intervals.reduce((acc, i) => acc + i.durationSeconds, 0), 
  [session]);

  const totalSessionDuration = cycleDuration * session.cycles;

  useEffect(() => {
    const initialTasks: Record<string, Task[]> = {};
    session.intervals.forEach(interval => {
      initialTasks[interval.id] = interval.tasks.map(t => ({ ...t }));
    });
    setSessionTasks(initialTasks);
  }, [session]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + (timeLeft * 1000);
      }
      
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          endTimeRef.current = null;
          handleIntervalEnd();
        }
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      endTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, currentIntervalIndex, currentCycle]);

  const handleIntervalEnd = () => {
    playSound(currentInterval.soundId);

    const autoCheckSaved = localStorage.getItem('task-timer-auto-check');
    const autoCheck = autoCheckSaved !== null ? JSON.parse(autoCheckSaved) : true;
    
    if (autoCheck) {
      setSessionTasks(prev => ({
        ...prev,
        [currentInterval.id]: prev[currentInterval.id].map(t => ({ ...t, isCompleted: true }))
      }));
    }
    
    if (currentIntervalIndex < session.intervals.length - 1) {
      const nextIdx = currentIntervalIndex + 1;
      setCurrentIntervalIndex(nextIdx);
      const nextDuration = session.intervals[nextIdx].durationSeconds;
      setTimeLeft(nextDuration);
      endTimeRef.current = Date.now() + (nextDuration * 1000);
    } else if (currentCycle < session.cycles) {
      setCurrentCycle(prev => prev + 1);
      setCurrentIntervalIndex(0);
      const nextDuration = session.intervals[0].durationSeconds;
      setTimeLeft(nextDuration);
      endTimeRef.current = Date.now() + (nextDuration * 1000);
      
      if (options.repeatTasks) {
        setSessionTasks(prev => {
          const next = { ...prev };
          session.intervals.forEach(i => {
            next[i.id] = next[i.id].map(t => ({ ...t, isCompleted: false }));
          });
          return next;
        });
      }
    } else {
      setIsActive(false);
      endTimeRef.current = null;
      alert("Session Complete!");
    }
  };

  const handleReset = () => {
    // Resetting current interval timer immediately
    setTimeLeft(currentInterval.durationSeconds);
    if (isActive) {
      endTimeRef.current = Date.now() + (currentInterval.durationSeconds * 1000);
    } else {
      endTimeRef.current = null;
    }
  };

  const handleQuit = () => {
    // Return back to dashboard (SessionManager)
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const playSkipSound = (soundId: string) => {
    const skipSoundEnabled = localStorage.getItem('task-timer-skip-sound-enabled') === 'true';
    if (skipSoundEnabled) {
      playSound(soundId);
    }
  };

  const skipForward = () => {
    let nextIdx = currentIntervalIndex;
    let nextCycle = currentCycle;
    let nextSoundId = currentInterval.soundId;

    if (currentIntervalIndex < session.intervals.length - 1) {
      nextIdx = currentIntervalIndex + 1;
      nextSoundId = session.intervals[nextIdx].soundId;
      setCurrentIntervalIndex(nextIdx);
      const nextDuration = session.intervals[nextIdx].durationSeconds;
      setTimeLeft(nextDuration);
      if (isActive) endTimeRef.current = Date.now() + (nextDuration * 1000);
    } else if (currentCycle < session.cycles) {
      nextCycle = currentCycle + 1;
      nextIdx = 0;
      nextSoundId = session.intervals[0].soundId;
      setCurrentCycle(nextCycle);
      setCurrentIntervalIndex(nextIdx);
      const nextDuration = session.intervals[0].durationSeconds;
      setTimeLeft(nextDuration);
      if (isActive) endTimeRef.current = Date.now() + (nextDuration * 1000);
    }

    playSkipSound(nextSoundId);
  };

  const skipBackward = () => {
    let prevIdx = currentIntervalIndex;
    let prevCycle = currentCycle;
    let prevSoundId = currentInterval.soundId;

    if (currentInterval.durationSeconds - timeLeft > 2) {
      setTimeLeft(currentInterval.durationSeconds);
      if (isActive) endTimeRef.current = Date.now() + (currentInterval.durationSeconds * 1000);
    } else {
      if (currentIntervalIndex > 0) {
        prevIdx = currentIntervalIndex - 1;
        prevSoundId = session.intervals[prevIdx].soundId;
        setCurrentIntervalIndex(prevIdx);
        const prevDuration = session.intervals[prevIdx].durationSeconds;
        setTimeLeft(prevDuration);
        if (isActive) endTimeRef.current = Date.now() + (prevDuration * 1000);
      } else if (currentCycle > 1) {
        prevCycle = currentCycle - 1;
        prevIdx = session.intervals.length - 1;
        prevSoundId = session.intervals[prevIdx].soundId;
        setCurrentCycle(prevCycle);
        setCurrentIntervalIndex(prevIdx);
        const lastDuration = session.intervals[prevIdx].durationSeconds;
        setTimeLeft(lastDuration);
        if (isActive) endTimeRef.current = Date.now() + (lastDuration * 1000);
      } else {
        setTimeLeft(currentInterval.durationSeconds);
        if (isActive) endTimeRef.current = Date.now() + (currentInterval.durationSeconds * 1000);
      }
    }

    playSkipSound(prevSoundId);
  };

  const toggleTask = (intervalId: string, taskId: string) => {
    setSessionTasks(prev => ({
      ...prev,
      [intervalId]: prev[intervalId].map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
    }));
  };

  const elapsedInCurrentCycle = session.intervals.slice(0, currentIntervalIndex).reduce((acc, i) => acc + i.durationSeconds, 0) + (currentInterval.durationSeconds - timeLeft);
  const totalElapsedTime = (currentCycle - 1) * cycleDuration + elapsedInCurrentCycle;
  const timeProgress = (totalElapsedTime / totalSessionDuration) * 100;

  const allTasksList = Object.entries(sessionTasks).flatMap(([intervalId, tasks]) => 
    tasks.map(task => ({ ...task, intervalId }))
  );
  
  const completedTasksCount = allTasksList.filter(t => t.isCompleted).length;
  const progressPercentage = options.taskBasedProgress ? (allTasksList.length > 0 ? (completedTasksCount / allTasksList.length) * 100 : timeProgress) : timeProgress;
  const totalTimeRemaining = Math.max(0, totalSessionDuration - totalElapsedTime);

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-4 md:p-10 overflow-hidden">
      {/* Top Header */}
      <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tighter text-indigo-400">DD</span>
          <span className="text-xs font-bold bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
            Cycle {currentCycle}/{session.cycles}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset} 
            title="Reset current interval"
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={handleQuit} 
            title="Quit session"
            className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-rose-400 hover:bg-rose-900 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Section: Main Timer */}
        <div className="flex-1 flex flex-col justify-center items-center gap-6 bg-slate-900/40 rounded-[40px] border border-slate-800/40 p-6 md:p-10">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Remaining</span>
            <div className="font-mono text-3xl font-bold text-indigo-400 tabular-nums">
              {formatTime(totalTimeRemaining)}
            </div>
          </div>

          <div className="relative text-center">
            <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative font-mono text-8xl md:text-[150px] font-bold tracking-tighter tabular-nums leading-none">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 bg-slate-800/50 px-6 py-2 rounded-xl inline-block border border-slate-700/50">
              {currentInterval.name}
            </div>
          </div>

          <div className="w-full max-w-md space-y-2 mt-4">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              <span>{options.taskBasedProgress ? 'Task Progress' : 'Time Progress'}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 mt-4">
            <button onClick={skipBackward} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"><SkipBack size={24} /></button>
            <button 
              onClick={() => setIsActive(!isActive)} 
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 ${isActive ? 'bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 shadow-indigo-500/20'}`}
            >
              {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={skipForward} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"><SkipForward size={24} /></button>
          </div>
        </div>

        {/* Right Section: Task List */}
        <div className="w-full lg:w-[400px] flex flex-col bg-slate-900/60 rounded-[40px] border border-slate-800/60 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/80 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-300 flex items-center gap-3">
              <ListTodo size={16} className="text-indigo-400" /> Session Tasks
            </h3>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
              {completedTasksCount}/{allTasksList.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {allTasksList.map((task, idx) => {
              const isActiveInterval = task.intervalId === currentInterval.id;
              const shouldHighlight = options.syncTasks && isActiveInterval;

              return (
                <button 
                  key={`${task.id}-${idx}`}
                  onClick={() => toggleTask(task.intervalId, task.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[24px] border transition-all text-left group relative ${
                    shouldHighlight 
                      ? 'bg-indigo-600/15 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-xl' 
                      : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60'
                  } ${task.isCompleted ? 'opacity-30 grayscale grayscale-[0.8]' : 'opacity-100'}`}
                >
                  <div className="shrink-0">
                    {task.isCompleted 
                      ? <CheckCircle2 size={18} className="text-emerald-500" /> 
                      : <Circle size={18} className={shouldHighlight ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.text}
                    </div>
                    <div className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold mt-0.5">
                      {session.intervals.find(i => i.id === task.intervalId)?.name}
                    </div>
                  </div>
                  {shouldHighlight && !task.isCompleted && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse absolute right-4"></div>
                  )}
                </button>
              );
            })}
            {allTasksList.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                <ListTodo size={40} />
                <p className="text-xs font-bold mt-4">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTimer;
