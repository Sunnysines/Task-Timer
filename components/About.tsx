
import React from 'react';
import { Mail, Shield, Zap, Target, MousePointer2, ListPlus } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="space-y-12 pb-24 max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">About Task-Timer</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Your all-in-one productivity hub designed to bridge the gap between structured time management and actionable tasks.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold">The Mission</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Structuring time is only half the battle. Task-Timer helps you focus on *what* you're doing while managing *how* long you're doing it.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold">Privacy First</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your sessions, tasks, and settings stay exactly where they belong: on your device. We use browser local storage to keep your data safe and private.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Key Features</h2>
        <ul className="space-y-4">
          <li className="flex gap-4">
            <div className="shrink-0 mt-1 p-2 bg-slate-800 rounded-lg text-indigo-400"><Target size={18} /></div>
            <div>
              <h4 className="font-bold">Advanced Interval Timers</h4>
              <p className="text-sm text-slate-400">Create complex workflows like Pomodoro, HIIT, or study cycles. Each block can have custom names, sounds, and associated to-dos.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="shrink-0 mt-1 p-2 bg-slate-800 rounded-lg text-indigo-400"><ListPlus size={18} /></div>
            <div>
              <h4 className="font-bold">Task-Time Sync</h4>
              <p className="text-sm text-slate-400">Assign specific tasks to specific intervals. Mark them off as you go, and watch your progress bar grow in real-time.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="shrink-0 mt-1 p-2 bg-slate-800 rounded-lg text-indigo-400"><MousePointer2 size={18} /></div>
            <div>
              <h4 className="font-bold">Priority Management</h4>
              <p className="text-sm text-slate-400">Rank your standalone to-dos with our 5-star priority system to ensure the most important work gets done first.</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-6 bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[40px] shadow-inner">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          How to Master Custom Intervals
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          To get the most out of the interval timer, use the <strong>Assign Tasks</strong> prompt when starting a session. This allows you to list out the exact work for each segment. 
          Enable <strong>Task-Based Progress</strong> in the launch screen to make the main progress bar reflect completed work rather than just elapsed time.
        </p>
      </section>

      <section className="pt-8 border-t border-slate-800">
        <h2 className="text-2xl font-bold mb-4 text-white">Contact & Support</h2>
        <p className="text-slate-400 text-sm mb-6">
          Have feedback or found a bug? I'd love to hear from you.
        </p>
        <a 
          href="mailto:ghosalsayantan293@gmail.com" 
          className="inline-flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all font-bold group shadow-md"
        >
          <Mail size={20} className="group-hover:text-indigo-400 transition-colors" />
          ghosalsayantan293@gmail.com
        </a>
      </section>

      <div className="text-center text-slate-600 text-xs py-10">
        © 2026 Task-Timer. Made for productivity.
      </div>
    </div>
  );
};

export default About;
