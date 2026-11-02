import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  FileText,
  ListMusic,
  Radio,
  Sliders,
  Maximize2,
  Headphones,
  Disc
} from 'lucide-react';
import { Track, RepeatMode } from '../types/music';

interface PlayerDockProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLiked: boolean;
  is8DActive: boolean;
  orbitPan: number;
  djSpeed: number;
  djModeName: string;
  isDJOpen: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: (trackId: string) => void;
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onToggleEqualizer: () => void;
  onToggleFullscreen: () => void;
  onToggle8D: () => void;
  onToggleDJ: () => void;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  isEqualizerOpen: boolean;
}

const formatSeconds = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

export const PlayerDock: React.FC<PlayerDockProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  isLiked,
  is8DActive,
  orbitPan,
  djSpeed,
  djModeName,
  isDJOpen,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
  onToggleLyrics,
  onToggleQueue,
  onToggleEqualizer,
  onToggleFullscreen,
  onToggle8D,
  onToggleDJ,
  isLyricsOpen,
  isQueueOpen,
  isEqualizerOpen,
}) => {
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const effectiveDuration = duration > 0 ? duration : currentTrack?.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickRatio * effectiveDuration;
    onSeek(targetTime);
  };

  const handleMouseMoveProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverPosition(ratio * effectiveDuration);
  };

  const currentVolume = isMuted ? 0 : volume;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#09090e]/90 backdrop-blur-2xl border-t border-[#ff5500]/25 z-50 px-4 md:px-8 flex items-center justify-between select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* Absolute top glowing hairline indicator */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff5500] to-transparent pointer-events-none transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
      />

      {/* Left zone: Current song summary */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px] max-w-[300px]">
        {currentTrack ? (
          <>
            <div className="relative group w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#ff5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.25)]">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <div className="w-1 bg-[#ff5500] animate-eq-1 rounded-full" />
                  <div className="w-1 bg-[#ff5500] animate-eq-2 rounded-full" />
                  <div className="w-1 bg-[#ff5500] animate-eq-3 rounded-full" />
                  <div className="w-1 bg-[#ff5500] animate-eq-4 rounded-full" />
                </div>
              )}
            </div>

            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate tracking-tight hover:text-[#ff7700] transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {currentTrack.artist}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-400">
                <span className="text-[#ff6600] font-medium">{currentTrack.genreLabel}</span>
              </div>
            </div>

            <button
              onClick={() => onToggleLike(currentTrack.id)}
              className="p-2 text-neutral-400 hover:text-[#ff5500] transition-colors shrink-0"
              title={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              aria-label="Favorito"
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  isLiked ? 'text-[#ff5500] fill-[#ff5500] drop-shadow-[0_0_8px_rgba(255,85,0,0.8)]' : ''
                }`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-neutral-500 italic">No hay pista seleccionada</div>
        )}
      </div>

      {/* Center zone: Playback controls & Seekable scrub bar */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-5 mb-2">
          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-full transition-all duration-200 ${
              isShuffle
                ? 'text-[#ff5500] bg-[#ff5500]/15 shadow-[0_0_10px_rgba(255,85,0,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title={isShuffle ? 'Modo aleatorio: Activado' : 'Modo aleatorio: Desactivado'}
            aria-label="Modo aleatorio"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Prev Track */}
          <button
            onClick={onPrev}
            className="p-2 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-transform"
            title="Pista anterior"
            aria-label="Pista anterior"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Main Play / Pause Button with Pulsing Dopamine Glow */}
          <button
            onClick={onTogglePlay}
            disabled={!currentTrack}
            className="w-12 h-12 rounded-full bg-[#ff5500] hover:bg-[#ff6a00] text-black flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,85,0,0.65)] hover:shadow-[0_0_30px_rgba(255,85,0,0.95)] disabled:opacity-40 disabled:pointer-events-none"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNext}
            className="p-2 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-transform"
            title="Siguiente pista"
            aria-label="Siguiente pista"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={onToggleRepeat}
            className={`relative p-2 rounded-full transition-all duration-200 ${
              repeatMode !== 'off'
                ? 'text-[#ff5500] bg-[#ff5500]/15 shadow-[0_0_10px_rgba(255,85,0,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title={`Modo repetición: ${repeatMode}`}
            aria-label="Modo repetición"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#ff5500] shadow-[0_0_6px_#ff5500]" />
            )}
          </button>
        </div>

        {/* Seekable scrub bar & Timecode counters */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono-numbers text-neutral-400 w-10 text-right">
            {formatSeconds(currentTime)}
          </span>

          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => {
              setIsHoveringProgress(false);
              setHoverPosition(null);
            }}
            onMouseMove={handleMouseMoveProgress}
            className="relative flex-1 h-2 group cursor-pointer flex items-center py-1"
          >
            {/* Background track */}
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden transition-all group-hover:h-2">
              {/* Active neon fill */}
              <div
                className="h-full bg-gradient-to-r from-[#ff4400] to-[#ff7700] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Glowing draggable thumb knob */}
            <div
              className={`absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#ff5500] shadow-[0_0_12px_rgba(255,85,0,0.9)] transform -translate-x-1/2 pointer-events-none transition-opacity duration-150 ${
                isHoveringProgress ? 'opacity-100 scale-110' : 'opacity-0'
              }`}
              style={{ left: `${progressPercent}%` }}
            />

            {/* Hover preview tooltip */}
            {hoverPosition !== null && (
              <div
                className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/90 border border-[#ff5500]/40 text-[10px] font-mono-numbers text-white transform -translate-x-1/2 pointer-events-none shadow-lg"
                style={{
                  left: `${(hoverPosition / effectiveDuration) * 100}%`,
                }}
              >
                {formatSeconds(hoverPosition)}
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono-numbers text-neutral-400 w-10 text-left">
            {formatSeconds(effectiveDuration)}
          </span>
        </div>
      </div>

      {/* Right zone: Volume, Lyrics, Queue */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px] max-w-[300px]">
        {/* 8D Spatial Audio Toggle with Live Orbit Indicator */}
        <button
          onClick={onToggle8D}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            is8DActive
              ? 'text-[#ff5500] bg-[#ff5500]/20 border border-[#ff5500]/50 shadow-[0_0_12px_rgba(255,85,0,0.4)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
          title={is8DActive ? 'Audio 8D Espacial: Activado (360°)' : 'Activar Audio 8D Espacial (Auriculares)'}
          aria-label="Audio 8D Espacial"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>8D</span>
          {is8DActive && (
            <div className="relative w-5 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-2 bg-[#ff5500] rounded-full shadow-[0_0_6px_#ff5500] transition-transform duration-75"
                style={{
                  transform: `translateX(${(orbitPan + 1) * 6}px)`,
                }}
              />
            </div>
          )}
        </button>

        {/* DJ Engine Button */}
        <button
          onClick={onToggleDJ}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isDJOpen || djSpeed !== 1.0
              ? 'text-[#ff5500] bg-[#ff5500]/20 border border-[#ff5500]/50 shadow-[0_0_12px_rgba(255,85,0,0.4)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
          title="Modos DJ & Control de Velocidad"
          aria-label="Modo DJ"
        >
          <Disc className={`w-3.5 h-3.5 ${isDJOpen ? 'animate-spin' : ''}`} />
          <span>DJ</span>
          {djSpeed !== 1.0 && (
            <span className="text-[10px] font-mono-numbers text-[#ff7700] ml-0.5">
              {djSpeed}x
            </span>
          )}
        </button>

        {/* 5-Band Equalizer toggle */}
        <button
          onClick={onToggleEqualizer}
          className={`p-2 rounded-lg transition-colors ${
            isEqualizerOpen
              ? 'text-[#ff5500] bg-[#ff5500]/15 border border-[#ff5500]/30 shadow-[0_0_10px_rgba(255,85,0,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
          title="Ecualizador gráfico de 5 bandas"
          aria-label="Ecualizador"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Synced Lyrics toggle */}
        <button
          onClick={onToggleLyrics}
          className={`p-2 rounded-lg transition-colors ${
            isLyricsOpen
              ? 'text-[#ff5500] bg-[#ff5500]/15 border border-[#ff5500]/30 shadow-[0_0_10px_rgba(255,85,0,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
          title="Ver letra sincronizada"
          aria-label="Letra sincronizada"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Queue list toggle */}
        <button
          onClick={onToggleQueue}
          className={`p-2 rounded-lg transition-colors ${
            isQueueOpen
              ? 'text-[#ff5500] bg-[#ff5500]/15 border border-[#ff5500]/30 shadow-[0_0_10px_rgba(255,85,0,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
          title="Cola de reproducción"
          aria-label="Cola de reproducción"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Fullscreen Immersive Stage */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
          title="Modo pantalla completa inmersivo"
          aria-label="Pantalla completa"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={onToggleMute}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-label="Silenciar o activar sonido"
          >
            {isMuted || currentVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : currentVolume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 group-hover:text-[#ff5500]" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 md:w-24 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
            title={`Volumen: ${Math.round(currentVolume * 100)}%`}
            aria-label="Control deslizante de volumen"
          />
        </div>
      </div>
    </footer>
  );
};
