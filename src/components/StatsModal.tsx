import React from 'react';
import { X, BarChart3, Clock, PlayCircle, Flame, Music, Sparkles } from 'lucide-react';
import { ListeningStats, Track } from '../types/music';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ListeningStats;
  tracks: Track[];
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  tracks,
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(stats.sessionSeconds / 60);
  const seconds = stats.sessionSeconds % 60;
  const sessionFormatted = `${minutes}m ${seconds}s`;

  // Calculate top genre
  const genreEntries = Object.entries(stats.genreCounts).sort((a, b) => b[1] - a[1]);
  const topGenre = genreEntries[0] ? genreEntries[0][0] : 'Anime & Gaming';
  const totalGenrePlays = genreEntries.reduce((acc, curr) => acc + curr[1], 0) || 1;

  // Calculate top played tracks
  const trackPlays = Object.entries(stats.trackPlayCounts)
    .map(([trackId, count]) => {
      const track = tracks.find((t) => t.id === trackId);
      return { track, count };
    })
    .filter((item): item is { track: Track; count: number } => item.track !== undefined)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#090912] border border-[#ff5500]/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,85,0,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff6600]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                AURA Stats — Telemetría de Escucha
              </h3>
              <p className="text-xs text-neutral-400">
                Resumen de actividad y preferencias sónicas de la sesión actual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-[#ff5500]/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff5500]/15 flex items-center justify-center text-[#ff6600] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Tiempo de Sesión
              </span>
              <span className="text-lg font-bold font-mono-numbers text-white">
                {sessionFormatted}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-[#ff5500]/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff5500]/15 flex items-center justify-center text-[#ff6600] shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Pistas Tocadas
              </span>
              <span className="text-lg font-bold font-mono-numbers text-white">
                {stats.tracksPlayed}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-[#ff5500]/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff5500]/15 flex items-center justify-center text-[#ff6600] shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Género Favorito
              </span>
              <span className="text-sm font-bold text-[#ff6600] truncate block">
                {topGenre}
              </span>
            </div>
          </div>
        </div>

        {/* Genre Breakdown Progress Bars */}
        <div className="mt-6 p-5 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff5500]" />
              <span>Distribución de Géneros en la Sesión</span>
            </div>
            <span className="text-neutral-500 font-mono-numbers text-[11px]">
              {genreEntries.length} géneros escuchados
            </span>
          </div>

          {genreEntries.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-2">
              Comienza a reproducir música para registrar la telemetría de géneros.
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              {genreEntries.map(([genre, count]) => {
                const percent = Math.round((count / totalGenrePlays) * 100);
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-300 capitalize">{genre}</span>
                      <span className="font-mono-numbers text-neutral-400">
                        {count} {count === 1 ? 'reproducción' : 'reproducciones'} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff4400] to-[#ff7700] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Played Tracks */}
        {trackPlays.length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Pistas Más Escuchadas
            </h4>
            <div className="space-y-1.5">
              {trackPlays.map(({ track, count }, idx) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50 border border-white/5"
                >
                  <span className="font-mono-numbers text-xs text-[#ff5500] font-bold w-4 text-center">
                    #{idx + 1}
                  </span>
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                  </div>
                  <span className="font-mono-numbers text-xs text-neutral-400">
                    {count} {count === 1 ? 'play' : 'plays'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-black bg-[#ff5500] hover:bg-[#ff6e00] rounded-lg transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
