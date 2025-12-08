// import type { FooterItem, MainNavItem } from "@/types"
//
// import { productCategories } from "@/config/products"
// import { slugify } from "@/lib/utils"

import { Icons } from '@/components/icons';
import { env } from '@/env.mjs';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'NEON',
  author: 'NEON',
  slogan: 'Experience the Glow of Premium Streaming.',
  description:
    'NEON - Your ultimate streaming destination. Immerse yourself in a world of movies & TV shows with a vibrant, premium experience on any device.',
  keywords: [
    'neon',
    'neon movies',
    'streaming platform',
    'premium streaming',
    'watch movies',
    'movies online',
    'watch TV',
    'TV online',
    'TV shows online',
    'watch TV shows',
    'stream movies',
    'stream tv',
    'instant streaming',
    'watch online',
    'movies',
    'watch TV online',
    'no download',
    'full length movies',
    'NEON',
  ],
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/images/hero.jpg`,
  links: {
    twitter: `${env.NEXT_PUBLIC_TWITTER}`,
    github: 'https://github.com/bitfreee/jstream',
    githubAccount: '',
  },
  socialLinks: [
    {
      title: 'Facebook',
      href: `${env.NEXT_PUBLIC_FACEBOOK}`,
      icon: Icons.facebook,
    },
    {
      title: 'Instagram',
      href: `${env.NEXT_PUBLIC_INSTAGRAM}`,
      icon: Icons.instagram,
    },
    {
      title: 'Twitter',
      href: `${env.NEXT_PUBLIC_TWITTER}`,
      icon: Icons.twitter,
    },
    {
      title: 'Youtube',
      href: `${env.NEXT_PUBLIC_YOUTUBE}`,
      icon: Icons.youtube,
    },
  ],
  footerItems: [
    { title: 'Audio Description', href: '/' },
    { title: 'Help Center', href: '/' },
    { title: 'Gift Cards', href: '/' },
    { title: 'Media Center', href: '/' },
    { title: 'Investor Relations', href: '/' },
    { title: 'Jobs', href: '/' },
    { title: 'Terms of Use', href: '/terms-of-use' },
    { title: 'Privacy', href: '/' },
    { title: 'Legal Notices', href: '/' },
    { title: 'Cookie Preferences', href: '/' },
    { title: 'Corporate Information', href: '/' },
    { title: 'Contact Us', href: '/' },
  ],
  mainNav: [
    {
      title: 'Home',
      href: '/home',
      // icon: Icons.play,
    },
    {
      title: 'TV Shows',
      href: '/tv-shows',
      // icon: Icons.tvShow,
    },
    {
      title: 'Movies',
      href: '/movies',
      // icon: Icons.movie,
    },
    {
      title: 'Anime',
      href: '/anime',
      // icon: Icons.list,
    },
    {
      title: 'New & Popular',
      href: '/new-and-popular',
      // icon: Icons.trendingUp,
    },
    {
      title: 'About',
      href: '/about',
      // icon: Icons.info,
    },
  ],
};
