import React from 'react';
import { X, Sliders, Zap, RotateCcw, Sparkles } from 'lucide-react';
import { EqualizerBands, EqualizerPreset } from '../types/music';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bands: EqualizerBands;
  bassBoost: boolean;
  activePresetId: string | null;
  onBandChange: (index: number, gainDb: number) => void;
  onToggleBassBoost: () => void;
  onSelectPreset: (preset: EqualizerPreset) => void;
  onResetFlat: () => void;
}

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  {
    id: 'cyber-bass',
    name: 'Cyber Bass Boost',
    bands: [8, 5, -1, 3, 6],
    bassBoost: true,
  },
  {
    id: 'anime-vocals',
    name: 'Anime Vocal Clarity',
    bands: [-2, 1, 5, 6, 3],
    bassBoost: false,
  },
  {
    id: 'chiptune-retro',
    name: '8-Bit Retro Punch',
    bands: [-3, 3, 6, 2, -3],
    bassBoost: false,
  },
  {
    id: 'edm-club',
    name: 'EDM Club Boom',
    bands: [7, 4, -2, 4, 7],
    bassBoost: true,
  },
  {
    id: 'lofi-warmth',
    name: 'Lo-Fi Chill Warmth',
    bands: [5, 4, 1, -2, -5],
    bassBoost: false,
  },
  {
    id: 'flat',
    name: 'Plano / Estudio Neutral',
    bands: [0, 0, 0, 0, 0],
    bassBoost: false,
  },
];

const BAND_LABELS = [
  { freq: '60 Hz', label: 'Sub-Graves' },
  { freq: '250 Hz', label: 'Graves' },
  { freq: '1 kHz', label: 'Medios' },
  { freq: '4 kHz', label: 'Presencia' },
  { freq: '12 kHz', label: 'Agudos' },
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  bands,
  bassBoost,
  activePresetId,
  onBandChange,
  onToggleBassBoost,
  onSelectPreset,
  onResetFlat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a0a14] border border-[#ff5500]/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,85,0,0.25)] select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff6600]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Ecualizador Gráfico de 5 Bandas
              </h3>
              <p className="text-xs text-neutral-400">
                Ajuste paramétrico de frecuencias en tiempo real con Web Audio API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetFlat}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Restablecer todas las bandas a 0 dB"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Plano</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Segmented Bar */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5500]" />
            <span>Presets de Sonido Recomendados</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EQUALIZER_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left truncate transition-all ${
                    isSelected
                      ? 'bg-[#ff5500] text-black font-bold shadow-[0_0_15px_rgba(255,85,0,0.4)]'
                      : 'bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/5'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Vertical Faders */}
        <div className="mt-8 p-6 rounded-2xl bg-neutral-950/70 border border-[#ff5500]/15">
          <div className="grid grid-cols-5 gap-3 md:gap-6 items-end justify-items-center">
            {bands.map((gainDb, index) => {
              const bandMeta = BAND_LABELS[index];
              return (
                <div key={index} className="flex flex-col items-center w-full">
                  {/* Gain readout */}
                  <div className="text-xs font-mono-numbers font-semibold text-[#ff6600] mb-3">
                    {gainDb > 0 ? `+${gainDb}` : gainDb} dB
                  </div>

                  {/* Vertical Fader Slider Track */}
                  <div className="relative h-44 w-8 flex items-center justify-center">
                    {/* Background centerline (0dB level) */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-700 pointer-events-none" />

                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gainDb}
                      onChange={(e) => onBandChange(index, parseInt(e.target.value))}
                      className="w-40 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500] -rotate-90 origin-center"
                      title={`${bandMeta.freq}: ${gainDb} dB`}
                    />
                  </div>

                  {/* Frequency & Description */}
                  <div className="mt-3 text-center">
                    <span className="block text-xs font-bold text-white tracking-tight">
                      {bandMeta.freq}
                    </span>
                    <span className="block text-[10px] text-neutral-400 mt-0.5">
                      {bandMeta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mega Bass Boost Switch & Bottom Specs */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-[#ff5500]/20">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleBassBoost}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                bassBoost ? 'bg-[#ff5500] shadow-[0_0_12px_#ff5500]' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  bassBoost ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Zap className="w-3.5 h-3.5 text-[#ff5500]" />
                <span>Mega Bass Boost (+6 dB Sub-Bajo)</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Acentúa el sub-bajo y la pegada del bombo en frecuencias menores a 90 Hz
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[#ff5500] text-black font-bold text-xs hover:bg-[#ff6e00] shadow-[0_0_15px_rgba(255,85,0,0.4)] transition-all"
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
