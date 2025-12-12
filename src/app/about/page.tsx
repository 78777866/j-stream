'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { siteConfig } from '@/configs/site';
import { WebGLNeonBackdrop } from '@/components/about/webgl-neon-backdrop';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* WebGL Neon Backdrop */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <WebGLNeonBackdrop className="h-full w-full opacity-80 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/90" />
      </div>

      {/* Fallback Glow Layers */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="group flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
          >
            <Icons.chevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Button>
        </div>

        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl shadow-purple-500/10">
                <Icons.logo className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
                {siteConfig.name}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              The ultimate premium streaming experience for movies, TV shows, and anime.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-white/10 hover:bg-white/20 border-white/10 backdrop-blur-md transition-all">
                ✨ Next-Gen Streaming
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-white/10 hover:bg-white/20 border-white/10 backdrop-blur-md transition-all">
                🚀 Ultra Fast
              </Badge>
            </div>
          </div>

          {/* Mission Section */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-purple-900/20 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8 md:p-12 text-center relative z-10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Redefining Entertainment
              </h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-white">NEON</strong> is built with a singular vision: to provide a seamless, immersive, and premium viewing experience. We combine cutting-edge web technologies with elegant design to bring you a platform that feels as good as it looks.
                </p>
                <p>
                  Whether you're here for the latest blockbusters, timeless classics, or trending anime, NEON delivers it all with zero interruptions and maximum quality.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">Why Choose NEON?</h2>
              <p className="text-lg text-muted-foreground">
                Crafted for the modern viewer
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Movies',
                  icon: Icons.movie,
                  color: 'text-blue-400',
                  desc: 'Extensive collection from all genres',
                  items: ['Latest Releases', '4K Quality', 'Curated Lists']
                },
                {
                  title: 'TV Shows',
                  icon: Icons.tvShow,
                  color: 'text-green-400',
                  desc: 'Binge-worthy series and episodes',
                  items: ['Complete Seasons', 'Auto-Next Episode', 'Progress Tracking']
                },
                {
                  title: 'Anime',
                  icon: Icons.list,
                  color: 'text-pink-400',
                  desc: 'Japanese animation library',
                  items: ['Sub & Dub', 'Simulcasts', 'Top Rated']
                },
                {
                  title: 'Smart Search',
                  icon: Icons.search,
                  color: 'text-yellow-400',
                  desc: 'Find exactly what you want',
                  items: ['Instant Results', 'Genre Filters', 'Actor Search']
                },
                {
                  title: 'Mobile First',
                  icon: Icons.smartphone,
                  color: 'text-purple-400',
                  desc: 'Perfect on any device',
                  items: ['Responsive Design', 'Touch Optimized', 'PWA Support']
                },
                {
                  title: 'User Focused',
                  icon: Icons.user,
                  color: 'text-cyan-400',
                  desc: 'Designed for you',
                  items: ['No Ads', 'Dark Mode', 'Custom Lists']
                }
              ].map((feature, i) => (
                <Card key={i} className="border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 group">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg bg-white/5 ${feature.color}`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-purple-200 transition-colors">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.items.map((item, j) => (
                        <li key={j} className="flex items-center text-sm text-muted-foreground">
                          <span className={`mr-2 h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-${feature.color.split('-')[1]}-400 transition-colors`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-12 border-t border-white/5">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/50 mt-2">
              This project is for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}