import React from 'react';
import {
  Compass,
  Heart,
  PlusCircle,
  Music2,
  Library,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface SidebarProps {
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  activeView: 'discover' | 'favorites' | 'playlists' | 'synthesizer';
  likedTrackCount: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectView: (view: 'discover' | 'favorites' | 'playlists' | 'synthesizer') => void;
  onSelectPlaylist: (playlistId: string | null) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  playlists,
  selectedPlaylistId,
  activeView,
  likedTrackCount,
  currentTrack,
  isPlaying,
  onSelectView,
  onSelectPlaylist,
  onCreatePlaylist,
}) => {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-[calc(100vh-4rem-6rem)] bg-[#07070b]/90 backdrop-blur-xl border-r border-[#ff5500]/15 p-4 select-none">
      {/* Navigation Menu */}
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
          Explorar
        </div>

        <button
          onClick={() => {
            onSelectView('discover');
            onSelectPlaylist(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            activeView === 'discover' && !selectedPlaylistId
              ? 'bg-[#ff5500]/15 text-[#ff6600] border border-[#ff5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.2)]'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <Compass className="w-4 h-4 text-[#ff5500]" />
          <span>Todo el Catálogo</span>
        </button>

        <button
          onClick={() => {
            onSelectView('favorites');
            onSelectPlaylist(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            activeView === 'favorites'
              ? 'bg-[#ff5500]/15 text-[#ff6600] border border-[#ff5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.2)]'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-[#ff5500] fill-current" />
            <span>Canciones Favoritas</span>
          </div>
          <span className="font-mono-numbers text-xs px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-300">
            {likedTrackCount}
          </span>
        </button>

        <button
          onClick={() => {
            onSelectView('synthesizer');
            onSelectPlaylist(null);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            activeView === 'synthesizer'
              ? 'bg-[#ff5500]/15 text-[#ff6600] border border-[#ff5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.2)]'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#ff5500]" />
          <span>Sintetizador Web</span>
        </button>
      </div>

      <div className="my-4 border-t border-neutral-800/60" />

      {/* Playlists Header & Add Button */}
      <div className="flex items-center justify-between px-3 mb-2">
        <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
          Tus Listas
        </div>
        <button
          onClick={onCreatePlaylist}
          className="p-1 text-neutral-400 hover:text-[#ff5500] hover:scale-110 transition-transform"
          title="Crear nueva lista de reproducción"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Playlist Items */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {playlists.map((playlist) => {
          const isSelected = selectedPlaylistId === playlist.id;
          const containsCurrentTrack =
            currentTrack && playlist.trackIds.includes(currentTrack.id);

          return (
            <button
              key={playlist.id}
              onClick={() => {
                onSelectView('playlists');
                onSelectPlaylist(playlist.id);
              }}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isSelected
                  ? 'bg-[#ff5500]/15 text-white border border-[#ff5500]/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              <Library
                className={`w-4 h-4 shrink-0 ${
                  isSelected ? 'text-[#ff5500]' : 'text-neutral-400 group-hover:text-neutral-300'
                }`}
              />

              <span className="truncate flex-1">{playlist.name}</span>

              {/* Animated playing indicator if track is in this playlist and active */}
              {containsCurrentTrack && isPlaying && (
                <div className="flex items-end gap-0.5 h-3 shrink-0">
                  <span className="w-0.5 bg-[#ff5500] animate-eq-1 rounded-full" />
                  <span className="w-0.5 bg-[#ff5500] animate-eq-2 rounded-full" />
                  <span className="w-0.5 bg-[#ff5500] animate-eq-3 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* System Engine Quality Info card */}
      <div className="mt-auto p-3 rounded-xl bg-black/40 border border-[#ff5500]/20 text-xs">
        <div className="flex items-center gap-2 text-[#ff6600] font-semibold text-[11px] mb-1">
          <Zap className="w-3.5 h-3.5" />
          <span>MOTOR DE AUDIO 44.1 KHZ</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Procesamiento de espectro estéreo con visualizador Web Audio de baja latencia.
        </p>
      </div>
    </aside>
  );
};
