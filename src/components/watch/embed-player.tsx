'use client';
import React from 'react';
import Loading from '../ui/loading';
import { useRouter } from 'next/navigation';
import { MediaType, type IEpisode, type ISeason, type Show } from '@/types';
import MovieService from '@/services/MovieService';
import { type AxiosResponse } from 'axios';
import Season from '../season';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { getNameFromShow } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useWatchPartyStore } from '@/stores/watch-party';
import { WatchPartyService } from '@/services/WatchPartyService';
import ChatPanel from '../watch-party/chat-panel';
import PartyControls from '../watch-party/controls';
import CreatePartyModal from '../watch-party/create-modal';
import type { Database } from '@/types/supabase';

type WatchParty = Database['public']['Tables']['watch_parties']['Row'];

interface EmbedPlayerProps {
  url?: string;
  movieId?: string;
  mediaType?: MediaType;
}

const SERVERS = [
  { name: 'VidSrc 1', domain: 'vidsrc.cc' },
  { name: 'VidSrc 2', domain: 'vidsrc-embed.ru' },
  { name: 'VidSrc 3', domain: 'vidsrc-embed.su' },
  { name: 'VidSrc 4', domain: 'vidsrcme.su' },
  { name: 'VidSrc 5', domain: 'vsrc.su' },
];

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partyId = searchParams.get('partyId');
  const { user } = useAuthStore();
  const { party, setParty, isHost, setIsHost } = useWatchPartyStore();

  const [seasons, setSeasons] = React.useState<ISeason[] | null>(null);
  const [selectedServer, setSelectedServer] = React.useState(SERVERS[0]);
  const [currentEpisode, setCurrentEpisode] = React.useState<IEpisode | null>(
    null,
  );
  const [showData, setShowData] = React.useState<Show | null>(null);

  React.useEffect(() => {
    // Initial load handling
    if (
      props.mediaType === MediaType.ANIME ||
      props.mediaType === MediaType.TV
    ) {
      // Wait for season data
    } else {
      // Movie
      if (props.movieId) {
        void handleMovieData(props.movieId);
      }
      updateIframeUrl();
    }

    const { current } = iframeRef;
    const iframe: HTMLIFrameElement | null = current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, []);

  React.useEffect(() => {
    if (!props.movieId) {
      return;
    }

    if (
      props.mediaType === MediaType.ANIME ||
      props.mediaType === MediaType.TV
    ) {
      void handleShowData(props.movieId);
    } else {
      // Re-update for movie if server changes
      updateIframeUrl();
    }
  }, [props.movieId, props.mediaType, selectedServer]);

  // Update URL when episode changes (for TV/Anime)
  React.useEffect(() => {
    if (currentEpisode) {
      updateIframeUrl();
    }
  }, [currentEpisode, selectedServer]);

  // Update Continue Watching
  React.useEffect(() => {
    if (user && showData) {
      void updateContinueWatching();
    }
  }, [user, showData, currentEpisode, props.mediaType, props.movieId]);

  // Watch Party Logic
  React.useEffect(() => {
    if (!partyId) {
      setParty(null);
      return;
    }

    const initParty = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const p = await WatchPartyService.joinParty(partyId);
        setParty(p as WatchParty);

        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setIsHost(user.id === p.host_id);
        } else {
          setIsHost(false);
        }
      } catch (e) {
        console.error('Failed to join party', e);
        router.replace(window.location.pathname);
      }
    };

    void initParty();

    const channel = supabase
      .channel(`party_updates:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'watch_parties',
          filter: `id=eq.${partyId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const newParty = payload.new as WatchParty;
          setParty(newParty);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'watch_parties',
          filter: `id=eq.${partyId}`,
        },
        () => {
          alert('The watch party has ended.');
          setParty(null);
          router.replace(window.location.pathname);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    }
  }, [partyId, user]);

  // Sync Guest Playback
  React.useEffect(() => {
    if (!party || isHost || !seasons) return;

    if (party.season_number && party.episode_number) {
      if (
        !currentEpisode ||
        currentEpisode.season_number !== party.season_number ||
        currentEpisode.episode_number !== party.episode_number
      ) {
        const season = seasons.find(
          (s) => s.season_number === party.season_number,
        );
        const episode = season?.episodes.find(
          (e) => e.episode_number === party.episode_number,
        );
        if (episode) {
          setCurrentEpisode(episode);
        }
      }
    }
  }, [party, seasons, isHost, currentEpisode]);

  const loadingRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleChangeEpisode = (episode: IEpisode): void => {
    setCurrentEpisode(episode);
    if (isHost && party) {
      void WatchPartyService.updatePlaybackState(party.id, {
        season_number: episode.season_number,
        episode_number: episode.episode_number,
      });
    }
  };

  const updateContinueWatching = async () => {
    if (!user || !showData || !props.movieId) return;

    const title = getNameFromShow(showData);
    const poster_path = showData.poster_path ?? showData.backdrop_path;
    const id = props.movieId.replace('t-', '');

    const data = {
      user_id: user.id,
      tmdb_id: id,
      media_type: props.mediaType,
      season_number: currentEpisode?.season_number ?? null,
      episode_number: currentEpisode?.episode_number ?? null,
      title,
      poster_path,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('continue_watching')
      .upsert(data, { onConflict: 'user_id, tmdb_id' });

    if (error) {
      console.error('Error updating continue watching:', error);
    }
  };

  const handleMovieData = async (movieId: string) => {
    const id = Number(movieId.replace('t-', ''));
    try {
      const response: AxiosResponse<Show> = await MovieService.findMovie(id);
      setShowData(response.data);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  };

  const handleShowData = async (movieId: string) => {
    const id = Number(movieId.replace('t-', ''));
    // Use findTvSeries for both TV and Anime as they share structure in TMDB/Service
    const response: AxiosResponse<Show> = await MovieService.findTvSeries(id);
    const { data } = response;
    setShowData(data); // Set show data

    if (!data?.seasons?.length) {
      return;
    }
    const seasons = data.seasons.filter(
      (season: ISeason) => season.season_number,
    );
    const promises = seasons.map(async (season: ISeason) => {
      return MovieService.getSeasons(id, season.season_number);
    });

    const seasonWithEpisodes = await Promise.all(promises);
    const resolvedSeasons = seasonWithEpisodes.map(
      (res: AxiosResponse<ISeason>) => res.data,
    );
    setSeasons(resolvedSeasons);

    // Auto-select first episode if not set
    if (
      !currentEpisode &&
      resolvedSeasons.length > 0 &&
      resolvedSeasons[0].episodes.length > 0
    ) {
      setCurrentEpisode(resolvedSeasons[0].episodes[0]);
    }
  };

  const updateIframeUrl = () => {
    if (!iframeRef.current || !props.movieId) return;

    const id = props.movieId.replace('t-', '');
    let url = '';

    if (selectedServer.domain === 'vidsrc.cc') {
      // Original logic for vidsrc.cc
      if (props.mediaType === MediaType.MOVIE) {
        url = `https://vidsrc.cc/v2/embed/movie/${id}`;
      } else if (props.mediaType === MediaType.TV) {
        if (currentEpisode) {
          url = `https://vidsrc.cc/v2/embed/tv/${id}/${currentEpisode.season_number}/${currentEpisode.episode_number}`;
        } else {
          url = `https://vidsrc.cc/v2/embed/tv/${id}`;
        }
      } else if (props.mediaType === MediaType.ANIME) {
        if (currentEpisode) {
          url = `https://vidsrc.cc/v2/embed/anime/tmdb${id}/${currentEpisode.episode_number}/sub`;
        } else {
          // Default to ep 1
          url = `https://vidsrc.cc/v2/embed/anime/tmdb${id}/1/sub`;
        }
      }
    } else {
      // New providers (vidsrc-embed.ru etc)
      const baseUrl = `https://${selectedServer.domain}/embed`;

      if (props.mediaType === MediaType.MOVIE) {
        url = `${baseUrl}/movie?tmdb=${id}`;
      } else if (
        props.mediaType === MediaType.TV ||
        props.mediaType === MediaType.ANIME
      ) {
        if (currentEpisode) {
          url = `${baseUrl}/tv?tmdb=${id}&season=${currentEpisode.season_number}&episode=${currentEpisode.episode_number}`;
        } else {
          // Fallback if no episode selected yet
          url = `${baseUrl}/tv?tmdb=${id}&season=1&episode=1`;
        }
      }
    }

    if (url) {
      handleSetIframeUrl(url);
    }
  };

  const handleSetIframeUrl = (url: string): void => {
    if (!iframeRef.current) {
      return;
    }
    // Avoid reloading if same URL
    if (iframeRef.current.src === url) return;

    iframeRef.current.src = url;
    const { current } = iframeRef;
    const iframe: HTMLIFrameElement | null = current;
    iframe?.addEventListener('load', handleIframeLoaded);
    if (loadingRef.current) loadingRef.current.style.display = 'flex';
  };

  const handleIframeLoaded = () => {
    if (!iframeRef.current) {
      return;
    }
    const iframe: HTMLIFrameElement = iframeRef.current;
    if (iframe) {
      iframe.style.opacity = '1';
      iframe.removeEventListener('load', handleIframeLoaded);
      if (loadingRef.current) loadingRef.current.style.display = 'none';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
        display: 'flex',
      }}>

      <div className={party ? "relative flex-1 h-full" : "relative w-full h-full"}>
        {seasons && (
          <Season seasons={seasons ?? []} onChangeEpisode={handleChangeEpisode} />
        )}
        <div className="header-top absolute left-0 right-0 top-8 z-[2] flex h-fit w-fit items-center justify-between gap-x-5 px-4 md:h-20 md:gap-x-8 md:px-10 lg:h-24">
          <div className="flex flex-1 items-center gap-x-5 md:gap-x-8">
            {!partyId && (
              <svg
                className="h-10 w-10 flex-shrink-0 cursor-pointer transition hover:scale-125"
                stroke="#fff"
                fill="#fff"
                strokeWidth="0"
                viewBox="0 0 16 16"
                height="16px"
                width="16px"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => router.back()}>
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"></path>
              </svg>
            )}

            <div className="flex items-center gap-2">
              <Select
                value={selectedServer.name}
                onValueChange={(value: string) => {
                  const server = SERVERS.find((s) => s.name === value);
                  if (server) setSelectedServer(server);
                }}>
                <SelectTrigger className="w-[140px] border-white/20 bg-black/50 text-white backdrop-blur-sm">
                  <SelectValue placeholder="Select Server" />
                </SelectTrigger>
                <SelectContent>
                  {SERVERS.map((server) => (
                    <SelectItem key={server.name} value={server.name}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!party && showData && (
              <CreatePartyModal
                show={showData}
                movieId={props.movieId}
                mediaType={props.mediaType ?? MediaType.MOVIE}
                currentEpisode={currentEpisode ? { season_number: currentEpisode.season_number, episode_number: currentEpisode.episode_number } : undefined}
              />
            )}

            <PartyControls 
              currentEpisode={currentEpisode ? { 
                season_number: currentEpisode.season_number, 
                episode_number: currentEpisode.episode_number 
              } : null} 
            />

            {party && (
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(window.location.href);
                  alert('Party link copied to clipboard!');
                }}
                className="glass-button p-2 px-4 rounded-full text-white bg-black/50 hover:bg-neon-cyan/20 flex items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
                Share
              </button>
            )}
          </div>
        </div>
        <div
          ref={loadingRef}
          className="absolute z-[1] flex h-full w-full items-center justify-center">
          <Loading />
        </div>
        <iframe
          width="100%"
          height="100%"
          allowFullScreen
          ref={iframeRef}
          style={{ opacity: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {party && (
        <div className="w-[350px] h-full relative z-[20]">
          <ChatPanel className="h-full" />
        </div>
      )}
    </div>
  );
}

export default EmbedPlayer;
