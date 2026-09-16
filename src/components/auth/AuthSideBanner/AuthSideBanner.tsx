'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Image } from '@/components/ui';
import { WorkflowHighlight, AUTH_BANNER_HIGHLIGHTS, AUTH_BANNER_CONFIG } from '@/constants';

export interface AuthSideBannerProps {
  highlights?: WorkflowHighlight[];
  autoPlayInterval?: number;
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const AuthSideBanner: React.FC<Readonly<AuthSideBannerProps>> = ({
  highlights = AUTH_BANNER_HIGHLIGHTS,
  autoPlayInterval = AUTH_BANNER_CONFIG.autoPlayIntervalMs,
  className = '',
  imageSrc = AUTH_BANNER_CONFIG.defaultImageSrc,
  imageAlt = AUTH_BANNER_CONFIG.defaultImageAlt,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = highlights.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || autoPlayInterval <= 0 || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextSlide, totalSlides]);

  const currentHighlight = highlights[activeIndex] || highlights[0];

  return (
    <aside
      aria-label="TaskFlow highlights and illustration"
      className={`relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#090D16] p-8 lg:p-12 xl:p-16 text-white select-none border-l border-slate-800/60 shadow-2xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header Bar: Status & Active Metric */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1.5 backdrop-blur-md shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            TaskFlow Platform
          </span>
        </div>

        {currentHighlight.metric && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md transition-all duration-300 shadow-sm">
            <Image
              src="/icons/bolt.svg"
              alt="Metric Icon"
              width={14}
              height={14}
              className="brightness-200"
            />
            <span>{currentHighlight.metric}</span>
          </div>
        )}
      </header>

      {/* Center Showcase: Dashboard Window Framing for authbackground.jpg */}
      <section className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
        <div className="group relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-all duration-500 hover:border-slate-600/80 hover:shadow-indigo-500/10 hover:ring-white/20">
          {/* Window Mockup Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>taskflow-workspace.app</span>
            </div>
            <div className="w-10" />
          </div>

          {/* Image Canvas */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>

      {/* Bottom Section: Sliding Text Carousel */}
      <footer className="relative z-10 flex flex-col gap-4">
        {/* Carousel Viewport Container */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="min-w-full flex flex-col gap-3 pr-2"
                aria-hidden={highlights[activeIndex]?.id !== highlight.id}
              >
                {/* Highlight Tag */}
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {highlight.tag}
                  </span>
                </div>

                {/* Highlight Quote */}
                <div className="min-h-[72px] flex items-center">
                  <blockquote className="text-lg xl:text-xl font-semibold leading-relaxed tracking-tight text-slate-100">
                    &ldquo;{highlight.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Author / Feature Metadata & Interactive Carousel Controls */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{currentHighlight.author}</span>
            <span className="text-xs text-slate-400">{currentHighlight.role}</span>
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex items-center gap-2.5">
            {/* Prev Button */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous highlight"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-300 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white active:scale-95 cursor-pointer"
            >
              <Image src="/icons/chevron-left.svg" alt="Previous" width={16} height={16} />
            </button>

            {/* Segmented Carousel Indicators */}
            <div
              role="tablist"
              aria-label="Highlight slides"
              className="flex items-center gap-1.5 px-1"
            >
              {highlights.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${idx + 1}: ${item.tag}`}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer ${
                      isActive
                        ? 'w-8 bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm shadow-cyan-500/50'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next highlight"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-300 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white active:scale-95 cursor-pointer"
            >
              <Image src="/icons/chevron-right.svg" alt="Next" width={16} height={16} />
            </button>
          </div>
        </div>
      </footer>
    </aside>
  );
};

export default AuthSideBanner;
