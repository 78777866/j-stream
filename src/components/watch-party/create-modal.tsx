'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { WatchPartyService } from '@/services/WatchPartyService';
import { useWatchPartyStore } from '@/stores/watch-party';
import { useRouter } from 'next/navigation';
import { MediaType, Show } from '@/types';

interface CreatePartyModalProps {
    show: Show;
    movieId?: string;
    mediaType: MediaType;
    currentEpisode?: {
        season_number: number;
        episode_number: number;
    };
}

export default function CreatePartyModal({
    show,
    movieId,
    mediaType,
    currentEpisode,
}: CreatePartyModalProps) {
    const { user } = useAuthStore();
    const { setParty, setIsHost } = useWatchPartyStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    if (!user) return null;

    const handleCreateParty = async () => {
        if (!movieId || !user) return;

        setIsCreating(true);
        try {
            const tmdb_id = movieId.replace('t-', '');

            const party = await WatchPartyService.createParty({
                host_id: user.id,
                tmdb_id,
                media_type: mediaType,
                season_number: currentEpisode?.season_number || null,
                episode_number: currentEpisode?.episode_number || null,
            });

            setParty(party);
            setIsHost(true);

            // Update URL with partyId
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('partyId', party.id);
            router.replace(currentUrl.pathname + currentUrl.search);

            setIsOpen(false);
        } catch (error) {
            console.error('Failed to create party:', error);
            alert('Failed to create watch party');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors text-sm font-medium">
                <Users className="w-4 h-4" />
                Watch Party
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-background border border-white/10 rounded-lg p-6 max-w-md w-full shadow-2xl">
                            <h2 className="text-xl font-bold mb-4 text-white">Start Watch Party</h2>
                            <p className="text-white/60 mb-6">
                                Invite friends to watch {show.title || show.name} together with synchronized playback and real-time chat!
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateParty}
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 rounded-lg bg-neon-cyan text-black hover:bg-neon-cyan/90 transition-colors font-medium disabled:opacity-50">
                                    {isCreating ? 'Creating...' : 'Start Party'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
