import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

let subscriptionId = 0;

export function usePortfolioTable(table) {
  const [state, setState] = useState({ data: [], loading: true, error: false });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let active = true;
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const { data, error } = await supabase.from(table).select('*').eq('is_published', true)
          .order('sort_order').order('id');
        if (error) throw error;
        if (active && current === request) setState({ data: data ?? [], loading: false, error: false });
      } catch {
        if (active && current === request) setState(previous => ({ ...previous, loading: false, error: true }));
      }
    };
    refresh();
    const channel = supabase.channel(`portfolio-${table}-${++subscriptionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
      .subscribe(status => { if (status === 'SUBSCRIBED') refresh(); });
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('online', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
      supabase.removeChannel(channel);
    };
  }, [table, revision]);
  return { ...state, retry };
}

export function safeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function asList(value) { return Array.isArray(value) ? value : []; }
