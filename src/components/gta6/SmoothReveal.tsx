'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SmoothRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Lightweight GPU-composited scroll reveal wrapper.
 * Always visible in SSR/above-the-fold HTML (zero SEO or LCP penalty),
 * then smoothly fades & glides into view as below-the-fold sections enter viewport.
 */
export default function SmoothReveal({
  children,
  className = '',
  delayMs = 0,
}: SmoothRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealState, setRevealState] = useState<'idle' | 'hidden' | 'visible'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const isBot =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver ||
        /bot|googlebot|bingbot|crawler|spider|slurp|duckduckbot|yandex/i.test(
          navigator.userAgent || ''
        ));

    if (
      isBot ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      setRevealState('visible');
      return;
    }

    const rect = el.getBoundingClientRect();
    // Keep anything already in or above the viewport immediately visible
    if (rect.top <= window.innerHeight * 0.94) {
      setRevealState('visible');
      return;
    }

    setRevealState('hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealState('visible');
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isHidden = revealState === 'hidden';

  return (
    <div
      ref={ref}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] ${
        isHidden ? 'opacity-0 translate-y-5 scale-[0.992]' : 'opacity-100 translate-y-0 scale-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
