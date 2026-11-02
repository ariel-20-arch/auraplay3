import React from 'react';
import { Upload, Sparkles, BarChart3 } from 'lucide-react';
import { ThemeColor } from '../types/music';
import { THEME_CONFIGS } from '../utils/themePresets';

interface TopBarProps {
  activeView: 'discover' | 'favorites' | 'playlists' | 'synthesizer';
  currentTheme: ThemeColor;
  onSelectView: (view: 'discover' | 'favorites' | 'playlists' | 'synthesizer') => void;
  onSelectTheme: (theme: ThemeColor) => void;
  onOpenUpload: () => void;
  onOpenStats: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  currentTheme,
  onSelectView,
  onSelectTheme,
  onOpenUpload,
  onOpenStats,
}) => {
  const themes: ThemeColor[] = ['orange', 'cyan', 'green', 'magenta'];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#050507]/90 backdrop-blur-xl border-b border-[#ff5500]/20 px-6 flex items-center justify-between gap-6 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div
        onClick={() => onSelectView('discover')}
        className="flex items-center gap-2 cursor-pointer group shrink-0"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500] shadow-[0_0_12px_#ff5500] group-hover:scale-125 transition-transform" />
        <span className="text-xl font-bold font-display tracking-wider text-white whitespace-nowrap">
          AURA<span className="text-[#ff5500] drop-shadow-[0_0_10px_rgba(255,85,0,0.8)]">STREAM</span>
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-400">
        <button
          onClick={() => onSelectView('discover')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
            activeView === 'discover'
              ? 'text-white border-[#ff5500] shadow-[0_4px_12px_-2px_rgba(255,85,0,0.6)]'
              : 'border-transparent hover:text-white'
          }`}
        >
          Descubrir
        </button>

        <button
          onClick={() => onSelectView('playlists')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
            activeView === 'playlists'
              ? 'text-white border-[#ff5500] shadow-[0_4px_12px_-2px_rgba(255,85,0,0.6)]'
              : 'border-transparent hover:text-white'
          }`}
        >
          Listas
        </button>

        <button
          onClick={() => onSelectView('favorites')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
            activeView === 'favorites'
              ? 'text-white border-[#ff5500] shadow-[0_4px_12px_-2px_rgba(255,85,0,0.6)]'
              : 'border-transparent hover:text-white'
          }`}
        >
          Favoritos
        </button>

        <button
          onClick={() => onSelectView('synthesizer')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
            activeView === 'synthesizer'
              ? 'text-white border-[#ff5500] shadow-[0_4px_12px_-2px_rgba(255,85,0,0.6)]'
              : 'border-transparent hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff5500]" />
          <span>Sintetizador</span>
        </button>

        <button
          onClick={onOpenStats}
          className="whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 border-transparent hover:text-white flex items-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#ff5500]" />
          <span>Estadísticas</span>
        </button>
      </nav>

      {/* Zone 3: Neon Theme Color Orbs + Upload Button */}
      <div className="flex items-center gap-4 shrink-0">
        {/* 4 Neon Color Orbs */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-900/80 border border-white/5">
          {themes.map((themeKey) => {
            const conf = THEME_CONFIGS[themeKey];
            const isSelected = currentTheme === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => onSelectTheme(themeKey)}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer relative ${
                  isSelected ? 'scale-110 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: conf.hex,
                  boxShadow: isSelected ? `0 0 10px ${conf.hex}` : undefined,
                }}
                title={`Cambiar acento a ${conf.name}`}
              />
            );
          })}
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#ff5500] hover:bg-[#ff6e00] rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:shadow-[0_0_25px_rgba(255,85,0,0.8)] whitespace-nowrap shrink-0 transform active:scale-95"
          title="Reproducir archivo de audio local"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir Audio</span>
        </button>
      </div>
    </header>
  );
};
