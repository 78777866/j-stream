"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEFAULT_QUERIES = [
  "latest tamil movies 2024",
  "tamil comedy movies",
  "tamil action movies",
  "tamil romantic movies",
  "tamil thriller movies",
];

// Multiple CORS proxies to try as fallbacks
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
  "https://cors-anywhere.herokuapp.com/",
  "https://thingproxy.freeboard.io/fetch/",
];

function extractVideosFromHTML(html: string) {
  console.log("🔍 Starting HTML parsing...");
  console.log("📄 HTML length:", html.length);
  
  // This regex finds videoRenderer objects in the initial data JSON
  const initialDataMatch = html.match(/var ytInitialData = ([\s\S]*?);<\/script>/);
  if (!initialDataMatch) {
    console.error("❌ No ytInitialData found in HTML");
    return [];
  }
  
  console.log("✅ Found ytInitialData, length:", initialDataMatch[1].length);
  
  let data;
  try {
    data = JSON.parse(initialDataMatch[1]);
    console.log("✅ Successfully parsed JSON data");
  } catch (error) {
    console.error("❌ Failed to parse JSON:", error);
    return [];
  }
  
  const videos: any[] = [];
  function walk(obj: any) {
    if (!obj || typeof obj !== "object") return;
    if (obj.videoRenderer) {
      videos.push(obj.videoRenderer);
      console.log("🎬 Found video:", obj.videoRenderer.videoId);
    }
    for (const key in obj) walk(obj[key]);
  }
  walk(data);
  
  console.log(`🎯 Total videos found: ${videos.length}`);
  
  const processedVideos = videos.map((v) => ({
    id: v.videoId,
    title: v.title?.runs?.[0]?.text || "",
    thumbnail:
      v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url || "",
    duration:
      v.lengthText?.simpleText ||
      v.lengthText?.accessibility?.accessibilityData?.label ||
      "",
    channel: v.ownerText?.runs?.[0]?.text || "",
    views: v.viewCountText?.simpleText || "",
    published: v.publishedTimeText?.simpleText || "",
    description: v.descriptionSnippet?.runs?.map((r: any) => r.text).join("") || "",
  }));
  
  console.log("📊 Processed videos:", processedVideos.length);
  return processedVideos;
}

async function fetchWithProxy(url: string, proxyIndex: number = 0): Promise<string> {
  if (proxyIndex >= CORS_PROXIES.length) {
    throw new Error("All CORS proxies failed");
  }
  
  const proxy = CORS_PROXIES[proxyIndex];
  const fullUrl = proxy + url;
  
  console.log(`🌐 Trying proxy ${proxyIndex + 1}/${CORS_PROXIES.length}: ${proxy}`);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log(`✅ Proxy ${proxyIndex + 1} successful, response length:`, text.length);
    return text;
  } catch (error) {
    console.error(`❌ Proxy ${proxyIndex + 1} failed:`, error);
    return fetchWithProxy(url, proxyIndex + 1);
  }
}

