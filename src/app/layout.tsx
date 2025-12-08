import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { PWAInstaller, registerServiceWorker } from '@/components/pwa-installer';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
// import { TrpcProvider } from '@/client/trpc-provider';
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { siteConfig } from '@/configs/site';
import { env } from '@/env.mjs';

// export const runtime = 'edge';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: '../assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a84ff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a84ff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.author,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    images: siteConfig.ogImage,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.author,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/logo.png?v=3',
  },
  manifest: '/manifest.json',
  other: {
    referrer: 'no-referrer-when-downgrade',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'NEON',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker registered successfully:', registration);
                    })
                    .catch(function(error) {
                      console.error('❌ Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'relative overflow-y-auto min-h-screen overflow-x-hidden bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable,
        )}
        suppressHydrationWarning>
        {/* Animated Nebula Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-background to-purple-950 opacity-50" />
          <div className="absolute top-0 -left-4 w-96 h-96 bg-neon-purple rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-neon-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-neon-pink rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {/* <TrpcProvider> */}
          <AuthGuard>
            {children}
          </AuthGuard>
          <PWAInstaller />
          <TailwindIndicator />
          {/* </TrpcProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
