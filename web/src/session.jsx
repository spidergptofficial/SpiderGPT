import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';
import { supabase } from './supabase.js';

const Ctx = createContext(null);
export const useSession = () => useContext(Ctx);

export function SessionProvider({ children }) {
  const [state, setState] = useState({ loading: true, me: null });

  const refresh = useCallback(async () => {
    try {
      const me = await api('/api/me');
      setState({ loading: false, me });
      return me;
    } catch {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (accessToken) {
        try {
          await api('/auth/supabase', { method: 'POST', body: { accessToken } });
          const me = await api('/api/me');
          setState({ loading: false, me });
          return me;
        } catch {
          // Fall through to signed-out state.
        }
      }
      setState({ loading: false, me: null });
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    await supabase.auth.signOut().catch(() => {});
    setState({ loading: false, me: null });
  }, []);

  useEffect(() => {
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) refresh();
    });
    return () => listener.subscription.unsubscribe();
  }, [refresh]);

  return <Ctx.Provider value={{ ...state, refresh, logout }}>{children}</Ctx.Provider>;
}
