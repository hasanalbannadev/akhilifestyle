"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/errors";

// API থেকে ডাটা এনে loading/error/data দেয়। reload() দিয়ে আবার আনা যায়।
export function useAsync<T>(fn: () => Promise<T>, enabled = true, every = 0) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await fn()); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (enabled) load(); }, [enabled, load]);

  // নীরব অটো-রিফ্রেশ: ট্যাব খোলা থাকলে প্রতি `every` ms-এ চুপচাপ নতুন তথ্য আনে (স্পিনার নেই, বদলালে তবেই আপডেট)
  const last = useRef("");
  useEffect(() => {
    if (!enabled || !every) return;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const d = await fn(); const j = JSON.stringify(d);
        if (j !== last.current) { last.current = j; setData(d); }
      } catch { /* পরের বারে */ }
    };
    const t = setInterval(tick, every);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, every]);

  return { data, setData, loading, error, reload: load };
}
