
import { 
  Timer, 
  CheckSquare, 
  Clock as StopwatchIcon, 
  Hourglass, 
  Settings as SettingsIcon,
  Layout as LayoutIcon,
  Info
} from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children }) => {
  const navItems = [
    { view: AppView.INTERVAL_TIMER, icon: <Timer size={20} />, label: 'Intervals' },
    { view: AppView.TODO_LIST, icon: <CheckSquare size={20} />, label: 'To-do list' },
    { view: AppView.STOPWATCH, icon: <StopwatchIcon size={20} />, label: 'Stopwatch' },
    { view: AppView.SINGLE_TIMER, icon: <Hourglass size={20} />, label: 'Presets' },
    { view: AppView.SETTINGS, icon: <SettingsIcon size={20} />, label: 'Settings' },
    { view: AppView.ABOUT, icon: <Info size={20} />, label: 'About' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <LayoutIcon size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Task-Timer</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                currentView === item.view 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-12">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Universal Footer */}
        <footer className="p-6 text-center text-slate-500 text-[10px] md:text-xs border-t border-slate-900/50 bg-slate-950/80 backdrop-blur-sm">
            <p>&copy; 2026 Sayantan Ghosal. All Rights Reserved.</p>
        </footer>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-3 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                currentView === item.view ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
