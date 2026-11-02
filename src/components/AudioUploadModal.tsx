import React, { useState } from 'react';
import { X, UploadCloud, Music, CheckCircle } from 'lucide-react';
import { Track } from '../types/music';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackUploaded: (track: Track) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  onTrackUploaded,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genreLabel, setGenreLabel] = useState('Personal / Geek');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio válido (MP3, WAV, OGG, FLAC).');
      return;
    }

    setFileName(file.name);
    // Guess title from filename without extension
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanTitle);
    setArtist('Pista Local');

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    // Read duration
    const tempAudio = new Audio(objectUrl);
    tempAudio.addEventListener('loadedmetadata', () => {
      setDuration(Math.round(tempAudio.duration) || 240);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl || !title.trim()) return;

    const m = Math.floor(duration / 60);
    const s = Math.floor(duration % 60);
    const durationFormatted = `${m}:${s < 10 ? '0' : ''}${s}`;

    const newTrack: Track = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || 'Artista Desconocido',
      album: 'Subidas del Usuario',
      genre: 'all',
      genreLabel: genreLabel,
      duration: duration || 240,
      durationFormatted: durationFormatted || '4:00',
      audioUrl: audioUrl,
      coverUrl: '/covers/cover_anime_cyberpunk.jpg',
      bpm: 128,
      year: new Date().getFullYear(),
      bitrate: '320 kbps (Lossless)',
      lyrics: [
        { time: 0, text: `♪ [Reproduciendo archivo de audio: ${title}] ♪` },
        { time: 10, text: 'Visualizador reactivo en tiempo real conectado.' },
        { time: 30, text: 'Disfruta de la inmersión sónica neón.' }
      ]
    };

    onTrackUploaded(newTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0a0a12] border border-[#ff5500]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,85,0,0.25)]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5 text-white font-semibold">
            <UploadCloud className="w-5 h-5 text-[#ff5500]" />
            <span>Subir y Reproducir Pista Propia</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Drag & drop dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-[#ff5500] bg-[#ff5500]/10'
                : audioUrl
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-neutral-700 hover:border-[#ff5500]/50 bg-neutral-900/50'
            }`}
            onClick={() => document.getElementById('audio-file-input')?.click()}
          >
            <input
              id="audio-file-input"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {audioUrl ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-white truncate max-w-xs">{fileName}</p>
                <p className="text-xs text-neutral-400 mt-1">Listo para reproducir con el visualizador</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Music className="w-8 h-8 text-[#ff5500] mb-2 animate-bounce" />
                <p className="text-sm font-medium text-white">Arrastra tu archivo de audio aquí</p>
                <p className="text-xs text-neutral-400 mt-1">o haz clic para examinar (MP3, WAV, FLAC, OGG)</p>
              </div>
            )}
          </div>

          {audioUrl && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Título de la Canción
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-[#ff5500] text-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Artista
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ej: Anime Cover, Mi Banda..."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-[#ff5500] text-white text-sm outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!audioUrl}
              className="px-5 py-2 text-xs font-semibold text-black bg-[#ff5500] hover:bg-[#ff6e00] rounded-lg transition-all shadow-[0_0_15px_rgba(255,85,0,0.4)] disabled:opacity-40 disabled:pointer-events-none"
            >
              Cargar y Reproducir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
