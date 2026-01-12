
import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, CheckCircle2, Circle, Clock, ListTodo, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { StandaloneTask } from '../../types';
import { generateId, formatTime, parseTimeToSeconds } from '../../utils';
import { DEFAULT_SOUND_ID } from '../../constants';

interface TaskManagerProps {
  tasks: StandaloneTask[];
  setTasks: (tasks: StandaloneTask[]) => void;
  toggleTimer: (id: string) => void;
  deleteTask: (id: string) => void;
  endTimesRef: React.MutableRefObject<Record<string, number>>;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, toggleTimer, deleteTask, endTimesRef }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [h, sH] = useState(0);
  const [m, sM] = useState(0);
  const [s, sS] = useState(0);
  const [priorityEnabled, setPriorityEnabled] = useState(false);

  useEffect(() => {
    const savedPriorityToggle = localStorage.getItem('task-timer-priority-enabled');
    if (savedPriorityToggle !== null) setPriorityEnabled(JSON.parse(savedPriorityToggle));
  }, []);

  useEffect(() => {
    localStorage.setItem('task-timer-priority-enabled', JSON.stringify(priorityEnabled));
  }, [priorityEnabled]);

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const duration = parseTimeToSeconds(h, m, s);
    const newTask: StandaloneTask = {
      id: generateId(), 
      text: newTaskText, 
      totalSeconds: duration, 
      remainingSeconds: duration,
      isRunning: false, 
      isCompleted: false, 
      soundId: DEFAULT_SOUND_ID,
      priority: 0
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText(''); sH(0); sM(0); sS(0);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const becomingCompleted = !t.isCompleted;
        if (becomingCompleted) delete endTimesRef.current[t.id];
        return { ...t, isCompleted: becomingCompleted, remainingSeconds: becomingCompleted ? 0 : t.totalSeconds, isRunning: false };
      }
      return t;
    }));
  };

  const setPriority = (id: string, stars: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextPriority = t.priority === stars ? 0 : stars;
        return { ...t, priority: nextPriority };
      }
      return t;
    }));
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newTasks.length) {
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
      setTasks(newTasks);
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">To-do list</h1>
          <p className="text-slate-400 text-sm">Organize tasks with individual countdowns</p>
        </div>
        <button 
          onClick={() => setPriorityEnabled(!priorityEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${priorityEnabled ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
        >
          {priorityEnabled ? 'Priority Enabled' : 'Enable Priority'}
        </button>
      </header>

      {/* Task Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span className="flex items-center gap-2">
              <ListTodo size={14} className="text-indigo-400" />
              Task Progress
            </span>
            <span className="text-slate-200">{completedCount} of {tasks.length} ({Math.round(progressPercent)}%)</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && addTask()}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            placeholder="What needs to be done?"
          />
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 font-mono text-xs">
            <Clock size={14} className="text-slate-500" />
            <div className="flex items-center gap-1">
              <input type="number" min="0" max="23" value={h} onChange={e => sH(clamp(parseInt(e.target.value) || 0, 0, 23))} className="bg-transparent w-8 text-center outline-none" />
              <span>:</span>
              <input type="number" min="0" max="59" value={m} onChange={e => sM(clamp(parseInt(e.target.value) || 0, 0, 59))} className="bg-transparent w-8 text-center outline-none" />
              <span>:</span>
              <input type="number" min="0" max="59" value={s} onChange={e => sS(clamp(parseInt(e.target.value) || 0, 0, 59))} className="bg-transparent w-8 text-center outline-none" />
            </div>
          </div>
          <button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"><Plus size={20} /></button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={task.id} className={`group bg-slate-900 border transition-all rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 ${task.isCompleted ? 'border-slate-800/50 opacity-40 grayscale' : 'border-slate-800 hover:border-slate-700 shadow-md hover:shadow-lg'}`}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveTask(index, 'up')} className="text-slate-600 hover:text-indigo-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUp size={14} /></button>
                <button onClick={() => moveTask(index, 'down')} className="text-slate-600 hover:text-indigo-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowDown size={14} /></button>
              </div>
              <button onClick={() => toggleTaskStatus(task.id)} className={`p-1 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-slate-600 hover:text-indigo-400'}`}>
                {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <span className={`font-medium text-lg block ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.text}</span>
              {priorityEnabled && !task.isCompleted && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setPriority(task.id, star)}
                      className={`transition-all hover:scale-110 ${task.priority >= star ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      <Star 
                        size={14} 
                        fill={task.priority >= star ? "currentColor" : "none"} 
                        strokeWidth={task.priority >= star ? 0 : 2}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {task.totalSeconds > 0 && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${task.isRunning ? 'bg-indigo-600/10 border-indigo-500/50 shadow-inner' : 'bg-slate-800 border-slate-700'}`}>
                <span className={`font-mono font-bold min-w-[70px] text-center ${task.isRunning ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`}>{formatTime(task.remainingSeconds)}</span>
                <button onClick={() => toggleTimer(task.id)} disabled={task.isCompleted} className={`p-1.5 rounded-lg transition-all ${task.isRunning ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
                  {task.isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
              </div>
            )}
            <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
