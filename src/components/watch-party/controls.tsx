'use client';

import React from 'react';
import { Power, RefreshCw } from 'lucide-react';
import { useWatchPartyStore } from '@/stores/watch-party';
import { WatchPartyService } from '@/services/WatchPartyService';
import { useRouter } from 'next/navigation';

interface PartyControlsProps {
    currentEpisode?: {
        season_number: number;
        episode_number: number;
    } | null;
}

export default function PartyControls({ currentEpisode }: PartyControlsProps) {
    const { party, isHost } = useWatchPartyStore();
    const router = useRouter();

    if (!party || !isHost) return null;

    const handleEndParty = async () => {
        if (!confirm('Are you sure you want to end this watch party?')) return;

        try {
            await WatchPartyService.endParty(party.id);
            alert('Watch party ended');
            router.replace(window.location.pathname);
        } catch (error) {
            console.error('Failed to end party:', error);
        }
    };

    const handleForceSync = async () => {
        try {
            await WatchPartyService.updatePlaybackState(party.id, {
                season_number: currentEpisode?.season_number,
                episode_number: currentEpisode?.episode_number,
            });
        } catch (error) {
            console.error('Failed to force sync:', error);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => { void handleForceSync(); }}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-neon-cyan/20 transition-colors"
                title="Force Sync">
                <RefreshCw className="w-4 h-4" />
            </button>
            <button
                onClick={() => { void handleEndParty(); }}
                className="p-2 rounded-full bg-black/50 text-red-400 hover:bg-red-500/20 transition-colors"
                title="End Party">
                <Power className="w-4 h-4" />
            </button>
        </div>
    );
}
