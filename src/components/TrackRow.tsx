import React from 'react';
import { Play, Pause, Heart, Plus, MoreHorizontal } from 'lucide-react';
import { Track } from '../types/music';

interface TrackRowProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  onPlay: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  isCurrent,
  isPlaying,
  isLiked,
  onPlay,
  onToggleLike,
  onAddToPlaylist,
}) => {
  return (
    <div
      onClick={() => onPlay(track)}
      className={`group flex items-center gap-4 px-4 py-2.5 rounded-lg transition-colors cursor-pointer select-none ${
        isCurrent
          ? 'bg-[#ff5500]/15 border border-[#ff5500]/30 shadow-[0_0_15px_rgba(255,85,0,0.15)] text-white'
          : 'hover:bg-neutral-900/60 text-neutral-300'
      }`}
    >
      {/* Index or Live Equalizer */}
      <div className="w-6 text-center shrink-0">
        {isCurrent && isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-3.5">
            <span className="w-1 bg-[#ff5500] animate-eq-1 rounded-full" />
            <span className="w-1 bg-[#ff5500] animate-eq-2 rounded-full" />
            <span className="w-1 bg-[#ff5500] animate-eq-3 rounded-full" />
          </div>
        ) : (
          <span className="text-xs font-mono-numbers text-neutral-400 group-hover:hidden">
            {index + 1}
          </span>
        )}
        <div className="hidden group-hover:flex items-center justify-center">
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 text-[#ff5500] fill-current" />
          ) : (
            <Play className="w-4 h-4 text-white fill-current translate-x-0.5" />
          )}
        </div>
      </div>

      {/* Album Cover Thumbnail */}
      <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-white/5 bg-neutral-900">
        <img
          src={track.coverUrl}
          alt={track.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-semibold truncate ${
            isCurrent ? 'text-[#ff6600]' : 'text-white group-hover:text-[#ff7700]'
          }`}
        >
          {track.title}
        </div>
        <div className="text-xs text-neutral-400 truncate mt-0.5 flex items-center gap-2">
          <span>{track.artist}</span>
          <span>·</span>
          <span className="text-neutral-400">{track.genreLabel}</span>
        </div>
      </div>

      {/* Album Name (hidden on small viewports) */}
      <div className="hidden md:block w-1/4 text-xs text-neutral-400 truncate">
        {track.album}
      </div>

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike(track.id);
        }}
        className={`p-1.5 rounded-full transition-colors ${
          isLiked ? 'text-[#ff5500]' : 'text-neutral-400 hover:text-white'
        }`}
        title={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#ff5500]' : ''}`} />
      </button>

      {/* Track Duration */}
      <div className="w-14 text-right text-xs font-mono-numbers text-neutral-400">
        {track.durationFormatted}
      </div>
    </div>
  );
};
