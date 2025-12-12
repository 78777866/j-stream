import React from 'react';
import { siteConfig } from '@/configs/site';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

const PLACEHOLDER_HREFS = new Set([
  'https://x.com',
  'https://twitter.com',
  'https://facebook.com',
  'https://instagram.com',
  'https://youtube.com',
]);

function isPlaceholderHref(href: string) {
  if (href === '/' || href === '#') return true;
  return PLACEHOLDER_HREFS.has(href);
}

const SiteFooter = () => {
  const socialLinks = siteConfig.socialLinks.filter(
    (item) => item.href && !isPlaceholderHref(item.href),
  );

  const footerItems = siteConfig.footerItems.filter(
    (item) => item.href && !isPlaceholderHref(item.href),
  );

  return (
    <footer aria-label="Footer" className="w-full">
      <div className="container grid w-full max-w-6xl gap-7 py-10">
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {socialLinks.map((item, i) => (
              <Link key={i} href={item.href} target="_blank" rel="noreferrer">
                <div
                  className={buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                    className: 'rounded-none hover:bg-transparent',
                  })}>
                  {item.icon && <item.icon className="h-6 w-6" />}
                  <span className="sr-only">{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {footerItems.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {footerItems.map((item, i) => (
              <li
                key={i}
                className="text-xs text-foreground/60 hover:underline sm:text-sm">
                <Link href={item.href}>{item.title}</Link>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-foreground/60 sm:text-sm">
          © {new Date().getFullYear()} {siteConfig.author}.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
