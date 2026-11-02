import React from 'react';
import { X, Disc, Zap, Flame, Radio, Check } from 'lucide-react';
import { DJSettings } from '../types/music';

interface DJControlsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DJSettings;
  onChangeSettings: (newSettings: DJSettings) => void;
}

export const DJControlsPopover: React.FC<DJControlsPopoverProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  if (!isOpen) return null;

  const handlePreset = (
    modeName: DJSettings['modeName'],
    speed: number,
    preservePitch: boolean
  ) => {
    onChangeSettings({
      ...settings,
      modeName,
      speed,
      preservePitch,
    });
  };

  return (
    <div className="fixed bottom-28 right-4 md:right-12 z-50 w-80 p-5 rounded-2xl bg-[#090912]/95 backdrop-blur-2xl border border-[#ff5500]/40 shadow-[0_0_35px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Disc className="w-4 h-4 text-[#ff5500] animate-spin" />
          <span>Motor DJ & Transición</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Crossfade Duration Section */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span>Crossfade entre Canciones</span>
          <span className="font-mono-numbers text-[#ff6600]">
            {settings.crossfadeDuration === 0 ? 'Desactivado' : `${settings.crossfadeDuration} seg`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="8"
          step="1"
          value={settings.crossfadeDuration}
          onChange={(e) =>
            onChangeSettings({
              ...settings,
              crossfadeDuration: parseInt(e.target.value),
            })
          }
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
        />
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>0s (Corte)</span>
          <span>3s (Suave)</span>
          <span>6s (Club)</span>
          <span>8s (Largo)</span>
        </div>
      </div>

      {/* Speed & Pitch Presets */}
      <div className="mt-5 space-y-2">
        <div className="text-xs font-semibold text-neutral-300">
          Modos de Velocidad & Pitch
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePreset('Normal', 1.0, true)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              settings.modeName === 'Normal'
                ? 'bg-[#ff5500] text-black font-bold shadow-[0_0_12px_rgba(255,85,0,0.5)]'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/5'
            }`}
          >
            Normal (1.0x)
          </button>

          <button
            onClick={() => handlePreset('Nightcore', 1.25, false)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              settings.modeName === 'Nightcore'
                ? 'bg-[#ff5500] text-black font-bold shadow-[0_0_12px_rgba(255,85,0,0.5)]'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/5'
            }`}
          >
            Nightcore (1.25x)
          </button>

          <button
            onClick={() => handlePreset('Vaporwave', 0.85, false)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              settings.modeName === 'Vaporwave'
                ? 'bg-[#ff5500] text-black font-bold shadow-[0_0_12px_rgba(255,85,0,0.5)]'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/5'
            }`}
          >
            Slowed (0.85x)
          </button>

          <button
            onClick={() => handlePreset('Hyper', 1.5, true)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
              settings.modeName === 'Hyper'
                ? 'bg-[#ff5500] text-black font-bold shadow-[0_0_12px_rgba(255,85,0,0.5)]'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/5'
            }`}
          >
            Hyper Run (1.5x)
          </button>
        </div>
      </div>

      {/* Manual Fine-Tuning Slider */}
      <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-400">
          <span>Ajuste fino de velocidad:</span>
          <span className="font-mono-numbers text-white font-bold">{settings.speed.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.75"
          max="1.75"
          step="0.05"
          value={settings.speed}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChangeSettings({
              ...settings,
              speed: val,
              modeName: val === 1.0 ? 'Normal' : 'Normal',
            });
          }}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
        />
      </div>
    </div>
  );
};
