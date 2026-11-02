import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0a0a12] border border-[#ff5500]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,85,0,0.25)]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5 text-white font-semibold">
            <FolderPlus className="w-5 h-5 text-[#ff5500]" />
            <span>Crear Nueva Lista de Reproducción</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Nombre de la Lista
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Anime Battles, Chiptune Beats..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] text-white text-sm outline-none transition-all placeholder:text-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción temática o estado de ánimo..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] text-white text-sm outline-none transition-all placeholder:text-neutral-600 resize-none"
            />
          </div>

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
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold text-black bg-[#ff5500] hover:bg-[#ff6e00] rounded-lg transition-all shadow-[0_0_15px_rgba(255,85,0,0.4)] disabled:opacity-40 disabled:pointer-events-none"
            >
              Guardar Lista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
