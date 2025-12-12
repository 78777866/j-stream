import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type WatchParty = Database['public']['Tables']['watch_parties']['Row'];
type WatchPartyInsert = Database['public']['Tables']['watch_parties']['Insert'];
type MessageInsert = Database['public']['Tables']['watch_party_messages']['Insert'];

export const WatchPartyService = {
    async createParty(partyData: Omit<WatchPartyInsert, 'id' | 'created_at' | 'last_updated'>) {
        const { data, error } = await supabase
            .from('watch_parties')
            .insert(partyData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async joinParty(partyId: string) {
        const { data, error } = await supabase
            .from('watch_parties')
            .select()
            .eq('id', partyId)
            .single();

        if (error) throw error;
        return data;
    },

    async endParty(partyId: string) {
        const { error } = await supabase
            .from('watch_parties')
            .delete()
            .eq('id', partyId);

        if (error) throw error;
    },

    async sendMessage(partyId: string, content: string, userId?: string, guestName?: string) {
        const message: MessageInsert = {
            party_id: partyId,
            content,
            user_id: userId || null,
            guest_name: guestName || null,
        };

        const { error } = await supabase
            .from('watch_party_messages')
            .insert(message);

        if (error) throw error;
    },

    async updatePlaybackState(
        partyId: string,
        update: {
            is_playing?: boolean;
            current_time_seconds?: number;
            season_number?: number;
            episode_number?: number;
        }
    ) {
        const { error } = await supabase
            .from('watch_parties')
            .update({
                ...update,
                last_updated: new Date().toISOString()
            })
            .eq('id', partyId);

        if (error) throw error;
    },

    async getMessages(partyId: string) {
        const { data, error } = await supabase
            .from('watch_party_messages')
            .select('*')
            .eq('party_id', partyId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getProfiles(userIds: string[]) {
        // Filter out nulls
        const validIds = userIds.filter(id => id);
        if (validIds.length === 0) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', validIds);

        if (error) console.error('Error fetching profiles', error);
        return data || [];
    }
};
