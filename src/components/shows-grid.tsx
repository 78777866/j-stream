'use client';

import { useModalStore } from '@/stores/modal';
import type { Show } from '@/types';
import ShowModal from './shows-modal';
import { ShowCard } from './shows-carousel';
import { usePathname } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import ShowsSkeleton from './shows-skeleton';
import { cn } from '@/lib/utils';

interface SearchedShowsProps {
  shows: Show[];
  query?: string;
}

const ShowsGrid = ({ shows, query }: SearchedShowsProps) => {
  const pathname = usePathname();
  // modal store
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  return (
    <section aria-label="Grid of shows" className="container w-full max-w-none">
      {modalStore.open && <ShowModal />}
      <div className="main-view mt-4 min-h-[800px] pt-[5%] px-4 sm:px-6 md:px-8" id="main-view">
        {query && searchStore.loading ? (
          <ShowsSkeleton classname="pl-0" />
        ) : query && !shows?.length ? (
          <div className="text-center">
            <div className="inline-block text-left text-sm">
              <p className="mb-4">{`Your search for "${query}" did not have any matches.`}</p>
              <p className="mb-4">Suggestions:</p>
              <ul className="list-disc pl-8">
                <li>Try different keywords</li>
                <li>Looking for a movie or TV show?</li>
                <li>Try using a movie, TV show title, an actor or director</li>
                <li>Try a genre, like comedy, romance, sports, or drama</li>
              </ul>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-3 sm:gap-4 md:gap-6 lg:gap-8',
              // Mobile-first responsive grid - 4 movies on mobile
              'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8',
              // Special handling for search results
              query && 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8',
            )}>
            {shows.map((show: Show) => (
              <ShowCard key={show.id} show={show} pathname={pathname} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShowsGrid;
