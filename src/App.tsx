import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Play,
  Heart,
  Music2,
  Library,
  Plus,
  Shuffle,
  Compass,
  X,
  Volume2,
  Sliders,
  Maximize2,
  Headphones,
  Disc,
  BarChart3
} from 'lucide-react';
import {
  Track,
  Playlist,
  Genre,
  RepeatMode,
  EqualizerBands,
  EqualizerPreset,
  ThemeColor,
  DJSettings,
  ListeningStats
} from './types/music';
import { TRACK_CATALOG, INITIAL_PLAYLISTS } from './data/musicCatalog';
import { CircularVisualizer } from './components/CircularVisualizer';
import { PlayerDock } from './components/PlayerDock';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { TrackCard } from './components/TrackCard';
import { TrackRow } from './components/TrackRow';
import { SyncedLyricsModal } from './components/SyncedLyricsModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AudioUploadModal } from './components/AudioUploadModal';
import { WebAudioSynthView } from './components/WebAudioSynthView';
import { EqualizerModal, EQUALIZER_PRESETS } from './components/EqualizerModal';
import { FullscreenStage } from './components/FullscreenStage';
import { DJControlsPopover } from './components/DJControlsPopover';
import { StatsModal } from './components/StatsModal';
import { applyThemeToDocument } from './utils/themePresets';

