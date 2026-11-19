'use client';

import React, { useState } from 'react';
import {
  Film,
  Play,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  Eye,
  Layers,
} from 'lucide-react';
import { extractProductVideoPreviews, ParsedVideoPreview } from '@/lib/videoEmbed';

interface Gta6VideoPreviewSectionProps {
  previewVideoUrl?: string | null;
  previewVideoUrls?: string[] | null;
  price?: number;
  onBuyClick?: () => void;
}

const DEFAULT_PREVIEW_TABS = [
  {
    title: 'Vice City Supercars & Drifting',
    badge: '4K Full HD',
  },
  {
    title: 'Lucia & Jason Cinematic Cut',
    badge: 'Trending Audio',
  },
  {
    title: 'High-Speed Cop Chase & Heist',
    badge: 'Viral Hook',
  },
  {
    title: 'Night City Aesthetic B-Roll',
    badge: 'No Watermark',
  },
];

export default function Gta6VideoPreviewSection({
  previewVideoUrl,
  previewVideoUrls,
  price = 99,
  onBuyClick,
}: Gta6VideoPreviewSectionProps) {
  // Extract all video previews
  const parsedVideos = extractProductVideoPreviews(previewVideoUrl, previewVideoUrls);

  // Fallback default sample if none configured yet
  const defaultSample: ParsedVideoPreview = {
    type: 'google-drive',
    embedUrl: 'https://drive.google.com/file/d/19OtwWku9JxAV2rz2jdNlaShWvFqw1cl6/preview',
    fileId: '19OtwWku9JxAV2rz2jdNlaShWvFqw1cl6',
    originalUrl: 'https://drive.google.com/file/d/19OtwWku9JxAV2rz2jdNlaShWvFqw1cl6/view',
  };

  const activeVideos = parsedVideos.length > 0 ? parsedVideos : [defaultSample];
  const [activeTab, setActiveTab] = useState(0);

  const currentVideo = activeVideos[Math.min(activeTab, activeVideos.length - 1)];

  return (
    <section className="my-8 rounded-3xl bg-gradient-to-b from-slate-950 via-[#130924] to-slate-950 border border-fuchsia-500/30 p-4 sm:p-7 shadow-2xl shadow-fuchsia-950/50 text-white relative overflow-hidden">
      {/* Background neon ambient lights */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-black uppercase tracking-wider mb-2.5">
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Multiple Video Preview</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
          Watch Sample Clips <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">(Zero Watermark)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          Yeh clips direct bundle se hain. 9:16 vertical ratio, pre-synced trending background audio aur 100% clean quality test kijiye:
        </p>
      </div>

      {/* Multiple Video Tabs Switcher */}
      {activeVideos.length > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {activeVideos.map((video, idx) => {
            const label = DEFAULT_PREVIEW_TABS[idx]?.title || `Clip #${idx + 1}`;
            const badge = DEFAULT_PREVIEW_TABS[idx]?.badge;
            const isActive = activeTab === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-600/40 border border-fuchsia-400'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Play className={`w-3 h-3 ${isActive ? 'fill-white text-white' : 'text-slate-400'}`} />
                <span>{label}</span>
                {badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-fuchsia-950/80 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Video Player Display Container */}
      <div className="max-w-md mx-auto">
        <div className="relative rounded-2xl bg-black border-2 border-fuchsia-500/50 shadow-2xl shadow-fuchsia-500/20 overflow-hidden aspect-[9/16] max-h-[580px] w-full flex items-center justify-center">
          {/* Watermark-Free Top Overlay Badge */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-fuchsia-500/40 flex items-center gap-1.5 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-black tracking-wider uppercase text-white">
              100% Watermark-Free
            </span>
          </div>

          {/* Sound / Resolution Badge */}
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-fuchsia-500/40 flex items-center gap-1.5 shadow-md">
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[10px] font-black tracking-wider uppercase text-white">
              Trending Audio
            </span>
          </div>

          {/* Render Player based on parsed type */}
          {currentVideo.type === 'google-drive' ? (
            <iframe
              src={currentVideo.embedUrl}
              title="GTA 6 Google Drive Video Preview"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : currentVideo.type === 'youtube' ? (
            <iframe
              src={currentVideo.embedUrl}
              title="GTA 6 YouTube Video Preview"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : currentVideo.type === 'mp4' ? (
            <video
              src={currentVideo.src}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <iframe
              src={currentVideo.embedUrl}
              title="GTA 6 Video Preview"
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}

          {/* Bottom Watermark Callout */}
          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
            <div className="p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-fuchsia-500/30 text-center text-[10px] sm:text-[11px] font-semibold text-slate-200">
              🎮 Ready to Upload • Apna logo & handle lagayein aur Instagram/Shorts par viral hon
            </div>
          </div>
        </div>

        {/* Video Player Meta & Drive Direct Link */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2,000 Clips isi high-bitrate quality me hain</span>
          </div>

          {currentVideo.originalUrl && (
            <a
              href={currentVideo.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold underline underline-offset-2 transition-colors"
            >
              <span>Drive par 4K stream dekhein</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Quick Buy CTA under preview */}
        {onBuyClick && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onBuyClick}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-fuchsia-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Get All 2,000 Clips for ₹{price} (Only 73 Left)</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Instant Google Drive access • 100% Watermark-Free • Commercial Rights
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
