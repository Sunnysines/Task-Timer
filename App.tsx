
import React, { useState, useEffect, useRef } from 'react';
import { AppView, StandaloneTask } from './types';
import Layout from './components/Layout';
import SessionManager from './components/IntervalTimer/SessionManager';
import TaskManager from './components/TodoList/TaskManager';
import Stopwatch from './components/Stopwatch/Stopwatch';
import PresetTimer from './components/SingleTimer/PresetTimer';
import Settings from './components/Settings';
import About from './components/About';
import { playSound } from './utils';
import { DEFAULT_SOUND_ID } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.INTERVAL_TIMER);
  const [tasks, setTasks] = useState<StandaloneTask[]>([]);
  const endTimesRef = useRef<Record<string, number>>({});

  // Initialize tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('task-timer-standalone-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasks(parsed);
        // Re-establish endTimes for currently running tasks
        parsed.forEach((task: StandaloneTask) => {
          if (task.isRunning && task.remainingSeconds > 0) {
            endTimesRef.current[task.id] = Date.now() + (task.remainingSeconds * 1000);
          }
        });
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  // Save tasks to localStorage on change
  useEffect(() => {
    localStorage.setItem('task-timer-standalone-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Background timer engine for standalone tasks
  useEffect(() => {
    const interval = setInterval(() => {
      const autoCheckSaved = localStorage.getItem('task-timer-auto-check');
      const autoCheck = autoCheckSaved !== null ? JSON.parse(autoCheckSaved) : true;
      const defaultSound = localStorage.getItem('task-timer-default-sound') || DEFAULT_SOUND_ID;

      setTasks(prev => {
        let changed = false;
        const next = prev.map(task => {
          if (task.isRunning) {
            const target = endTimesRef.current[task.id];
            if (!target) return task;
            
            const remaining = Math.max(0, Math.round((target - Date.now()) / 1000));
            
            if (remaining === 0) {
              playSound(defaultSound);
              delete endTimesRef.current[task.id];
              changed = true;
              return { 
                ...task, 
                remainingSeconds: 0, 
                isRunning: false, 
                isCompleted: autoCheck ? true : task.isCompleted 
              };
            }
            
            if (remaining !== task.remainingSeconds) {
              changed = true;
              return { ...task, remainingSeconds: remaining };
            }
          }
          return task;
        });
        return changed ? next : prev;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Helper functions for task management passed to TaskManager
  const updateTasks = (updatedTasks: StandaloneTask[]) => {
    setTasks(updatedTasks);
  };

  const toggleTimer = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextRunning = !t.isRunning;
        if (nextRunning) {
          endTimesRef.current[t.id] = Date.now() + (t.remainingSeconds * 1000);
        } else {
          delete endTimesRef.current[t.id];
        }
        return { ...t, isRunning: nextRunning };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    delete endTimesRef.current[id];
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.INTERVAL_TIMER:
        return <SessionManager />;
      case AppView.TODO_LIST:
        return (
          <TaskManager 
            tasks={tasks} 
            setTasks={updateTasks} 
            toggleTimer={toggleTimer} 
            deleteTask={deleteTask}
            endTimesRef={endTimesRef}
          />
        );
      case AppView.STOPWATCH:
        return <Stopwatch />;
      case AppView.SINGLE_TIMER:
        return <PresetTimer />;
      case AppView.SETTINGS:
        return <Settings />;
      case AppView.ABOUT:
        return <About />;
      default:
        return <SessionManager />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
