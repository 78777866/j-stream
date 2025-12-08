import { create } from 'zustand';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user && data.session) {
      set({ user: data.user, session: data.session, loading: false });
    } else {
      set({ loading: false });
    }
    
    return { error };
  },
  
  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },
  
  checkAuth: async () => {
    set({ loading: true });
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      set({ user: session.user, session, loading: false });
    } else {
      set({ user: null, session: null, loading: false });
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        set({ user: session.user, session, loading: false });
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, session: null, loading: false });
      }
    });
  },
})); 