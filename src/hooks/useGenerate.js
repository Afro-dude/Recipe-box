import { useEffect, useRef, useState } from 'react';
import { requestRecipe, createRequestGate } from '../services/ai';
export function useGenerate() {
  const gate = useRef(createRequestGate());
  const controller = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => { gate.current.cancel(); controller.current?.abort(); }, []);
  const cancel = () => { gate.current.cancel(); controller.current?.abort(); setLoading(false); setError(''); };
  const run = async payload => {
    controller.current?.abort();
    controller.current = new AbortController();
    const id = gate.current.next();
    setLoading(true); setError('');
    try {
      const recipe = await requestRecipe(payload, controller.current.signal);
      if (gate.current.current(id)) return recipe;
    } catch (e) { if (gate.current.current(id)) setError(e.message); }
    finally { if (gate.current.current(id)) setLoading(false); }
    return null;
  };
  return { run, loading, error, cancel };
}
