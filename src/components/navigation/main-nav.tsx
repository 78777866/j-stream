'use client';

import React from 'react';
import { type Show, type NavItem } from '@/types';
import Link from 'next/link';
import {
  cn,
  getSearchValue,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import { useAuthStore } from '@/stores/auth';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';
import { useState } from 'react';

interface MainNavProps {
  items?: NavItem[];
}

interface SearchResult {
  results: Show[];
}

export function MainNav({ items }: MainNavProps) {
  const path = usePathname();
  const router = useRouter();
  // search store
  const searchStore = useSearchStore();
  const { signOut } = useAuthStore();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, []);

  const handlePopstateEvent = () => {
    const pathname = window.location.pathname;
    const search: string = getSearchValue('q');

    if (!search?.length || !pathname.includes('/search')) {
      searchStore.reset();
      searchStore.setOpen(false);
    } else if (search?.length) {
      searchStore.setOpen(true);
      searchStore.setLoading(true);
      searchStore.setQuery(search);
      setTimeout(() => {
        handleDefaultSearchBtn();
      }, 10);
      setTimeout(() => {
        handleDefaultSearchInp();
      }, 20);
      MovieService.searchMovies(search)
        .then((response: SearchResult) => {
          void searchStore.setShows(response.results);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => searchStore.setLoading(false));
    }
  };

  async function searchShowsByQuery(value: string) {
    if (!value?.trim()?.length) {
      if (path === '/search') {
        router.push('/home');
      } else {
        window.history.pushState(null, '', path);
      }
      return;
    }

    if (getSearchValue('q')?.trim()?.length) {
      window.history.replaceState(null, '', `search?q=${value}`);
    } else {
      window.history.pushState(null, '', `search?q=${value}`);
    }

    searchStore.setQuery(value);
    searchStore.setLoading(true);
    const shows = await MovieService.searchMovies(value);
    searchStore.setLoading(false);
    void searchStore.setShows(shows.results);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // change background color on scroll
  React.useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  const handleChangeStatusOpen = (value: boolean): void => {
    searchStore.setOpen(value);
    if (!value) searchStore.reset();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 z-40 flex h-12 w-full items-center justify-between px-[4vw] transition-all duration-500 md:h-16',
          isScrolled
            ? 'border-b border-white/10 bg-background/80 shadow-lg backdrop-blur-xl'
            : 'bg-gradient-to-b from-background/40 to-transparent backdrop-blur-md',
        )}>
        <div className="flex items-center gap-6 md:gap-10">
          {/* Hamburger for mobile */}
          <button
            className="flex items-center justify-center p-2 md:hidden"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}>
            <Icons.menu className="h-6 w-6" />
          </button>
          {/* Logo (desktop) */}
          <Link
            href="/"
            className="hidden md:block"
            onClick={() => handleChangeStatusOpen(false)}>
            <div className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" aria-hidden="true" />
              <span className="inline-block font-bold">{siteConfig.name}</span>
              <span className="sr-only">Home</span>
            </div>
          </Link>
          {/* Desktop nav */}
          {items?.length ? (
            <nav className="hidden gap-6 md:flex">
              {items?.map(
                (item, index) =>
                  item.href && (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        'flex items-center text-sm font-medium text-foreground/60 transition hover:text-foreground/80',
                        path === item.href && 'font-bold text-foreground',
                        item.disabled && 'cursor-not-allowed opacity-80',
                      )}
                      onClick={() => handleChangeStatusOpen(false)}>
                      {item.title}
                    </Link>
                  ),
              )}
            </nav>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <DebouncedInput
            id="search-input"
            open={searchStore.isOpen}
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
            containerClassName={cn(path === '/' ? 'hidden' : 'flex')}
          />
          <Link
            rel="noreferrer"
            target="_blank"
            href={siteConfig.links.github}
            className={cn(path === '/' ? 'flex' : 'hidden')}>
            <Icons.gitHub className="h-5 w-5 hover:bg-transparent" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="hidden md:flex">
            <Icons.logout className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <ThemeToggle />
        </div>
      </nav>
      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu overlay"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-4/5 max-w-xs flex-col border-r border-white/10 bg-background/90 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-left-80 md:hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center space-x-2">
                <Icons.logo className="h-6 w-6" />
                <span className="text-lg font-bold">{siteConfig.name}</span>
              </Link>
              <button
                className="p-2"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}>
                <Icons.close className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto p-4">
              {items?.map((item, index) => (
                <Link
                  key={index}
                  href={item.href || '#'}
                  className={cn(
                    'block rounded px-3 py-2 text-base font-medium',
                    path === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                    item.disabled && 'pointer-events-none opacity-60',
                  )}
                  onClick={() => setDrawerOpen(false)}>
                  {item.title}
                </Link>
              ))}
              <button
                onClick={async () => {
                  await handleSignOut();
                  setDrawerOpen(false);
                }}
                className="mt-4 flex w-full items-center gap-2 rounded px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10">
                <Icons.logout className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

export default MainNav;
