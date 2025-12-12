import { create } from 'zustand';
import { Database } from '@/types/supabase';

type WatchParty = Database['public']['Tables']['watch_parties']['Row'];
type WatchPartyMessage = Database['public']['Tables']['watch_party_messages']['Row'] & {
    user_email?: string; // Augmented with user email or guest name logic
};

interface WatchPartyState {
    party: WatchParty | null;
    messages: WatchPartyMessage[];
    isHost: boolean;
    isLoading: boolean;
    guestName: string | null;

    // Actions
    setParty: (party: WatchParty | null) => void;
    setMessages: (messages: WatchPartyMessage[]) => void;
    addMessage: (message: WatchPartyMessage) => void;
    setIsHost: (isHost: boolean) => void;
    setLoading: (loading: boolean) => void;
    setGuestName: (name: string | null) => void;
    reset: () => void;
}

export const useWatchPartyStore = create<WatchPartyState>((set) => ({
    party: null,
    messages: [],
    isHost: false,
    isLoading: false,
    guestName: null,

    setParty: (party) => set({ party }),
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setIsHost: (isHost) => set({ isHost }),
    setLoading: (isLoading) => set({ isLoading }),
    setGuestName: (guestName) => set({ guestName }),
    reset: () => set({ party: null, messages: [], isHost: false, isLoading: false, guestName: null }),
}));
