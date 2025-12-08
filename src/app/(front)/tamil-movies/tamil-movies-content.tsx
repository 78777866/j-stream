'use client';

import { useState, useEffect } from 'react';
import { RequestType } from '@/enums/request-type';
import { MediaType } from '@/types';
import MovieService from '@/services/MovieService';
import ShowsCarousel from '@/components/shows-carousel';
import TamilMovieModal from '@/components/tamil-movie-modal';
import type { Show } from '@/types';

interface TamilMoviesContentProps {}

const TamilMoviesContent: React.FC<TamilMoviesContentProps> = () => {
  const [tamilMovies, setTamilMovies] = useState<{
    trending: Show[];
    latest: Show[];
    topRated: Show[];
    popular: Show[];
  }>({
    trending: [],
    latest: [],
    topRated: [],
    popular: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Show | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTamilMovies = async () => {
      try {
        setLoading(true);
        
        const requests = [
          {
            title: 'Trending Tamil Movies',
            req: {
              requestType: RequestType.TAMIL_TRENDING,
              mediaType: MediaType.MOVIE,
            },
            visible: true,
          },
          {
            title: 'Latest Tamil Movies',
            req: {
              requestType: RequestType.TAMIL_LATEST,
              mediaType: MediaType.MOVIE,
            },
            visible: true,
          },
          {
            title: 'Top Rated Tamil Movies',
            req: {
              requestType: RequestType.TAMIL_TOP_RATED,
              mediaType: MediaType.MOVIE,
            },
            visible: true,
          },
          {
            title: 'Popular Tamil Movies',
            req: {
              requestType: RequestType.TAMIL_POPULAR,
              mediaType: MediaType.MOVIE,
            },
            visible: true,
          },
        ];

        const response = await MovieService.getShows(requests);
        
        setTamilMovies({
          trending: response[0]?.shows || [],
          latest: response[1]?.shows || [],
          topRated: response[2]?.shows || [],
          popular: response[3]?.shows || [],
        });
      } catch (error) {
        console.error('Error fetching Tamil movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTamilMovies();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Tamil movies...</div>;
  }

  const handleMovieClick = (movie: Show) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Tamil Movies</h1>
            <p className="text-xl">Watch the latest Tamil films with YouTube streaming</p>
          </div>
        </div>

        {/* Movie Categories */}
        {tamilMovies.trending.length > 0 && (
          <ShowsCarousel 
            title="Trending Tamil Movies" 
            shows={tamilMovies.trending}
            onMovieClick={handleMovieClick}
          />
        )}
        
        {tamilMovies.latest.length > 0 && (
          <ShowsCarousel 
            title="Latest Tamil Movies" 
            shows={tamilMovies.latest}
            onMovieClick={handleMovieClick}
          />
        )}
        
        {tamilMovies.topRated.length > 0 && (
          <ShowsCarousel 
            title="Top Rated Tamil Movies" 
            shows={tamilMovies.topRated}
            onMovieClick={handleMovieClick}
          />
        )}
        
        {tamilMovies.popular.length > 0 && (
          <ShowsCarousel 
            title="Popular Tamil Movies" 
            shows={tamilMovies.popular}
            onMovieClick={handleMovieClick}
          />
        )}

        {/* No Movies Found */}
        {!loading && 
         tamilMovies.trending.length === 0 && 
         tamilMovies.latest.length === 0 && 
         tamilMovies.topRated.length === 0 && 
         tamilMovies.popular.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Tamil Movies Found</h2>
            <p className="text-muted-foreground">
              We're working on adding more Tamil movies to our collection.
            </p>
          </div>
        )}
      </div>

      {/* Tamil Movie Modal */}
      <TamilMovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default TamilMoviesContent; 