
import { SOUND_OPTIONS } from './constants';

export const formatTime = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s]
    .map(v => v < 10 ? '0' + v : v)
    .join(':');
};

export const parseTimeToSeconds = (h: number, m: number, s: number): number => {
  return (h * 3600) + (m * 60) + s;
};

/**
 * Generates synthetic sounds using Web Audio API to ensure 100% reliability
 * and fix "no supported source was found" errors from external links.
 */
export const playSound = (soundId: string) => {
  const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
  const ctx = new AudioContextClass();

  const playNote = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + duration);
  };

  const now = ctx.currentTime;

  switch (soundId) {
    case 'bell':
      playNote(880, now, 1.0, 'sine', 0.5);
      playNote(1760, now, 0.5, 'sine', 0.2);
      break;
    
    case 'digital':
      for (let i = 0; i < 3; i++) {
        playNote(987.77, now + (i * 0.15), 0.1, 'square', 0.3);
      }
      break;
      
    case 'success':
      playNote(523.25, now, 0.1, 'sine', 0.4);
      playNote(659.25, now + 0.1, 0.1, 'sine', 0.4);
      playNote(783.99, now + 0.2, 0.1, 'sine', 0.4);
      playNote(1046.50, now + 0.3, 0.4, 'sine', 0.4);
      break;
      
    case 'electronic':
      playNote(2000, now, 0.05, 'sawtooth', 0.2);
      playNote(1500, now + 0.08, 0.05, 'sawtooth', 0.2);
      break;
      
    case 'warning':
      for (let i = 0; i < 4; i++) {
        playNote(1200, now + (i * 0.2), 0.1, 'triangle', 0.5);
        playNote(800, now + (i * 0.2) + 0.1, 0.1, 'triangle', 0.5);
      }
      break;

    default:
      playNote(440, now, 0.5);
  }
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
