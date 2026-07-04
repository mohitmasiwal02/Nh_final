import { useEffect, useState } from 'react';
import { Card, MOUNTAIN_IMG } from './ui';
import { FiImage } from 'react-icons/fi';

// one catalog: auto-swipes through its images every few seconds;
// clicking opens the full lightbox (handled by the parent) at the current image
export default function GalleryCatalogCard({ catalog, onOpen }) {
  const images = catalog.images?.length ? catalog.images : [MOUNTAIN_IMG];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onOpen(active)}
    >
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={catalog.heading}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === active ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
          <FiImage /> {images.length}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{catalog.heading}</h3>
        {catalog.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{catalog.description}</p>
        )}
      </div>
    </Card>
  );
}
