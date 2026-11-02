export type Genre =
  | 'all'
  | 'anime'
  | 'gaming'
  | 'synthwave'
  | 'rock'
  | 'lofi'
  | 'phonk'
  | 'edm'
  | 'epic';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: Genre;
  genreLabel: string;
  duration: number; // in seconds
  durationFormatted: string;
  audioUrl: string;
  coverUrl: string;
  bpm: number;
  year: number;
  lyrics: LyricLine[];
  description?: string;
  bitrate?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  coverUrl?: string;
  createdAt: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type EqualizerBands = [number, number, number, number, number]; // [60Hz, 250Hz, 1kHz, 4kHz, 12kHz] in dB

export interface EqualizerPreset {
  id: string;
  name: string;
  bands: EqualizerBands;
  bassBoost: boolean;
}

export type ThemeColor = 'orange' | 'cyan' | 'green' | 'magenta';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  hex: string;
  glow: string;
  border: string;
  bgRgba: string;
}

export interface DJSettings {
  crossfadeDuration: number; // in seconds (0 to 10)
  speed: number; // 0.85, 1.0, 1.25, 1.5
  modeName: 'Normal' | 'Nightcore' | 'Vaporwave' | 'Hyper';
  preservePitch: boolean;
}

export interface ListeningStats {
  sessionSeconds: number;
  tracksPlayed: number;
  genreCounts: Record<string, number>;
  trackPlayCounts: Record<string, number>;
}
