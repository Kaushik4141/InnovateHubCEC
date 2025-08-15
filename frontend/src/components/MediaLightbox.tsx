import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type LightboxMedia = { type: 'image'|'video'; url: string };

interface Props {
  open: boolean;
  media: LightboxMedia | null;
  onClose: () => void;
}

const MediaLightbox: React.FC<Props> = ({ open, media, onClose }) => {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !media) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-100 transition-opacity" onClick={onClose} />
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-7 w-7" />
        </button>
        <div className="max-w-6xl max-h-[85vh] w-full flex items-center justify-center">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt="media"
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl transition-transform duration-200 ease-out"
            />
          ) : (
            <video
              src={media.url}
              controls
              autoPlay
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl transition-transform duration-200 ease-out"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLightbox;
