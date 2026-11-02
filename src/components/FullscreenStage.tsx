import React, { useEffect, useRef, useState } from 'react';
import {
  Minimize2,
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
  Sparkles,
  Zap
} from 'lucide-react';
import { Track, RepeatMode } from '../types/music';

interface FullscreenStageProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLiked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: (trackId: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

const formatSeconds = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

export const FullscreenStage: React.FC<FullscreenStageProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  isLiked,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const hideTimerRef = useRef<number | null>(null);

  // Keyboard escape handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'ArrowRight') {
        onSeek(Math.min(duration, currentTime + 5));
      } else if (e.key === 'ArrowLeft') {
        onSeek(Math.max(0, currentTime - 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, duration, currentTime, onTogglePlay, onSeek, onClose]);

  // Auto-hide controls timer
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying]);

  // Particle & Wave Canvas Animation Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let wavePhase = 0;

    // Resize canvas to full viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 100 particles
    const particles: Particle[] = [];
    const colors = ['#ff4400', '#ff6600', '#ff8800', '#ffbb33', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2.8 + 1,
        alpha: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Simulated audio pulse
      const t = Date.now() / 250;
      const bassEnergy = isPlaying ? 0.5 + Math.sin(t) * 0.3 + Math.cos(t * 1.6) * 0.2 : 0.05;

      if (isPlaying) {
        setRotationAngle((prev) => (prev + 0.35) % 360);
      }

      // Draw Center Radial Aura
      const haloRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const radialGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        haloRadius * 0.4,
        centerX,
        centerY,
        haloRadius * (1 + bassEnergy * 0.4)
      );
      radialGrad.addColorStop(0, isPlaying ? 'rgba(255, 85, 0, 0.32)' : 'rgba(255, 85, 0, 0.08)');
      radialGrad.addColorStop(0.5, isPlaying ? 'rgba(255, 120, 0, 0.12)' : 'rgba(255, 85, 0, 0.02)');
      radialGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, haloRadius * (1 + bassEnergy * 0.4), 0, Math.PI * 2);
      ctx.fill();

      // Update & Draw Particles
      for (const p of particles) {
        if (isPlaying) {
          // Accelerate outward slightly on bass beats
          p.x += p.vx * (1 + bassEnergy * 2);
          p.y += p.vy * (1 + bassEnergy * 2);
        } else {
          p.x += p.vx * 0.3;
          p.y += p.vy * 0.3;
        }

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (isPlaying ? 0.9 : 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + bassEnergy * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Draw bottom glowing audio wave ribbon
      wavePhase += isPlaying ? 0.04 : 0.005;
      const waveY = canvas.height - 110;

      ctx.beginPath();
      ctx.moveTo(0, waveY);

      for (let x = 0; x <= canvas.width; x += 15) {
        const freq1 = Math.sin(x * 0.008 + wavePhase) * (isPlaying ? 35 * (1 + bassEnergy) : 8);
        const freq2 = Math.cos(x * 0.015 - wavePhase * 1.5) * (isPlaying ? 20 * bassEnergy : 4);
        ctx.lineTo(x, waveY + freq1 + freq2);
      }

      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = isPlaying ? 18 : 6;
      ctx.stroke();

      // Secondary glowing wave ribbon
      ctx.beginPath();
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= canvas.width; x += 15) {
        const freq3 = Math.sin(x * 0.012 - wavePhase * 1.2) * (isPlaying ? 24 * bassEnergy : 6);
        ctx.lineTo(x, waveY + freq3);
      }
      ctx.strokeStyle = 'rgba(255, 170, 0, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen || !currentTrack) return null;

  const effectiveDuration = duration > 0 ? duration : currentTrack.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));
  const currentVolume = isMuted ? 0 : volume;

  return (
    <div
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      className="fixed inset-0 z-50 bg-[#050507] text-white overflow-hidden select-none cursor-default"
    >
      {/* Background Interactive Kinetic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top HUD Toolbar */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#ff5500] shadow-[0_0_12px_#ff5500]" />
          <span className="text-xl font-bold font-display tracking-widest text-white">
            AURA<span className="text-[#ff5500]">STAGE</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#ff5500]/20 border border-[#ff5500]/40 text-[11px] font-semibold text-[#ff7700]">
            Modo Escenario Inmersivo
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/80 hover:bg-[#ff5500] hover:text-black border border-white/10 text-xs font-semibold text-neutral-300 transition-all shadow-lg"
          title="Salir del modo pantalla completa (Esc)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Salir (Esc)</span>
        </button>
      </div>

      {/* Centered Floating Glowing Album Artwork */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-30">
        <div
          onClick={onTogglePlay}
          className="relative w-64 h-64 md:w-84 md:h-84 rounded-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105"
          style={{
            boxShadow: isPlaying
              ? '0 0 50px rgba(255, 85, 0, 0.7), 0 0 100px rgba(255, 85, 0, 0.35)'
              : '0 0 20px rgba(255, 85, 0, 0.25)',
            border: isPlaying ? '3px solid #ff5500' : '2px solid rgba(255, 85, 0, 0.4)',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transition: isPlaying ? 'none' : 'transform 0.5s ease-out',
            }}
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Vinyl Spindle Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#050507] border-2 border-[#ff5500] flex items-center justify-center shadow-[0_0_20px_#ff5500]">
            <div className="w-4 h-4 rounded-full bg-[#ff5500]" />
          </div>

          {/* Center Play Overlay on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#ff5500] text-black flex items-center justify-center shadow-[0_0_25px_#ff5500]">
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black" />
              ) : (
                <Play className="w-7 h-7 fill-black translate-x-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Big Track Title & Artist */}
        <div className="mt-8 text-center max-w-lg px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
            {currentTrack.title}
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 font-medium mt-1">
            {currentTrack.artist}
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-neutral-400">
            <span className="text-[#ff7700] font-semibold">{currentTrack.genreLabel}</span>
            <span>·</span>
            <span>{currentTrack.album}</span>
            <span>·</span>
            <span className="font-mono-numbers">{currentTrack.bpm} BPM</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Minimal HUD Controls */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl p-5 rounded-2xl bg-[#090912]/85 backdrop-blur-2xl border border-[#ff5500]/30 shadow-[0_0_40px_rgba(0,0,0,0.9)] z-40 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {/* Seekable Progress Bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono-numbers text-neutral-400 w-12 text-right">
            {formatSeconds(currentTime)}
          </span>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              onSeek(ratio * effectiveDuration);
            }}
            className="flex-1 h-3 bg-neutral-800/80 rounded-full cursor-pointer relative flex items-center group py-1"
          >
            <div
              className="h-1.5 group-hover:h-2 bg-gradient-to-r from-[#ff4400] to-[#ff7700] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#ff5500] shadow-[0_0_12px_#ff5500] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="text-xs font-mono-numbers text-neutral-400 w-12 text-left">
            {formatSeconds(effectiveDuration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleLike(currentTrack.id)}
            className="p-2 text-neutral-400 hover:text-[#ff5500] transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-[#ff5500] text-[#ff5500]' : ''}`}
            />
          </button>

          {/* Core Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={onToggleShuffle}
              className={`p-2 rounded-full ${
                isShuffle ? 'text-[#ff5500] bg-[#ff5500]/15' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              className="p-2 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-transform"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full bg-[#ff5500] hover:bg-[#ff6e00] text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,85,0,0.8)] transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black" />
              ) : (
                <Play className="w-7 h-7 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-transform"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-2 rounded-full ${
                repeatMode !== 'off' ? 'text-[#ff5500] bg-[#ff5500]/15' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={onToggleMute} className="p-1 text-neutral-400 hover:text-white">
              {isMuted || currentVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
