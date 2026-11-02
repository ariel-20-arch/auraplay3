import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Disc3, Sparkles, Volume2, Maximize2 } from 'lucide-react';
import { Track } from '../types/music';

interface CircularVisualizerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTogglePlay: () => void;
  onOpenFullscreen?: () => void;
  visualizerMode?: 'bars' | 'rings' | 'waves';
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  currentTrack,
  isPlaying,
  audioRef,
  onTogglePlay,
  onOpenFullscreen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseScale, setPulseScale] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);
  const animFrameIdRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize Web Audio API Analyser
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const setupAudioContext = () => {
      if (audioContextRef.current && analyserRef.current) return;

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;

        // Try connecting media element
        try {
          if (!sourceNodeRef.current) {
            const source = ctx.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceNodeRef.current = source;
          }
        } catch {
          // Cross-origin fallback handles canvas simulation
        }

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      } catch (err) {
        console.warn('Web Audio initialization note:', err);
      }
    };

    const handleFirstPlay = () => {
      setupAudioContext();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    audioElement.addEventListener('play', handleFirstPlay);
    return () => {
      audioElement.removeEventListener('play', handleFirstPlay);
    };
  }, [audioRef]);

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAngle = 0;
    const dataArray = new Uint8Array(64);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = 140; // matches the album cover radius

      ctx.clearRect(0, 0, width, height);

      let bassEnergy = 0;

      if (isPlaying) {
        localAngle += 0.003;
        setRotationAngle((prev) => (prev + 0.3) % 360);

        // Get actual frequency data or synthesize responsive rhythm
        if (analyserRef.current) {
          try {
            analyserRef.current.getByteFrequencyData(dataArray);
            bassEnergy = (dataArray[0] + dataArray[1] + dataArray[2] + dataArray[3]) / (4 * 255);
          } catch {
            bassEnergy = 0.5 + Math.sin(Date.now() / 200) * 0.3;
          }
        } else {
          // Synthetic high-energy bass pulse
          const t = Date.now() / 280;
          bassEnergy = 0.4 + Math.sin(t) * 0.25 + Math.cos(t * 1.5) * 0.15;
          for (let i = 0; i < dataArray.length; i++) {
            dataArray[i] = Math.max(20, Math.floor(Math.sin(t + i * 0.3) * 80 + 120 + Math.random() * 30));
          }
        }
      } else {
        bassEnergy = 0.05;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = 10;
        }
      }

      setPulseScale(1 + bassEnergy * 0.12);

      // Draw outer ambient glow bloom
      if (isPlaying) {
        const glowGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          baseRadius * 0.9,
          centerX,
          centerY,
          baseRadius * 1.6 + bassEnergy * 50
        );
        glowGrad.addColorStop(0, 'rgba(255, 85, 0, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(255, 85, 0, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 85, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.7 + bassEnergy * 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw radial frequency bars
      const numBars = 64;
      const angleStep = (Math.PI * 2) / numBars;

      for (let i = 0; i < numBars; i++) {
        const angle = i * angleStep + localAngle;
        const freqIndex = i < 32 ? i : numBars - i;
        const rawVal = dataArray[freqIndex] || 20;
        const barHeight = isPlaying ? (rawVal / 255) * 65 + 6 : 6;

        const x1 = centerX + Math.cos(angle) * (baseRadius + 4);
        const y1 = centerY + Math.sin(angle) * (baseRadius + 4);
        const x2 = centerX + Math.cos(angle) * (baseRadius + 4 + barHeight);
        const y2 = centerY + Math.sin(angle) * (baseRadius + 4 + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        // Neon orange gradient
        const barGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        barGrad.addColorStop(0, '#ff5500');
        barGrad.addColorStop(0.6, '#ff8800');
        barGrad.addColorStop(1, '#ffc400');

        ctx.strokeStyle = barGrad;
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = isPlaying ? 12 : 2;
        ctx.stroke();
      }

      // Inner neon rim stroke
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = isPlaying ? '#ff7700' : 'rgba(255, 85, 0, 0.3)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff5500';
      ctx.shadowBlur = isPlaying ? 24 : 4;
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying]);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400">
        <Disc3 className="w-16 h-16 text-neutral-700 animate-spin mb-4" />
        <p className="text-sm">Selecciona una pista para comenzar a reproducir</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-6 select-none">
      {/* Background radial atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: isPlaying
            ? 'radial-gradient(circle, rgba(255,85,0,0.25) 0%, rgba(255,85,0,0.06) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Main Circular Visualizer Stage */}
      <div className="relative w-[380px] h-[380px] flex items-center justify-center">
        {/* Canvas for Radial Equalizer Bars & Plasma Bloom */}
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* Pulsing Neon Frame Container */}
        <div
          className="relative w-[260px] h-[260px] rounded-full overflow-hidden flex items-center justify-center group cursor-pointer transition-transform duration-150 ease-out z-20"
          style={{
            transform: `scale(${pulseScale})`,
            boxShadow: isPlaying
              ? '0 0 35px rgba(255, 85, 0, 0.65), 0 0 70px rgba(255, 85, 0, 0.3), inset 0 0 25px rgba(255, 85, 0, 0.4)'
              : '0 0 15px rgba(255, 85, 0, 0.2), inset 0 0 10px rgba(255, 85, 0, 0.1)',
            border: isPlaying ? '3px solid #ff5500' : '2px solid rgba(255, 85, 0, 0.35)',
          }}
          onClick={onTogglePlay}
          role="button"
          tabIndex={0}
          aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          {/* Rotating Vinyl/Cover Texture */}
          <div
            className="w-full h-full relative"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transition: isPlaying ? 'none' : 'transform 0.5s ease-out',
            }}
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-95 contrast-105"
            />
            {/* Center vinyl spindle ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#050507] border-2 border-[#ff5500] flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.8)]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5500]" />
            </div>
          </div>

          {/* Hover Play/Pause Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#ff5500] text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,85,0,0.9)] transform group-hover:scale-105 transition-transform">
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black translate-x-0.5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Track Info & Dopamine Feedback Kicker */}
      <div className="mt-4 text-center max-w-md px-4 z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-[#ff5500]/30 text-xs text-[#ff7700] mb-2 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#ff5500]" />
          <span className="font-medium tracking-wide uppercase text-[11px]">
            {isPlaying ? 'Transmitiendo en Alta Fidelidad' : 'En Pausa'}
          </span>
          <span className="text-neutral-500">·</span>
          <span className="font-mono-numbers text-neutral-400">{currentTrack.bitrate || '320 kbps'}</span>
        </div>

        <h2 className="text-2xl font-bold font-display text-white tracking-tight line-clamp-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {currentTrack.title}
        </h2>
        <p className="text-sm text-neutral-300 mt-1 font-medium line-clamp-1">
          {currentTrack.artist}
        </p>

        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-neutral-400">
          <span>{currentTrack.album}</span>
          <span>·</span>
          <span className="text-[#ff7700] font-medium">{currentTrack.genreLabel}</span>
          <span>·</span>
          <span className="font-mono-numbers">{currentTrack.bpm} BPM</span>
        </div>
      </div>
    </div>
  );
};