export default function TamilMoviesPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalVideo, setModalVideo] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  async function fetchYouTube(query: string) {
    addDebugInfo(`🔍 Starting search for: "${query}"`);
    setLoading(true);
    setError(null);
    
    try {
      const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      addDebugInfo(`🌐 Fetching from: ${youtubeUrl}`);
      
      const html = await fetchWithProxy(youtubeUrl);
      addDebugInfo(`📄 Received HTML, length: ${html.length}`);
      
      const vids = extractVideosFromHTML(html);
      addDebugInfo(`🎬 Extracted ${vids.length} videos`);
      
      const filteredVids = vids.filter((v) => v.id && v.thumbnail);
      addDebugInfo(`✅ Filtered to ${filteredVids.length} valid videos`);
      
      setVideos(filteredVids);
      
      if (filteredVids.length === 0) {
        setError("No videos found for this search. Try a different query.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      addDebugInfo(`❌ Error: ${errorMsg}`);
      setError(`Failed to fetch videos: ${errorMsg}`);
      setVideos([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    addDebugInfo("🚀 Tamil Movies page mounted");
    
    // On mount, fetch for all default queries and merge results
    (async () => {
      setLoading(true);
      setError(null);
      let all: any[] = [];
      
      for (const q of DEFAULT_QUERIES) {
        addDebugInfo(`🔍 Fetching: ${q}`);
        try {
          const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
          const html = await fetchWithProxy(youtubeUrl);
          const vids = extractVideosFromHTML(html);
          addDebugInfo(`📊 Found ${vids.length} videos for "${q}"`);
          all = all.concat(vids);
        } catch (err) {
          addDebugInfo(`❌ Failed to fetch "${q}": ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
      
      // Remove duplicates by video ID
      const unique = Array.from(
        new Map(all.map((v) => [v.id, v])).values()
      );
      
      addDebugInfo(`🎯 Total unique videos: ${unique.length}`);
      setVideos(unique);
      
      if (unique.length === 0) {
        setError("No Tamil movies found. This might be due to CORS restrictions or YouTube changes. Please try searching manually.");
      }
      
      setLoading(false);
    })();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      addDebugInfo(`🔍 Manual search: "${search}"`);
      fetchYouTube(search);
    }
  }

  const hero = videos[0];
  const gridVideos = videos.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Info (only show in development) */}
      {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-black/80 text-white p-4 rounded-lg text-xs max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          {debugInfo.slice(-10).map((info, i) => (
            <div key={i} className="mb-1">{info}</div>
          ))}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <Icons.alertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      {hero && (
        <section className="relative w-full">
          <div className="absolute inset-0 z-0 h-[100vw] w-full sm:h-[56.25vw]">
            <img
              src={hero.thumbnail}
              alt={hero.title}
              className="-z-40 h-auto w-full object-cover"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute bottom-0 left-0 right-0 top-0">
              <div className="absolute bottom-[28%] sm:bottom-[32%] md:bottom-[35%] left-[4%] top-0 z-10 flex w-[36%] flex-col justify-end space-y-2">
                <h1 className="text-[4.5vw] sm:text-[3.5vw] md:text-[3vw] font-bold leading-tight">
                  {hero.title}
                </h1>
                <div className="flex space-x-2 text-[3vw] sm:text-[2.5vw] md:text-[1.2vw] font-semibold">
                  <p className="text-green-600">Tamil Movie</p>
                </div>
                <div className="mt-[3vw] sm:mt-[2vw] md:mt-[1.5vw] flex items-center space-x-2">
                  <Button
                    aria-label="Play movie"
                    className="h-auto flex-shrink-0 gap-2 rounded-xl"
                    onClick={() => {
                      setModalVideo(hero);
                      setShowModal(true);
                    }}
                  >
                    <Icons.play className="fill-current" aria-hidden="true" />
                    Play
                  </Button>
                  <Button
                    aria-label="Movie details"
                    variant="outline"
                    className="h-auto flex-shrink-0 gap-2 rounded-xl"
                    onClick={() => {
                      setModalVideo(hero);
                      setShowModal(true);
                    }}
                  >
                    <Icons.info aria-hidden="true" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>
            <div className="opacity-71 absolute inset-0 right-[26.09%] z-[8] bg-gradient-to-r from-secondary to-85%"></div>
            <div className="absolute bottom-[-1px] left-0 right-0 z-[8] h-[14.7vw] bg-gradient-to-b from-background/0 from-30% via-background/30 via-50% to-background to-80%"></div>
          </div>
          <div className="relative inset-0 -z-50 mb-5 pb-[60%] sm:pb-[40%]"></div>
        </section>
      )}

      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-8 flex max-w-md items-center gap-2">
          <Input
            type="text"
            placeholder="Search Tamil movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Button type="submit" disabled={loading}>
            <Icons.search className="h-4 w-4" />
          </Button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icons.spinner className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading Tamil Movies...</span>
          </div>
        ) : (
          <>
            {gridVideos.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {gridVideos.map((movie) => (
                  <div
                    key={movie.id}
                    className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-muted transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    onClick={() => {
                      setModalVideo(movie);
                      setShowModal(true);
                    }}
                  >
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="h-full w-full rounded-lg transition-all duration-300 group-hover:brightness-75"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-xs font-medium text-white line-clamp-2 sm:text-sm">
                          {movie.title}
                        </h3>
                        <p className="text-xs text-gray-300 mt-1">Tamil Movie</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icons.alertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-4">No Tamil Movies Found</h2>
                <p className="text-muted-foreground mb-4">
                  {error || "We couldn't find any Tamil movies. This might be due to:"}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-6">
                  <li>• CORS restrictions blocking the request</li>
                  <li>• YouTube's HTML structure has changed</li>
                  <li>• Network connectivity issues</li>
                </ul>
                <Button 
                  onClick={() => {
                    setError(null);
                    setDebugInfo([]);
                    window.location.reload();
                  }}
                  variant="outline"
                >
                  <Icons.spinner className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal for video playback */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          {modalVideo && (
            <div className="w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${modalVideo.id}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={modalVideo.title}
                className="w-full h-full rounded-lg border-none"
              />
              <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">{modalVideo.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{modalVideo.channel}</p>
                <p className="text-xs text-muted-foreground mb-1">{modalVideo.published} {modalVideo.views && `• ${modalVideo.views}`}</p>
                <p className="text-sm mt-2">{modalVideo.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}