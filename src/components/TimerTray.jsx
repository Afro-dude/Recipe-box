import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
export function TimerTray() {
  const { state, update } = useLibrary();
  const [now, setNow] = useState(Date.now());
  const announced = useRef(new Set());
  const [notice, setNotice] = useState('');
  useEffect(() => { if (!state.timers.length) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, [state.timers.length]);
  useEffect(() => {
    for (const timer of state.timers) if (timer.endsAt <= now && !announced.current.has(timer.id)) {
      announced.current.add(timer.id); setNotice(`${timer.label}: timer finished.`);
    }
  }, [now, state.timers]);
  if (!state.timers.length) return null;
  return <aside className="timer-tray" aria-label="Cooking timers"><p className="sr-only" role="status">{notice}</p>{state.timers.map(timer => {
    const seconds = Math.max(0, Math.ceil((timer.endsAt - now)/1000));
    return <div className={seconds ? 'timer' : 'timer timer--done'} key={timer.id}>
      <Link to={`/box/${timer.recipeId}`}>{timer.label}</Link>
      <strong>{seconds ? `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}` : 'Ready!'}</strong>
      <button className="text-button" aria-label={`Dismiss ${timer.label} timer`} onClick={() => update(s => ({ ...s, timers: s.timers.filter(t => t.id !== timer.id) }))}>Dismiss</button>
    </div>;
  })}</aside>;
}