export default function App() {
  // Theme Color State
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('aura_theme_color');
    return (saved as ThemeColor) || 'orange';
  });

  useEffect(() => {
    applyThemeToDocument(themeColor);
    localStorage.setItem('aura_theme_color', themeColor);
  }, [themeColor]);

  // Track Catalog & User State
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('aura_custom_tracks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...TRACK_CATALOG];
      } catch {
        return TRACK_CATALOG;
      }
    }
    return TRACK_CATALOG;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('aura_playlists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PLAYLISTS;
      }
    }
    return INITIAL_PLAYLISTS;
  });

  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('aura_liked_tracks');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set(['track-1', 'track-3']);
      }
    }
    return new Set(['track-1', 'track-3']);
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(tracks[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('aura_volume');
    return saved ? parseFloat(saved) : 0.85;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // 8D Audio & DJ Settings
  const [is8DActive, setIs8DActive] = useState<boolean>(() => {
    return localStorage.getItem('aura_8d_active') === 'true';
  });
  const [orbitPan, setOrbitPan] = useState<number>(0);

  const [djSettings, setDjSettings] = useState<DJSettings>(() => {
    const saved = localStorage.getItem('aura_dj_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      crossfadeDuration: 3,
      speed: 1.0,
      modeName: 'Normal',
      preservePitch: true,
    };
  });
  const [isDJOpen, setIsDJOpen] = useState<boolean>(false);

  // Equalizer State
  const [eqBands, setEqBands] = useState<EqualizerBands>(() => {
    const saved = localStorage.getItem('aura_eq_bands');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [0, 0, 0, 0, 0];
      }
    }
    return [0, 0, 0, 0, 0];
  });
  const [bassBoost, setBassBoost] = useState<boolean>(() => {
    return localStorage.getItem('aura_bass_boost') === 'true';
  });
  const [activePresetId, setActivePresetId] = useState<string | null>('flat');

  // Navigation & Filtering
  const [activeView, setActiveView] = useState<'discover' | 'favorites' | 'playlists' | 'synthesizer'>('discover');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

  // Listening Stats Telemetry
  const [stats, setStats] = useState<ListeningStats>(() => {
    const saved = localStorage.getItem('aura_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      sessionSeconds: 140,
      tracksPlayed: 4,
      genreCounts: { 'Anime & Otaku': 3, Synthwave: 2, 'Gaming & 8-Bit': 1 },
      trackPlayCounts: { 'track-1': 2, 'track-3': 1 },
    };
  });

  // Audio References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const crossfadeGainRef = useRef<GainNode | null>(null);

  // Update DJ Speed on Audio Element
  useEffect(() => {
    localStorage.setItem('aura_dj_settings', JSON.stringify(djSettings));
    if (audioRef.current) {
      audioRef.current.playbackRate = djSettings.speed;
      try {
        (audioRef.current as unknown as { preservesPitch: boolean }).preservesPitch = djSettings.preservePitch;
      } catch {
        // ignore
      }
    }
  }, [djSettings]);

  // Initialize Web Audio Graph (Equalizer + 8D Panner + Gain + Analyser)
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const setupAudioPipeline = () => {
      if (audioContextRef.current && filtersRef.current.length > 0) return;

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();

        // 5 Biquad Filter Frequencies: 60Hz, 250Hz, 1000Hz, 4000Hz, 12000Hz
        const f60 = ctx.createBiquadFilter();
        f60.type = 'lowshelf';
        f60.frequency.value = 60;

        const f250 = ctx.createBiquadFilter();
        f250.type = 'peaking';
        f250.frequency.value = 250;
        f250.Q.value = 1.0;

        const f1000 = ctx.createBiquadFilter();
        f1000.type = 'peaking';
        f1000.frequency.value = 1000;
        f1000.Q.value = 1.0;

        const f4000 = ctx.createBiquadFilter();
        f4000.type = 'peaking';
        f4000.frequency.value = 4000;
        f4000.Q.value = 1.0;

        const f12000 = ctx.createBiquadFilter();
        f12000.type = 'highshelf';
        f12000.frequency.value = 12000;

        const filterChain = [f60, f250, f1000, f4000, f12000];
        for (let i = 0; i < filterChain.length - 1; i++) {
          filterChain[i].connect(filterChain[i + 1]);
        }

        // Stereo Panner for 8D Audio
        let pannerNode: StereoPannerNode | null = null;
        if (ctx.createStereoPanner) {
          pannerNode = ctx.createStereoPanner();
          filterChain[filterChain.length - 1].connect(pannerNode);
        }

        // Crossfade / Master Gain
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        if (pannerNode) {
          pannerNode.connect(gainNode);
        } else {
          filterChain[filterChain.length - 1].connect(gainNode);
        }
        gainNode.connect(ctx.destination);

        try {
          if (!sourceNodeRef.current) {
            const source = ctx.createMediaElementSource(audioElement);
            source.connect(filterChain[0]);
            sourceNodeRef.current = source;
          }
        } catch {
          // Cross-origin fallback
        }

        audioContextRef.current = ctx;
        filtersRef.current = filterChain;
        pannerRef.current = pannerNode;
        crossfadeGainRef.current = gainNode;
      } catch (err) {
        console.warn('Web Audio graph setup note:', err);
      }
    };

    const handleFirstPlay = () => {
      setupAudioPipeline();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    audioElement.addEventListener('play', handleFirstPlay);
    return () => {
      audioElement.removeEventListener('play', handleFirstPlay);
    };
  }, []);

  // 8D Audio Continuous Orbital Pan Loop
  useEffect(() => {
    localStorage.setItem('aura_8d_active', is8DActive ? 'true' : 'false');
    let animId: number;

    const orbitLoop = () => {
      if (is8DActive && isPlaying) {
        // Orbit cycle ~ 7 seconds per 360 degree rotation
        const panValue = Math.sin(Date.now() / 1200) * 0.85;
        setOrbitPan(panValue);
        if (pannerRef.current) {
          pannerRef.current.pan.value = panValue;
        }
      } else {
        setOrbitPan(0);
        if (pannerRef.current) {
          pannerRef.current.pan.value = 0;
        }
      }
      animId = requestAnimationFrame(orbitLoop);
    };

    animId = requestAnimationFrame(orbitLoop);
    return () => cancelAnimationFrame(animId);
  }, [is8DActive, isPlaying]);

  // Update EQ Filter Gains
  useEffect(() => {
    localStorage.setItem('aura_eq_bands', JSON.stringify(eqBands));
    localStorage.setItem('aura_bass_boost', bassBoost ? 'true' : 'false');

    if (filtersRef.current.length === 5) {
      filtersRef.current.forEach((filter, index) => {
        let gainValue = eqBands[index] || 0;
        if (index === 0 && bassBoost) {
          gainValue += 6;
        }
        filter.gain.value = gainValue;
      });
    }
  }, [eqBands, bassBoost]);

  // Session Stats Counter Timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStats((prev) => {
        const next = {
          ...prev,
          sessionSeconds: prev.sessionSeconds + 1,
        };
        localStorage.setItem('aura_stats', JSON.stringify(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Equalizer Handlers
  const handleBandChange = (index: number, gainDb: number) => {
    setActivePresetId(null);
    setEqBands((prev) => {
      const next: EqualizerBands = [...prev];
      next[index] = gainDb;
      return next;
    });
  };

  const handleToggleBassBoost = () => {
    setBassBoost((prev) => !prev);
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    setActivePresetId(preset.id);
    setEqBands([...preset.bands]);
    setBassBoost(preset.bassBoost);
  };

  const handleResetFlat = () => {
    setActivePresetId('flat');
    setEqBands([0, 0, 0, 0, 0]);
    setBassBoost(false);
  };

  // Playlists & Favorites Storage
  useEffect(() => {
    localStorage.setItem('aura_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('aura_liked_tracks', JSON.stringify(Array.from(likedTrackIds)));
  }, [likedTrackIds]);

  useEffect(() => {
    localStorage.setItem('aura_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playback Handlers
  const handleTogglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error or user gesture required:', err);
      });
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      handleTogglePlay();
      return;
    }

    // DJ Crossfade transition if active
    const audio = audioRef.current;
    if (audio && isPlaying && djSettings.crossfadeDuration > 0 && crossfadeGainRef.current) {
      const gainNode = crossfadeGainRef.current;
      const ctx = audioContextRef.current;
      if (ctx) {
        // Quick 0.3s fade-out
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        setTimeout(() => {
          setCurrentTrack(track);
          setCurrentTime(0);
          audio.src = track.audioUrl;
          audio.currentTime = 0;
          audio.playbackRate = djSettings.speed;
          audio.play().then(() => {
            setIsPlaying(true);
            gainNode.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.4);
          }).catch(() => {});
        }, 300);
      } else {
        setCurrentTrack(track);
        setCurrentTime(0);
        setIsPlaying(true);
        audio.src = track.audioUrl;
        audio.currentTime = 0;
        audio.playbackRate = djSettings.speed;
        audio.play().catch(() => {});
      }
    } else {
      setCurrentTrack(track);
      setCurrentTime(0);
      setIsPlaying(true);
      if (audio) {
        audio.src = track.audioUrl;
        audio.currentTime = 0;
        audio.playbackRate = djSettings.speed;
        audio.play().catch(() => {});
      }
    }

    // Telemetry updates
    setStats((prev) => {
      const gLabel = track.genreLabel;
      const gCounts = { ...prev.genreCounts, [gLabel]: (prev.genreCounts[gLabel] || 0) + 1 };
      const tCounts = { ...prev.trackPlayCounts, [track.id]: (prev.trackPlayCounts[track.id] || 0) + 1 };
      const updated: ListeningStats = {
        ...prev,
        tracksPlayed: prev.tracksPlayed + 1,
        genreCounts: gCounts,
        trackPlayCounts: tCounts,
      };
      localStorage.setItem('aura_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // Queue Calculation
  const currentQueue = useMemo(() => {
    if (selectedPlaylistId) {
      const pl = playlists.find((p) => p.id === selectedPlaylistId);
      if (pl) {
        return tracks.filter((t) => pl.trackIds.includes(t.id));
      }
    }
    if (activeView === 'favorites') {
      return tracks.filter((t) => likedTrackIds.has(t.id));
    }
    if (selectedGenre !== 'all') {
      return tracks.filter((t) => t.genre === selectedGenre);
    }
    return tracks;
  }, [tracks, selectedPlaylistId, activeView, selectedGenre, likedTrackIds, playlists]);

  const handleNext = () => {
    if (currentQueue.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * currentQueue.length);
      handlePlayTrack(currentQueue[randomIndex]);
      return;
    }

    const currentIndex = currentQueue.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % currentQueue.length;
    handlePlayTrack(currentQueue[nextIndex]);
  };

  const handlePrev = () => {
    if (currentQueue.length === 0) return;
    if (currentTime > 4) {
      handleSeek(0);
      return;
    }
    const currentIndex = currentQueue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
    handlePlayTrack(currentQueue[prevIndex]);
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleCreatePlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      trackIds: currentTrack ? [currentTrack.id] : [],
      coverUrl: currentTrack?.coverUrl || '/covers/cover_anime_cyberpunk.jpg',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setSelectedPlaylistId(newPlaylist.id);
    setActiveView('playlists');
  };

  const handleTrackUploaded = (newTrack: Track) => {
    setTracks((prev) => [newTrack, ...prev]);
    const custom = tracks.filter((t) => t.id.startsWith('local-'));
    localStorage.setItem('aura_custom_tracks', JSON.stringify([newTrack, ...custom]));
    handlePlayTrack(newTrack);
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    let result = tracks;

    if (activeView === 'favorites') {
      result = result.filter((t) => likedTrackIds.has(t.id));
    } else if (activeView === 'playlists' && selectedPlaylistId) {
      const pl = playlists.find((p) => p.id === selectedPlaylistId);
      if (pl) {
        result = result.filter((t) => pl.trackIds.includes(t.id));
      }
    } else if (selectedGenre !== 'all') {
      result = result.filter((t) => t.genre === selectedGenre);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genreLabel.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tracks, activeView, selectedPlaylistId, playlists, selectedGenre, searchQuery, likedTrackIds]);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  const GENRE_TABS: { id: Genre; label: string }[] = [
    { id: 'all', label: 'Todos los Géneros' },
    { id: 'anime', label: 'Anime & Otaku' },
    { id: 'gaming', label: 'Gaming & 8-Bit' },
    { id: 'synthwave', label: 'Synthwave / Cyber' },
    { id: 'phonk', label: 'Phonk & Drift' },
    { id: 'lofi', label: 'Lo-Fi Chill Beats' },
    { id: 'rock', label: 'Rock & Metal' },
    { id: 'edm', label: 'EDM & Future Bass' },
    { id: 'epic', label: 'Epic & Soundtrack' },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans selection:bg-[#ff5500]/30 selection:text-[#ff5500]">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (repeatMode === 'one') {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          } else {
            handleNext();
          }
        }}
      />

      {/* Top Bar with 3-zone contract & Color Orbs */}
      <TopBar
        activeView={activeView}
        currentTheme={themeColor}
        onSelectView={(view) => {
          setActiveView(view);
          if (view !== 'playlists') setSelectedPlaylistId(null);
        }}
        onSelectTheme={(th) => setThemeColor(th)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          activeView={activeView}
          likedTrackCount={likedTrackIds.size}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelectView={(view) => {
            setActiveView(view);
            if (view !== 'playlists') setSelectedPlaylistId(null);
          }}
          onSelectPlaylist={(plId) => {
            setSelectedPlaylistId(plId);
            setActiveView('playlists');
          }}
          onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        />

        {/* Center Content Scrollable Container */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem-6rem)] pb-12">
          {activeView === 'synthesizer' ? (
            <WebAudioSynthView />
          ) : (
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
              {/* Search Bar & Multi-Genre Filter Segmented Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar canción, artista o género (ej: Anime, Phonk, Synthwave)..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0e0e16]/80 border border-[#ff5500]/25 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Shortcut Buttons for Equalizer and Fullscreen */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEqualizerOpen(true)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                        isEqualizerOpen || bassBoost
                          ? 'bg-[#ff5500]/20 text-[#ff6600] border-[#ff5500]/50 shadow-[0_0_12px_rgba(255,85,0,0.3)]'
                          : 'bg-neutral-900/80 text-neutral-300 hover:text-white border-white/5'
                      }`}
                      title="Abrir ecualizador de sonido"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#ff5500]" />
                      <span className="hidden sm:inline">Ecualizador</span>
                      {bassBoost && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-ping" />
                      )}
                    </button>

                    <button
                      onClick={() => setIsFullscreenOpen(true)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-neutral-900/80 hover:bg-[#ff5500] hover:text-black border border-white/5 text-neutral-300 transition-all"
                      title="Abrir Escenario Inmersivo"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Escenario</span>
                    </button>
                  </div>
                </div>

                {/* Genre Filter Buttons with Clean Segmented Styling */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {GENRE_TABS.map((tab) => {
                    const isSelected = selectedGenre === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSelectedGenre(tab.id);
                          if (activeView !== 'discover') setActiveView('discover');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ff5500] text-black shadow-[0_0_15px_rgba(255,85,0,0.5)] font-bold'
                            : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-white/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Header if in Favorites or Playlist */}
              {activeView === 'favorites' && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[#ff5500]/15 via-black/40 to-transparent border border-[#ff5500]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#ff5500] text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.6)]">
                      <Heart className="w-8 h-8 fill-black" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display text-white">
                        Canciones Favoritas
                      </h2>
                      <p className="text-xs text-neutral-400 mt-1">
                        {filteredTracks.length} canciones marcadas con corazón
                      </p>
                    </div>
                  </div>

                  {filteredTracks.length > 0 && (
                    <button
                      onClick={() => handlePlayTrack(filteredTracks[0])}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#ff6e00] text-black font-bold text-xs shadow-[0_0_20px_rgba(255,85,0,0.5)] transition-all"
                    >
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      <span>Reproducir Todo</span>
                    </button>
                  )}
                </div>
              )}

              {activeView === 'playlists' && selectedPlaylist && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[#ff5500]/15 via-black/40 to-transparent border border-[#ff5500]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#ff5500]/40 shadow-[0_0_20px_rgba(255,85,0,0.4)]">
                      <img
                        src={selectedPlaylist.coverUrl || '/covers/cover_anime_cyberpunk.jpg'}
                        alt={selectedPlaylist.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#ff6600] uppercase tracking-wider">
                        Lista de Reproducción
                      </div>
                      <h2 className="text-2xl font-bold font-display text-white mt-0.5">
                        {selectedPlaylist.name}
                      </h2>
                      <p className="text-xs text-neutral-400 mt-1">
                        {selectedPlaylist.description || `${filteredTracks.length} canciones`}
                      </p>
                    </div>
                  </div>

                  {filteredTracks.length > 0 && (
                    <button
                      onClick={() => handlePlayTrack(filteredTracks[0])}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#ff6e00] text-black font-bold text-xs shadow-[0_0_20px_rgba(255,85,0,0.5)] transition-all"
                    >
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      <span>Reproducir Lista</span>
                    </button>
                  )}
                </div>
              )}

              {/* Centered Circular Visualizer Stage on Discover View */}
              {activeView === 'discover' && !searchQuery && (
                <section className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-[#0c0c16]/80 via-[#07070c]/90 to-[#050507] border border-[#ff5500]/25 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-hidden">
                  <CircularVisualizer
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    audioRef={audioRef}
                    onTogglePlay={handleTogglePlay}
                  />
                </section>
              )}

              {/* Music Grid: Featured Tracks and Catalog */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-display text-white">
                      {searchQuery
                        ? `Resultados para "${searchQuery}"`
                        : activeView === 'discover'
                        ? 'Catálogo Completo y Destacadas'
                        : 'Lista de Pistas'}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {filteredTracks.length} canciones disponibles en streaming directo
                    </p>
                  </div>

                  {filteredTracks.length > 0 && (
                    <button
                      onClick={() => {
                        const random = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
                        handlePlayTrack(random);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-[#ff5500] hover:text-black border border-white/5 text-xs font-semibold transition-all text-neutral-300"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Aleatorio</span>
                    </button>
                  )}
                </div>

                {filteredTracks.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-neutral-950/50 border border-neutral-800">
                    <Music2 className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <h4 className="text-base font-semibold text-white">No se encontraron canciones</h4>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                      Intenta buscar con otro término o explora las categorías de Anime, Gaming, Synthwave o Lo-Fi.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedGenre('all');
                        setActiveView('discover');
                      }}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#ff5500] text-black text-xs font-semibold hover:bg-[#ff6e00]"
                    >
                      Ver Todo el Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredTracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        isCurrent={currentTrack?.id === track.id}
                        isPlaying={isPlaying && currentTrack?.id === track.id}
                        isLiked={likedTrackIds.has(track.id)}
                        onPlay={handlePlayTrack}
                        onToggleLike={handleToggleLike}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Table List View for Quick Exploration */}
              {filteredTracks.length > 0 && (
                <section className="space-y-3 pt-6 border-t border-neutral-800/80">
                  <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Vista Detallada de Pistas
                  </h4>
                  <div className="space-y-1">
                    {filteredTracks.map((track, idx) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                        isCurrent={currentTrack?.id === track.id}
                        isPlaying={isPlaying && currentTrack?.id === track.id}
                        isLiked={likedTrackIds.has(track.id)}
                        onPlay={handlePlayTrack}
                        onToggleLike={handleToggleLike}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>

        {/* Lateral Queue Drawer */}
        {isQueueOpen && (
          <aside className="w-80 shrink-0 bg-[#07070c]/95 backdrop-blur-2xl border-l border-[#ff5500]/25 p-4 flex flex-col h-[calc(100vh-4rem-6rem)] animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cola de Reproducción ({currentQueue.length})
              </h3>
              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
              {currentQueue.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(track)}
                  className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                    currentTrack?.id === track.id
                      ? 'bg-[#ff5500]/20 border border-[#ff5500]/40 text-white'
                      : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{track.title}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                  </div>
                  <span className="font-mono-numbers text-[10px] text-neutral-400">
                    {track.durationFormatted}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Persistent Bottom Player Dock */}
      <PlayerDock
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isLiked={currentTrack ? likedTrackIds.has(currentTrack.id) : false}
        is8DActive={is8DActive}
        orbitPan={orbitPan}
        djSpeed={djSettings.speed}
        djModeName={djSettings.modeName}
        isDJOpen={isDJOpen}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={(val) => {
          setVolume(val);
          if (isMuted) setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleRepeat={handleToggleRepeat}
        onToggleLike={handleToggleLike}
        onToggleLyrics={() => setIsLyricsOpen((prev) => !prev)}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        onToggleEqualizer={() => setIsEqualizerOpen((prev) => !prev)}
        onToggleFullscreen={() => setIsFullscreenOpen(true)}
        onToggle8D={() => setIs8DActive((prev) => !prev)}
        onToggleDJ={() => setIsDJOpen((prev) => !prev)}
        isLyricsOpen={isLyricsOpen}
        isQueueOpen={isQueueOpen}
        isEqualizerOpen={isEqualizerOpen}
      />

      {/* DJ Controls Popover */}
      <DJControlsPopover
        isOpen={isDJOpen}
        onClose={() => setIsDJOpen(false)}
        settings={djSettings}
        onChangeSettings={(newSettings) => setDjSettings(newSettings)}
      />

      {/* AURA Stats Telemetry Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        tracks={tracks}
      />

      {/* 5-Band Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        bands={eqBands}
        bassBoost={bassBoost}
        activePresetId={activePresetId}
        onBandChange={handleBandChange}
        onToggleBassBoost={handleToggleBassBoost}
        onSelectPreset={handleSelectPreset}
        onResetFlat={handleResetFlat}
      />

      {/* Fullscreen Immersive Stage */}
      <FullscreenStage
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isLiked={currentTrack ? likedTrackIds.has(currentTrack.id) : false}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={(val) => {
          setVolume(val);
          if (isMuted) setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleRepeat={handleToggleRepeat}
        onToggleLike={handleToggleLike}
      />

      {/* Synced Karaoke Lyrics Modal */}
      <SyncedLyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        currentTrack={currentTrack}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      {/* Custom Audio File Upload Modal */}
      <AudioUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onTrackUploaded={handleTrackUploaded}
      />
    </div>
  );
}
