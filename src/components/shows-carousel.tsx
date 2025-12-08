'use client';

import { useModalStore } from '@/stores/modal';
import { MediaType, type Show } from '@/types';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn, getNameFromShow, getSlug } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import CustomImage from './custom-image';

interface ShowsCarouselProps {
  title: string;
  shows: Show[];
}

const ShowsCarousel = ({ title, shows }: ShowsCarouselProps) => {
  const pathname = usePathname();

  const showsRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);

  // handle scroll to left and right
  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!showsRef.current) return;

    setIsScrollable(true);
    const { scrollLeft, offsetWidth } = showsRef.current;
    const handleSize = offsetWidth > 1400 ? 60 : 0.04 * offsetWidth;
    const offset =
      direction === 'left'
        ? scrollLeft - (offsetWidth - 2 * handleSize)
        : scrollLeft + (offsetWidth - 2 * handleSize);
    showsRef.current.scrollTo({ left: offset, behavior: 'smooth' });

    if (scrollLeft === 0 && direction === 'left') {
      showsRef.current.scrollTo({
        left: showsRef.current.scrollWidth,
        behavior: 'smooth',
      });
    } else if (
      scrollLeft + offsetWidth === showsRef.current.scrollWidth &&
      direction === 'right'
    ) {
      showsRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section aria-label="Carousel of shows" className="relative my-[3vw] p-0">
      {shows.length !== 0 && (
        <div className="space-y-1 sm:space-y-2.5">
          <h2 className="m-0 px-4 sm:px-[4%] text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground sm:text-xl 2xl:px-[60px]">
            {title ?? '-'}
          </h2>
          <div className="relative w-full items-center justify-center overflow-hidden">
            <Button
              aria-label="Scroll to left"
              variant="ghost"
              className={cn(
                'absolute left-0 top-0 z-10 mr-2 hidden h-full w-[4%] items-center justify-center rounded-l-none bg-transparent py-0 text-transparent hover:bg-secondary/90 hover:text-foreground md:block 2xl:w-[60px]',
                isScrollable ? 'md:block' : 'md:hidden',
              )}
              onClick={() => scrollToDirection('left')}>
              <Icons.chevronLeft className="h-8 w-8" aria-hidden="true" />
            </Button>
            <div
              ref={showsRef}
              className="no-scrollbar flex w-full gap-4 overflow-x-auto overflow-y-hidden px-4 py-4 scroll-smooth snap-x snap-mandatory sm:px-[4%] 2xl:px-[60px]"
            >
              {shows.map((show) => (
                <div
                  key={show.id}
                  className="flex-shrink-0 w-[40%] xs:w-[30%] sm:w-[20%] md:w-[16.66%] lg:w-[14.28%] xl:w-[12.5%] snap-start"
                >
                  <ShowCard show={show} pathname={pathname} />
                </div>
              ))}
            </div>
            <Button
              aria-label="Scroll to right"
              variant="ghost"
              className="absolute right-0 top-0 z-10 m-0 ml-2 hidden h-full w-[4%] items-center justify-center rounded-r-none bg-transparent py-0 text-transparent hover:bg-secondary/70 hover:text-foreground md:block 2xl:w-[60px]"
              onClick={() => scrollToDirection('right')}>
              <Icons.chevronRight className="h-8 w-8" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShowsCarousel;

export const ShowCard = ({ show }: { show: Show; pathname: string }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  const handleCardClick = () => {
    console.log('Card clicked:', show.title || show.name); // Debug log
    const name = getNameFromShow(show);
    const path: string =
      show.media_type === MediaType.TV ? 'tv-shows' : 'movies';
    window.history.pushState(
      null,
      '',
      `${path}/${getSlug(show.id, name)}`,
    );
    useModalStore.setState({
      show: show,
      open: true,
      play: true,
    });
  };

  return (
    <div
      className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-muted transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      onClick={handleCardClick}
    >
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${show.poster_path ?? show.backdrop_path
            }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={show.title ?? show.name ?? 'poster'}
        className="h-full w-full rounded-lg transition-all duration-300 group-hover:brightness-75"
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
        style={{
          objectFit: 'cover',
        }}
        onError={imageOnErrorHandler}
      />
      {/* Overlay with title on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-xs font-medium text-white line-clamp-2 sm:text-sm">
            {show.title || show.name}
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            {Math.round(show.vote_average * 10)}% Match
          </p>
        </div>
      </div>
    </div>
  );
};
