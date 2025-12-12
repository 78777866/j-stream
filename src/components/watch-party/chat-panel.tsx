'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Users } from 'lucide-react';
import { useWatchPartyStore } from '@/stores/watch-party';
import { WatchPartyService } from '@/services/WatchPartyService';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/supabase';

type WatchPartyMessage = Database['public']['Tables']['watch_party_messages']['Row'] & {
    user_email?: string;
};

interface ChatPanelProps {
    className?: string;
}

type PresenceState = {
    user_id?: string;
    user_email?: string;
    guest_name?: string;
    online_at: string;
};

export default function ChatPanel({ className }: ChatPanelProps) {
    const { party, messages, addMessage, setMessages, guestName, setGuestName } = useWatchPartyStore();
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState('');
    const [tempGuestName, setTempGuestName] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [profiles, setProfiles] = useState<Record<string, { email: string }>>({});
    const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);

    // Subscribe to new messages and presence
    useEffect(() => {
        if (!party) return;

        // Load initial messages
        const loadMessages = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const msgs = await WatchPartyService.getMessages(party.id);
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userIds = Array.from(new Set(msgs?.map((m: any) => m.user_id as string).filter((id: any) => !!id) || []));
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const profilesData = (await WatchPartyService.getProfiles(userIds)) as any[];

                const profileMap: Record<string, { email: string }> = {};
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                profilesData?.forEach((p: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    profileMap[p.id] = { email: p.email || 'Unknown' };
                });
                setProfiles(prev => ({ ...prev, ...profileMap }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const augmentedMessages = msgs?.map((m: any) => ({
                    ...m,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    user_email: m.user_id ? (profileMap[m.user_id]?.email ?? 'User') : (m.guest_name ?? 'Guest')
                })) || [];

                setMessages(augmentedMessages as WatchPartyMessage[]);
            } catch (error) {
                console.error(error);
            }
        };

        void loadMessages();

        // Subscribe to realtime
        const channel = supabase
            .channel(`party_chat:${party.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'watch_party_messages',
                    filter: `party_id=eq.${party.id}`,
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (payload: any) => {
                    void (async () => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        const newMsg = payload.new as WatchPartyMessage;

                        if (newMsg.user_id) {
                            if (!profiles[newMsg.user_id]) {
                                const [profile] = await WatchPartyService.getProfiles([newMsg.user_id]) || [];
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                if (profile) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                                    setProfiles(prev => ({ ...prev, [(profile as any).id]: { email: (profile as any).email || 'Unknown' } }));
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                                    newMsg.user_email = (profile as any).email || 'User';
                                }
                            } else {
                                newMsg.user_email = profiles[newMsg.user_id].email;
                            }
                        } else {
                            newMsg.user_email = newMsg.guest_name ?? 'Guest';
                        }

                        addMessage(newMsg);
                    })();
                }
            )
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState<PresenceState>();
                const users: PresenceState[] = [];
                for (const key in newState) {
                    users.push(...newState[key]);
                }
                setOnlineUsers(users);
            })
            .subscribe((status) => {
                void (async () => {
                    if (status === 'SUBSCRIBED') {
                        if (user || guestName) {
                            await channel.track({
                                user_id: user?.id,
                                user_email: user?.email,
                                guest_name: guestName,
                                online_at: new Date().toISOString(),
                            });
                        }
                    }
                })();
            });

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [party?.id, user, guestName]); // Re-subscribe if user identity changes

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !party) return;

        if (!user && !guestName) return;

        try {
            if (user) {
                await WatchPartyService.sendMessage(party.id, newMessage.trim(), user.id);
            } else if (guestName) {
                await WatchPartyService.sendMessage(party.id, newMessage.trim(), undefined, guestName);
            }
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSetGuestName = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempGuestName.trim()) {
            setGuestName(tempGuestName.trim());
        }
    };

    if (!party) return null;

    return (
        <div className={cn("flex flex-col h-full bg-black/80 backdrop-blur-md border-l border-white/10", className)}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neon-cyan" />
                        <span className="font-bold text-white">Watch Party</span>
                    </div>
                    <span className="text-xs text-white/50 ml-6">{onlineUsers.length} online</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = (user && msg.user_id === user.id) || (!user && msg.guest_name === guestName);
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[85%]",
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <span className="text-xs text-white/50 mb-1">
                                {isMe ? 'You' : msg.user_email?.split('@')[0] ?? 'User'}
                            </span>
                            <div
                                className={cn(
                                    "p-3 rounded-xl text-sm break-words",
                                    isMe
                                        ? "bg-neon-cyan/20 text-white rounded-tr-none"
                                        : "bg-white/10 text-white rounded-tl-none"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {user || guestName ? (
                <form onSubmit={(e) => { void handleSendMessage(e); }} className="p-4 border-t border-white/10">
                    <div className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pr-10 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neon-cyan hover:text-white disabled:opacity-50 disabled:hover:text-neon-cyan transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSetGuestName} className="p-4 border-t border-white/10 flex flex-col gap-2">
                    <p className="text-sm text-white/60 text-center">Enter your name to chat</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tempGuestName}
                            onChange={(e) => setTempGuestName(e.target.value)}
                            placeholder="Your Name"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan/50"
                        />
                        <button
                            type="submit"
                            disabled={!tempGuestName.trim()}
                            className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Join
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
