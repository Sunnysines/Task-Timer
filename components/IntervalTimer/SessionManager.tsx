
import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, Clock, Layers, ListTodo, CheckCircle2, X, Send, Link } from 'lucide-react';
import { Session, Interval, Task } from '../../types';
import SessionEditor from './SessionEditor';
import ActiveTimer from './ActiveTimer';
import { formatTime, generateId } from '../../utils';

const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);
  
  // States for the Pre-Start Flow
  const [showPreStartPrompt, setShowPreStartPrompt] = useState<Session | null>(null);
  const [sessionToPrepare, setSessionToPrepare] = useState<Session | null>(null);
  const [preparedTasks, setPreparedTasks] = useState<Record<string, string[]>>({}); // intervalId -> taskTexts
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({}); // intervalId -> current text input
  const [configOptions, setConfigOptions] = useState({
    syncTasks: true,
    repeatTasks: true,
    taskBasedProgress: false
  });

  const [activeSession, setActiveSession] = useState<Session | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('task-timer-sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('task-timer-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const saveSession = (session: Session) => {
    if (editingSession) {
      setSessions(sessions.map(s => s.id === session.id ? session : s));
    } else {
      setSessions([...sessions, session]);
    }
    setIsEditing(false);
    setEditingSession(undefined);
  };

  const deleteSession = (id: string) => {
    if (confirm("Delete this session?")) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      localStorage.setItem('task-timer-sessions', JSON.stringify(updated));
    }
  };

  const handleInitialStartClick = (session: Session) => {
    setShowPreStartPrompt(session);
  };

  const proceedWithTasks = () => {
    const session = showPreStartPrompt!;
    setSessionToPrepare(session);
    setShowPreStartPrompt(null);
    const initialTasks: Record<string, string[]> = {};
    const initialInputs: Record<string, string> = {};
    session.intervals.forEach(i => {
      initialTasks[i.id] = i.tasks.map(t => t.text);
      initialInputs[i.id] = '';
    });
    setPreparedTasks(initialTasks);
    setTaskInputs(initialInputs);
  };

  const skipTasksAndStart = () => {
    const session = showPreStartPrompt!;
    setActiveSession(session);
    setShowPreStartPrompt(null);
  };

  const handleAddTask = (intervalId: string) => {
    const text = taskInputs[intervalId];
    if (text?.trim()) {
      setPreparedTasks(prev => ({
        ...prev,
        [intervalId]: [...(prev[intervalId] || []), text.trim()]
      }));
      setTaskInputs(prev => ({ ...prev, [intervalId]: '' }));
    }
  };

  const startSession = () => {
    if (!sessionToPrepare) return;
    
    const finalSession: Session = {
      ...sessionToPrepare,
      intervals: sessionToPrepare.intervals.map(interval => ({
        ...interval,
        tasks: (preparedTasks[interval.id] || []).map(text => ({
          id: generateId(),
          text,
          isCompleted: false
        }))
      }))
    };

    setActiveSession(finalSession);
    setSessionToPrepare(null);
  };

  if (activeSession) {
    return <ActiveTimer session={activeSession} options={configOptions} onClose={() => setActiveSession(null)} />;
  }

  if (isEditing) {
    return (
      <SessionEditor 
        onSave={saveSession} 
        onCancel={() => { setIsEditing(false); setEditingSession(undefined); }} 
        initialSession={editingSession}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interval Sessions</h1>
          <p className="text-slate-400">Design your perfect productivity flow</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} /> Create Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(session => {
          const totalTime = session.intervals.reduce((acc, i) => acc + i.durationSeconds, 0) * session.cycles;
          return (
            <div key={session.id} className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/5">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-100">{session.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Layers size={14} /> {session.cycles} Cycles</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(totalTime)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingSession(session); setIsEditing(true); }} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"><Edit3 size={18} /></button>
                  <button onClick={() => deleteSession(session.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>

              <button 
                onClick={() => handleInitialStartClick(session)}
                className="w-full bg-slate-800 group-hover:bg-indigo-600 transition-all text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-md"
              >
                <Play size={18} fill="currentColor" /> Start Session
              </button>
            </div>
          );
        })}
        {sessions.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
             <Layers size={40} className="mx-auto text-slate-700 mb-4" />
             <p className="text-slate-500 text-sm">No sessions created yet. Click "Create Session" to get started.</p>
          </div>
        )}
      </div>

      {/* Pre-Start Choice Prompt */}
      {showPreStartPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400">
               <ListTodo size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Assign tasks to intervals?</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Personalize each block with specific goals, or just start the timer.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={proceedWithTasks}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Yes, assign tasks
              </button>
              <button 
                onClick={skipTasksAndStart}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
              >
                No, skip and start
              </button>
              <button 
                onClick={() => setShowPreStartPrompt(null)}
                className="text-slate-500 hover:text-slate-300 text-sm font-medium pt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Mapping Screen */}
      {sessionToPrepare && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Assign Interval Tasks</h2>
                <p className="text-sm text-slate-400">{sessionToPrepare.name}</p>
              </div>
              <button onClick={() => setSessionToPrepare(null)} className="text-slate-500 hover:text-white transition-colors p-2"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Session Customization</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => setConfigOptions(p => ({...p, taskBasedProgress: !p.taskBasedProgress}))}
                    className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all ${configOptions.taskBasedProgress ? 'bg-indigo-600/10 border-indigo-500 text-indigo-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Use Task-Based Progress <CheckCircle2 size={16} className={configOptions.taskBasedProgress ? 'opacity-100' : 'opacity-20'} />
                  </button>
                  <button 
                    onClick={() => setConfigOptions(p => ({...p, repeatTasks: !p.repeatTasks}))}
                    className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all ${configOptions.repeatTasks ? 'bg-indigo-600/10 border-indigo-500 text-indigo-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Repeat Tasks per Cycle <CheckCircle2 size={16} className={configOptions.repeatTasks ? 'opacity-100' : 'opacity-20'} />
                  </button>
                  <button 
                    onClick={() => setConfigOptions(p => ({...p, syncTasks: !p.syncTasks}))}
                    className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all ${configOptions.syncTasks ? 'bg-indigo-600/10 border-indigo-500 text-indigo-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Highlight Sync Tasks <Link size={16} className={configOptions.syncTasks ? 'opacity-100' : 'opacity-20'} />
                  </button>
                </div>
              </section>

              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Interval To-dos</h3>
                {sessionToPrepare.intervals.map(interval => (
                  <div key={interval.id} className="bg-slate-800/40 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-200 flex items-center gap-2">
                        {interval.name} 
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{formatTime(interval.durationSeconds)}</span>
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* List of current tasks */}
                      <div className="flex flex-wrap gap-2">
                        {preparedTasks[interval.id]?.map((t, idx) => (
                          <div key={idx} className="bg-indigo-900/30 border border-indigo-800/50 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 group">
                            <span className="text-indigo-200">{t}</span>
                            <button 
                              onClick={() => setPreparedTasks(p => ({...p, [interval.id]: p[interval.id].filter((_, i) => i !== idx)}))}
                              className="text-indigo-400 hover:text-rose-400 transition-colors"
                            >
                              <X size={14}/>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* New task input field */}
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={taskInputs[interval.id] || ''}
                          onChange={(e) => setTaskInputs(prev => ({ ...prev, [interval.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(interval.id)}
                          placeholder="What will you do in this interval?"
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                        <button 
                          onClick={() => handleAddTask(interval.id)}
                          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50">
              <button 
                onClick={startSession}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                Launch Session <Play size={18} fill="currentColor"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
