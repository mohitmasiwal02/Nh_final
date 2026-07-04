import { useEffect, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// full-screen image viewer with next/prev navigation
// props: images: string[], index: number, onClose(), onChange(newIndex)
export default function Lightbox({ images, index, onClose, onChange }) {
  const goPrev = useCallback(
    () => onChange((index - 1 + images.length) % images.length),
    [index, images.length, onChange]
  );
  const goNext = useCallback(
    () => onChange((index + 1) % images.length),
    [index, images.length, onChange]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goPrev, goNext]);

  if (!images?.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <FiX className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
          aria-label="Previous image"
        >
          <FiChevronLeft className="h-6 w-6" />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
          aria-label="Next image"
        >
          <FiChevronRight className="h-6 w-6" />
        </button>
      )}

      {images.length > 1 && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
