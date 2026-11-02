import { ThemeConfig, ThemeColor } from '../types/music';

export const THEME_CONFIGS: Record<ThemeColor, ThemeConfig> = {
  orange: {
    id: 'orange',
    name: 'Naranja Fósforo (Cyberpunk)',
    hex: '#ff5500',
    glow: 'rgba(255, 85, 0, 0.45)',
    border: 'rgba(255, 85, 0, 0.25)',
    bgRgba: 'rgba(255, 85, 0, 0.12)',
  },
  cyan: {
    id: 'cyan',
    name: 'Cian Tokio (Ghost in the Shell)',
    hex: '#00f2ff',
    glow: 'rgba(0, 242, 255, 0.45)',
    border: 'rgba(0, 242, 255, 0.25)',
    bgRgba: 'rgba(0, 242, 255, 0.12)',
  },
  green: {
    id: 'green',
    name: 'Verde Ácido (Arcade Matrix)',
    hex: '#39ff14',
    glow: 'rgba(57, 255, 20, 0.45)',
    border: 'rgba(57, 255, 20, 0.25)',
    bgRgba: 'rgba(57, 255, 20, 0.12)',
  },
  magenta: {
    id: 'magenta',
    name: 'Magenta Sunset (Outrun 80s)',
    hex: '#ff007f',
    glow: 'rgba(255, 0, 127, 0.45)',
    border: 'rgba(255, 0, 127, 0.25)',
    bgRgba: 'rgba(255, 0, 127, 0.12)',
  },
};

export const applyThemeToDocument = (themeColor: ThemeColor) => {
  const config = THEME_CONFIGS[themeColor];
  if (!config) return;

  const root = document.documentElement;
  root.style.setProperty('--neon-orange', config.hex);
  root.style.setProperty('--neon-orange-bright', config.hex);
  root.style.setProperty('--neon-glow', config.glow);
  root.style.setProperty('--glass-border', config.border);
};
