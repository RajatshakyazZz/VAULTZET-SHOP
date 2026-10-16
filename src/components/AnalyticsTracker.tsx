'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { track, sanitizePagePath } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>('');
  const trackedScrollDepths = useRef<Set<number>>(new Set());

  // Track page_view on route change (including query string changes)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fullUrl = window.location.pathname + window.location.search;
    const { cleanPath, trackingParams } = sanitizePagePath(fullUrl);

    // Prevent duplicate fire for identical paths
    if (lastTrackedPath.current === cleanPath) return;
    lastTrackedPath.current = cleanPath;

    // Reset scroll tracking set on route change
    trackedScrollDepths.current.clear();

    // Small delay to let document.title update
    const timeout = setTimeout(() => {
      track('page_view', {
        page_path: cleanPath,
        page_location: window.location.href,
        page_title: document.title,
        traffic_source_detail: Object.keys(trackingParams).length > 0 ? trackingParams : undefined,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Track Scroll Depth Milestones (25%, 50%, 75%, 90%)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const milestones = [25, 50, 75, 90];

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      milestones.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedScrollDepths.current.has(threshold)) {
          trackedScrollDepths.current.add(threshold);
          track('scroll', {
            percent_scrolled: threshold,
            page_path: lastTrackedPath.current,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Global Delegated Click Listener for CTA and WhatsApp links
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const text = (target.textContent || '').trim().slice(0, 60);

      // WhatsApp link click
      if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp')) {
        track('whatsapp_click', {
          link_url: href,
          link_text: text,
          page_location: window.location.href,
        });
        return;
      }

      // Buy Now / Primary CTA button click
      const isCta =
        target.classList.contains('cta-button') ||
        /buy\s*now|checkout|get\s*instant\s*access|view\s*all/i.test(text);

      if (isCta && !href.includes('/cart')) {
        track('cta_click', {
          cta_text: text,
          cta_url: href || 'inline_action',
          page_location: window.location.href,
        });
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
