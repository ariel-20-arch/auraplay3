import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sparkles, Cpu, Sliders, Volume2, Flame } from 'lucide-react';

interface WebAudioSynthViewProps {
  onPlayPresetAsTrack?: (name: string, genre: string) => void;
}

export const WebAudioSynthView: React.FC<WebAudioSynthViewProps> = () => {
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [preset, setPreset] = useState<'cyberpunk' | 'chiptune' | 'lofi' | 'phonk'>('cyberpunk');
  const [tempo, setTempo] = useState(130);
  const [filterCutoff, setFilterCutoff] = useState(1200);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  // Preset scales and notes (frequencies in Hz)
  const PRESET_CONFIGS = {
    cyberpunk: {
      name: 'Cyberpunk Arpeggiator',
      wave: 'sawtooth' as OscillatorType,
      scale: [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66],
      color: '#ff5500',
    },
    chiptune: {
      name: '8-Bit Retro Chiptune',
      wave: 'square' as OscillatorType,
      scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25],
      color: '#ff8800',
    },
    lofi: {
      name: 'Lo-Fi Chill Chords',
      wave: 'triangle' as OscillatorType,
      scale: [130.81, 164.81, 196.0, 246.94, 261.63, 329.63],
      color: '#ffaa44',
    },
    phonk: {
      name: 'Heavy Phonk Cowbell & Sub',
      wave: 'sawtooth' as OscillatorType,
      scale: [55, 65.41, 73.42, 82.41, 110, 130.81, 440, 554.37],
      color: '#ff3300',
    },
  };

  const stopSynth = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlayingSynth(false);
  };

  const startSynth = () => {
    stopSynth();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const config = PRESET_CONFIGS[preset];
      const intervalMs = (60 / tempo / 2) * 1000;

      timerRef.current = window.setInterval(() => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const noteIndex = stepRef.current % config.scale.length;
        const freq = config.scale[noteIndex];
        stepRef.current++;

        osc.type = config.wave;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }, intervalMs);

      setIsPlayingSynth(true);
    } catch (err) {
      console.error('Failed to start Web Audio synth:', err);
    }
  };

  useEffect(() => {
    if (isPlayingSynth) {
      startSynth();
    }
    return () => stopSynth();
  }, [preset, tempo, filterCutoff]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ff6600] tracking-wider uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Generador de Ondas y Sintetizador en Vivo</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Sintetizador Web Procedural
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Genera ritmos y melodías matemáticas en tiempo real con osciladores Web Audio puros.
          </p>
        </div>

        <button
          onClick={() => (isPlayingSynth ? stopSynth() : startSynth())}
          className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg ${
            isPlayingSynth
              ? 'bg-[#ff5500] text-black shadow-[0_0_25px_rgba(255,85,0,0.8)] animate-neon-pulse'
              : 'bg-neutral-800 hover:bg-[#ff5500] text-white hover:text-black border border-neutral-700'
          }`}
        >
          {isPlayingSynth ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Detener Sintetizador</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
              <span>Iniciar Secuenciador</span>
            </>
          )}
        </button>
      </div>

      {/* Preset selector grid */}
      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Seleccionar Preset Temático
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(PRESET_CONFIGS) as Array<keyof typeof PRESET_CONFIGS>).map((key) => {
            const conf = PRESET_CONFIGS[key];
            const isSelected = preset === key;

            return (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-[#ff5500]/20 border-2 border-[#ff5500] shadow-[0_0_15px_rgba(255,85,0,0.3)]'
                    : 'bg-neutral-900/60 hover:bg-neutral-800 border border-white/5'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: conf.color }}
                />
                <h4 className="text-sm font-semibold text-white">{conf.name}</h4>
                <p className="text-[11px] text-neutral-400 mt-1 capitalize">
                  Onda: {conf.wave}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synthesizer Parameter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#090910] border border-[#ff5500]/20">
        <div>
          <div className="flex justify-between text-xs font-medium text-neutral-300 mb-2">
            <span>Tempo (BPM): {tempo}</span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-neutral-300 mb-2">
            <span>Filtro Pasa-Bajos: {filterCutoff} Hz</span>
          </div>
          <input
            type="range"
            min="200"
            max="3500"
            step="50"
            value={filterCutoff}
            onChange={(e) => setFilterCutoff(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
          />
        </div>
      </div>
    </div>
  );
};
