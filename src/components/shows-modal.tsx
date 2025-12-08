'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, getMobileDetect, getYear } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import {
  type KeyWord,
  MediaType,
  type Genre,
  type ShowWithGenreAndVideo,
  type VideoResult,
} from '@/types';
import Link from 'next/link';
import * as React from 'react';
import Youtube from 'react-youtube';
import CustomImage from './custom-image';

type YouTubePlayer = {
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  seekTo: (value: number) => void;
  container: HTMLDivElement;
  internalPlayer: YouTubePlayer;
};

type YouTubeEvent = {
  target: YouTubePlayer;
};

const userAgent =
  typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const { isMobile } = getMobileDetect(userAgent);
const defaultOptions: Record<string, object> = {
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    rel: 0,
    mute: 1,
    loop: 1,
    autoplay: 1,
    controls: 0,
    showinfo: 0,
    disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    cc_load_policy: 0,
    modestbranding: 3,
  },
};

const ShowModal = () => {
  // stores
  const modalStore = useModalStore();
  const IS_MOBILE: boolean = isMobile();

  const [trailer, setTrailer] = React.useState('');
  const [isPlaying, setPlaying] = React.useState(true);
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isAnime, setIsAnime] = React.useState<boolean>(false);
  const [isMuted, setIsMuted] = React.useState<boolean>(true);
  const [options, setOptions] =
    React.useState<Record<string, object>>(defaultOptions);

  const youtubeRef = React.useRef(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // get trailer and genres of show
  React.useEffect(() => {
    if (modalStore.firstLoad || IS_MOBILE) {
      setOptions((state: Record<string, object>) => ({
        ...state,
        playerVars: { ...state.playerVars, mute: 1 },
      }));
    }
    void handleGetData();
  }, []);

  React.useEffect(() => {
    setIsAnime(false);
  }, [modalStore]);

  const handleGetData = async () => {
    const id: number | undefined = modalStore.show?.id;
    const type: string =
      modalStore.show?.media_type === MediaType.TV ? 'tv' : 'movie';
    if (!id || !type) {
      return;
    }
    const data: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
      id,
      type,
    );

    const keywords: KeyWord[] =
      data?.keywords?.results || data?.keywords?.keywords;

    if (keywords?.length) {
      setIsAnime(
        !!keywords.find((keyword: KeyWord) => keyword.name === 'anime'),
      );
    }

    if (data?.genres) {
      setGenres(data.genres);
    }
    if (data.videos?.results?.length) {
      const videoData: VideoResult[] = data.videos?.results;
      const result: VideoResult | undefined = videoData.find(
        (item: VideoResult) => item.type === 'Trailer',
      );
      if (result?.key) setTrailer(result.key);
    }
  };

  const handleCloseModal = () => {
    modalStore.reset();
    if (!modalStore.show || modalStore.firstLoad) {
      window.history.pushState(null, '', '/home');
    } else {
      window.history.back();
    }
  };

  const onEnd = (event: YouTubeEvent) => {
    event.target.seekTo(0);
  };

  const onPlay = () => {
    if (imageRef.current) {
      imageRef.current.style.opacity = '0';
    }
    if (youtubeRef.current) {
      const iframeRef: HTMLElement | null =
        document.getElementById('video-trailer');
      if (iframeRef) iframeRef.classList.remove('opacity-0');
    }
  };

  const onReady = (event: YouTubeEvent) => {
    event.target.playVideo();
  };

  const handleChangeMute = () => {
    setIsMuted((state: boolean) => !state);
    if (!youtubeRef.current) return;
    const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
    if (isMuted && youtubeRef.current) {
      videoRef.internalPlayer.unMute();
    } else if (youtubeRef.current) {
      videoRef.internalPlayer.mute();
    }
  };

  const handleHref = (): string => {
    const type = isAnime
      ? 'anime'
      : modalStore.show?.media_type === MediaType.MOVIE
        ? 'movie'
        : 'tv';
    let id = `${modalStore.show?.id}`;
    if (isAnime) {
      const prefix: string =
        modalStore.show?.media_type === MediaType.MOVIE ? 'm' : 't';
      id = `${prefix}-${id}`;
    }
    return `/watch/${type}/${id}`;
  };

  return (
    <Dialog
      open={modalStore.open}
      onOpenChange={handleCloseModal}
      aria-label="Modal containing show's details">
      <DialogContent className="w-full max-w-5xl overflow-hidden rounded-xl bg-zinc-950 p-0 text-left align-middle shadow-2xl ring-1 ring-white/10 sm:rounded-2xl">
        <div className="relative w-full">
          {/* Video/Image Container - Aspect Ratio Wrapper */}
          <div className="relative aspect-video w-full overflow-hidden">
            {/* Background Image */}
            <CustomImage
              fill
              priority
              ref={imageRef}
              alt={modalStore?.show?.title ?? 'poster'}
              className="z-0 h-full w-full object-cover transition-opacity duration-700"
              src={`https://image.tmdb.org/t/p/original${modalStore.show?.backdrop_path ?? modalStore.show?.poster_path
                }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />

            {/* YouTube Player */}
            {trailer && (
              <div className="absolute inset-0 z-0">
                <Youtube
                  opts={options}
                  onEnd={onEnd}
                  onPlay={onPlay}
                  ref={youtubeRef}
                  onReady={onReady}
                  videoId={trailer}
                  id="video-trailer"
                  title={
                    modalStore.show?.title ??
                    modalStore.show?.name ??
                    'video-trailer'
                  }
                  className="h-full w-full"
                  style={{ width: '100%', height: '100%' }}
                  iframeClassName="w-full h-full opacity-0 transition-opacity duration-700"
                />
              </div>
            )}

            {/* Gradient Overlay - Desktop Only */}
            <div className="absolute inset-0 z-10 hidden bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent sm:block" />

            {/* Gradient Overlay - Mobile Only (Bottom Fade) */}
            <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-zinc-950 to-transparent sm:hidden" />
          </div>

          {/* Content Container - Relative on Mobile, Absolute Overlay on Desktop */}
          <div className="relative z-20 flex flex-col justify-end bg-zinc-950 p-6 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:bg-transparent sm:p-10">
            <div className="flex flex-col gap-4">
              {/* Title & Tagline */}
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl sm:drop-shadow-lg">
                  {modalStore.show?.title ?? modalStore.show?.name}
                </DialogTitle>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-200 sm:text-base">
                  <span className="text-green-400 font-bold">
                    {Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ?? '-'}% Match
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span>
                    {modalStore.show?.release_date
                      ? getYear(modalStore.show?.release_date)
                      : modalStore.show?.first_air_date
                        ? getYear(modalStore.show?.first_air_date)
                        : '-'}
                  </span>
                  <span className="text-zinc-400">•</span>
                  {modalStore.show?.original_language && (
                    <span className="uppercase px-1.5 py-0.5 rounded bg-white/10 text-xs font-bold tracking-wider">
                      {modalStore.show.original_language}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <DialogDescription className="line-clamp-3 max-w-2xl text-sm text-zinc-300 sm:text-lg sm:leading-relaxed sm:drop-shadow-md">
                {modalStore.show?.overview ?? '-'}
              </DialogDescription>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Link href={handleHref()} className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    className="w-full gap-2 rounded-lg bg-white text-black hover:bg-zinc-200 sm:w-auto font-bold text-base h-12 px-8 transition-transform active:scale-95"
                  >
                    <Icons.play className="h-5 w-5 fill-current" />
                    Play Now
                  </Button>
                </Link>

                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white transition-colors"
                  onClick={handleChangeMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <Icons.volumeMute className="h-5 w-5" />
                  ) : (
                    <Icons.volume className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowModal;
