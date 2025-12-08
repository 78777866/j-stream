'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import Youtube from 'react-youtube';
import type { Show } from '@/types';

interface TamilMovieModalProps {
  movie: Show | null;
  isOpen: boolean;
  onClose: () => void;
}

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  internalPlayer: YouTubePlayer;
};

type YouTubeEvent = {
  target: YouTubePlayer;
};

const TamilMovieModal: React.FC<TamilMovieModalProps> = ({ movie, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string>('');
  const youtubeRef = useRef(null);

  // Extract YouTube ID from movie title (you can customize this logic)
  useEffect(() => {
    if (movie) {
      // This is a placeholder - you'll need to implement your own logic
      // to map movie titles to YouTube video IDs
      const movieTitle = movie.title || movie.name || '';
      // For now, we'll use a placeholder YouTube ID
      // In a real implementation, you'd have a database mapping movie titles to YouTube IDs
      setYoutubeId('dQw4w9WgXcQ'); // Placeholder - replace with actual mapping
    }
  }, [movie]);

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event: YouTubeEvent) => {
    if (youtubeRef.current) {
      const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
      if (isMuted && youtubeRef.current) {
        videoRef.mute();
      } else if (youtubeRef.current) {
        videoRef.unMute();
      }
    }
  };

  const onEnd = (event: YouTubeEvent) => {
    setIsPlaying(false);
  };

  const onStateChange = (event: YouTubeEvent) => {
    if (event.target.internalPlayer.getPlayerState() === 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (youtubeRef.current) {
      const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
      if (isPlaying) {
        videoRef.pauseVideo();
      } else {
        videoRef.playVideo();
      }
    }
  };

  const handleMuteToggle = () => {
    if (youtubeRef.current) {
      const videoRef: YouTubePlayer = youtubeRef.current as YouTubePlayer;
      if (isMuted) {
        videoRef.unMute();
        setIsMuted(false);
      } else {
        videoRef.mute();
        setIsMuted(true);
      }
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{movie.title || movie.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* YouTube Player */}
          <div className="relative">
            <Youtube
              videoId={youtubeId}
              opts={opts}
              onReady={onReady}
              onEnd={onEnd}
              onStateChange={onStateChange}
              ref={youtubeRef}
              className="w-full"
            />
            
            {/* Player Controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="flex items-center space-x-2"
              >
                {isPlaying ? (
                  <>
                    <Icons.pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Icons.play className="h-4 w-4" />
                    <span>Play</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMuteToggle}
                className="flex items-center space-x-2"
              >
                {isMuted ? (
                  <>
                    <Icons.volumeMute className="h-4 w-4" />
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <Icons.volume className="h-4 w-4" />
                    <span>Mute</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Movie Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movie Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Movie Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {movie.title || movie.name}</p>
                  <p><strong>Release Date:</strong> {movie.release_date || movie.first_air_date}</p>
                  <p><strong>Rating:</strong> {Math.round((movie.vote_average || 0) * 10)}%</p>
                  <p><strong>Language:</strong> Tamil</p>
                  <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
                </div>
              </div>

              {movie.overview && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
                  <p className="text-sm text-muted-foreground">{movie.overview}</p>
                </div>
              )}
            </div>

            {/* IMDB Integration */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">IMDB Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>IMDB ID:</strong> {movie.id}</p>
                  <p><strong>Popularity:</strong> {Math.round(movie.popularity || 0)}</p>
                  <p><strong>Vote Count:</strong> {movie.vote_count?.toLocaleString()}</p>
                </div>
              </div>

              {/* External Links */}
              <div>
                <h3 className="text-lg font-semibold mb-2">External Links</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.imdb.com/title/tt${movie.id}`, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <Icons.info className="h-4 w-4" />
                    <span>IMDB</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title || movie.name || '')}`, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <Icons.youtube className="h-4 w-4" />
                    <span>YouTube</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> This movie is streamed via YouTube. The video quality and availability may vary. 
              We do not host any copyrighted content on our servers.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TamilMovieModal; 