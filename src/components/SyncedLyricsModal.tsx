import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Music } from 'lucide-react';
import { Track } from '../types/music';

interface SyncedLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const SyncedLyricsModal: React.FC<SyncedLyricsModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  currentTime,
  onSeek,
}) => {
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  if (!isOpen || !currentTrack) return null;

  // Find active line index based on current time
  const activeIndex = currentTrack.lyrics.reduce((acc, line, idx) => {
    if (currentTime >= line.time) {
      return idx;
    }
    return acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[80vh] flex flex-col bg-[#09090f]/95 rounded-2xl border border-[#ff5500]/30 shadow-[0_0_50px_rgba(255,85,0,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#ff5500]/30">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white leading-tight">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-neutral-400">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 text-xs text-[#ff7700]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Letra Sincronizada</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lyrics scroll body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-center select-none">
          {currentTrack.lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`cursor-pointer transition-all duration-300 py-2 px-4 rounded-xl ${
                  isActive
                    ? 'text-2xl md:text-3xl font-bold text-[#ff6600] scale-105 drop-shadow-[0_0_20px_rgba(255,85,0,0.6)] bg-[#ff5500]/10 border border-[#ff5500]/20'
                    : isPast
                    ? 'text-lg md:text-xl text-neutral-500 hover:text-neutral-300'
                    : 'text-lg md:text-xl text-neutral-600 hover:text-neutral-400'
                }`}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        {/* Bottom hint */}
        <div className="p-4 border-t border-neutral-800/80 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <Music className="w-3.5 h-3.5 text-[#ff5500]" />
          <span>Haz clic en cualquier línea para saltar a ese momento de la canción</span>
        </div>
      </div>
    </div>
  );
};
