
export enum AppView {
  INTERVAL_TIMER = 'INTERVAL_TIMER',
  TODO_LIST = 'TODO_LIST',
  STOPWATCH = 'STOPWATCH',
  SINGLE_TIMER = 'SINGLE_TIMER',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT'
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Interval {
  id: string;
  name: string;
  durationSeconds: number;
  soundId: string;
  tasks: Task[];
}

export interface Session {
  id: string;
  name: string;
  cycles: number;
  intervals: Interval[];
  createdAt: number;
}

export interface StandaloneTask {
  id: string;
  text: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
  soundId: string;
  priority: number; // 0 to 5
}

export interface TimerPreset {
  id: string;
  name: string;
  durationSeconds: number;
}

export interface SoundOption {
  id: string;
  name: string;
  url: string;
}
