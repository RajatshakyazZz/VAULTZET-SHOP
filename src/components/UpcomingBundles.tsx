'use client';

import React, { useState, useRef } from 'react';
import { Bell, Clock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

export default function UpcomingBundles() {
  const upcoming = BUNDLE_PRODUCTS.filter((b) => b.isUpcoming);
  const [selectedBundle, setSelectedBundle] = useState<typeof upcoming[0] | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedBundle(null);
      setName('');
      setEmail('');
      setWhatsapp('');
    }, 2500);
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-[#fcfaff] border border-[#f0ebfa] p-4 sm:p-6 space-y-6 shadow-sm">
          
          {/* Teal/Emerald Gradient Header Banner matching Image 5 */}
          <div className="rounded-[20px] bg-gradient-to-r from-[#0d7e8a] via-[#108c8e] to-[#15a092] p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_28px_rgba(13,126,138,0.22)] border border-white/20">
            <div className="flex items-center gap-3">
              {/* White bar indicator on left */}
              <div className="w-[5px] h-10 bg-white rounded-full shrink-0 shadow-sm" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Upcoming Reels Bundles
                </h2>
                <p className="text-xs sm:text-[13px] text-white/85 font-medium mt-0.5">
                  Exciting new bundles currently in preparation for creators.
                </p>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={scrollLeft}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Slider */}
          <div
            ref={carouselRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          >
            {upcoming.map((bundle) => (
              <div
                key={bundle.id}
                className="w-72 sm:w-[290px] bg-white rounded-[24px] border border-[#eee8f8] shadow-[0_4px_18px_rgba(40,20,80,0.03)] hover:shadow-[0_14px_32px_rgba(13,126,138,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group shrink-0 snap-start"
              >
                <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                  <img
                    src={bundle.thumbnail}
                    alt={bundle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-3">
                    <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 text-[11px] font-extrabold shadow-md flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#0d7e8a]" />
                      <span>Dropping Soon</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#0d7e8a] bg-[#e6fbfb] px-2 py-0.5 rounded-md inline-block">
                      {bundle.category}
                    </span>
                    <h3 className="font-extrabold text-[14px] text-[#162048] line-clamp-2 leading-snug">
                      {bundle.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 font-medium">
                      {bundle.shortDescription}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBundle(bundle)}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#0d7e8a]/30 bg-[#f0fdfd] hover:bg-[#0d7e8a] hover:text-white text-[#0d7e8a] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify Me on Launch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Notify Me Modal */}
        {selectedBundle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
              <button
                onClick={() => setSelectedBundle(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#e6fbfb] text-[#0d7e8a] flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-black uppercase text-[#0d7e8a] tracking-wider">
                UPCOMING BUNDLE ALERT
              </span>
              <h3 className="text-xl font-black text-[#182247] mt-1">
                Get notified when it’s live
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your details to receive an instant WhatsApp alert and early-bird launch pricing for <strong className="text-slate-800">{selectedBundle.title}</strong>.
              </p>

              {isSuccess ? (
                <div className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Success! We will notify you directly upon release.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajat"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7e8a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7e8a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7e8a]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0d7e8a] to-[#15a092] text-white font-extrabold text-sm shadow-md mt-2 hover:opacity-95"
                  >
                    Save & Notify Me →
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    We hate spam. Your contact info will only be used for this bundle release.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
