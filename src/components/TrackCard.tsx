import React from 'react';
import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Track } from '../types/music';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  isLiked: boolean;
  onPlay: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrent,
  isLiked,
  onPlay,
  onToggleLike,
  onAddToPlaylist,
}) => {
  return (
    <div
      onClick={() => onPlay(track)}
      className={`group relative p-3.5 rounded-xl transition-all duration-200 cursor-pointer select-none ${
        isCurrent
          ? 'bg-[#150f0c]/80 border border-[#ff5500]/60 shadow-[0_0_20px_rgba(255,85,0,0.25)]'
          : 'bg-[#0a0a10]/60 hover:bg-[#12121c]/80 border border-white/5 hover:border-[#ff5500]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.7)]'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-neutral-900 border border-white/5">
        <img
          src={track.coverUrl}
          alt={track.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isCurrent && isPlaying ? 'scale-105' : 'group-hover:scale-105'
          }`}
        />

        {/* Hover/Playing Play Overlay Button */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#ff5500] text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.8)] transform group-hover:scale-110 active:scale-95 transition-transform">
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Currently playing live equalizer indicator badge */}
        {isCurrent && isPlaying && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 backdrop-blur-xs border border-[#ff5500]/40 flex items-center gap-1 shadow-md">
            <span className="w-1 bg-[#ff5500] animate-eq-1 rounded-full h-3" />
            <span className="w-1 bg-[#ff5500] animate-eq-2 rounded-full h-3" />
            <span className="w-1 bg-[#ff5500] animate-eq-3 rounded-full h-3" />
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(track.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/10 transition-colors ${
            isLiked ? 'text-[#ff5500] border-[#ff5500]/40' : 'text-neutral-400 hover:text-white'
          }`}
          title={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#ff5500]' : ''}`} />
        </button>
      </div>

      {/* Track Meta Details */}
      <div>
        <h4
          className={`text-sm font-semibold truncate tracking-tight ${
            isCurrent ? 'text-[#ff6600]' : 'text-white group-hover:text-[#ff7700]'
          } transition-colors`}
        >
          {track.title}
        </h4>
        <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-neutral-400">
          <span className="text-[#ff6600] font-medium">{track.genreLabel}</span>
          <span className="font-mono-numbers">{track.durationFormatted}</span>
        </div>
      </div>
    </div>
  );
};
