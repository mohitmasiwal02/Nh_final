import { useEffect, useState } from 'react';
import { Card, MOUNTAIN_IMG } from './ui';
import { FiCamera, FiArrowUpRight } from 'react-icons/fi';

// soft light palettes — pastel bg, defined darker border + soft blobs
const PALETTES = [
  { grad: 'from-rose-50 to-rose-100/70', border: 'border-rose-300', hover: 'group-hover:text-rose-600', badge: 'bg-rose-500', chip: 'bg-rose-500/90', dot: 'bg-rose-500', glow: 'group-hover:shadow-rose-200/60', blob: 'bg-rose-200/50' },
  { grad: 'from-amber-50 to-orange-100/70', border: 'border-amber-300', hover: 'group-hover:text-amber-600', badge: 'bg-amber-500', chip: 'bg-amber-500/90', dot: 'bg-amber-500', glow: 'group-hover:shadow-amber-200/60', blob: 'bg-amber-200/50' },
  { grad: 'from-emerald-50 to-teal-100/70', border: 'border-emerald-300', hover: 'group-hover:text-emerald-600', badge: 'bg-emerald-500', chip: 'bg-emerald-500/90', dot: 'bg-emerald-500', glow: 'group-hover:shadow-emerald-200/60', blob: 'bg-emerald-200/50' },
  { grad: 'from-sky-50 to-blue-100/70', border: 'border-sky-300', hover: 'group-hover:text-sky-600', badge: 'bg-sky-500', chip: 'bg-sky-500/90', dot: 'bg-sky-500', glow: 'group-hover:shadow-sky-200/60', blob: 'bg-sky-200/50' },
  { grad: 'from-violet-50 to-fuchsia-100/70', border: 'border-violet-300', hover: 'group-hover:text-violet-600', badge: 'bg-violet-500', chip: 'bg-violet-500/90', dot: 'bg-violet-500', glow: 'group-hover:shadow-violet-200/60', blob: 'bg-violet-200/50' },
  { grad: 'from-teal-50 to-emerald-100/70', border: 'border-teal-300', hover: 'group-hover:text-teal-600', badge: 'bg-teal-500', chip: 'bg-teal-500/90', dot: 'bg-teal-500', glow: 'group-hover:shadow-teal-200/60', blob: 'bg-teal-200/50' },
];

// one catalog: auto-swipes through its images every few seconds;
// clicking opens the full lightbox (handled by the parent) at the current image
export default function GalleryCatalogCard({ catalog, onOpen, index = 0 }) {
  const images = catalog.images?.length ? catalog.images : [MOUNTAIN_IMG];
  const [active, setActive] = useState(0);
  const palette = PALETTES[index % PALETTES.length];
  // subtle alternating tilt so the grid feels hand-placed / funky
  const tilt = index % 2 === 0 ? '-rotate-1' : 'rotate-1';

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <Card
      className={`group relative ${tilt} cursor-pointer overflow-hidden rounded-[1.75rem] border-2 ${palette.border} bg-linear-to-br ${palette.grad} p-2 shadow-sm ring-0 transition-all duration-300 hover:rotate-0 hover:-translate-y-1.5 hover:shadow-lg ${palette.glow}`}
      onClick={() => onOpen(active)}
    >
      {/* soft decorative blobs, like the coupon offer tiles */}
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${palette.blob}`} />
      <span className={`pointer-events-none absolute -bottom-10 -left-6 h-20 w-20 rounded-full ${palette.blob}`} />

      <div className="relative h-52 w-full overflow-hidden rounded-[1.4rem] bg-slate-100">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={catalog.heading}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-110 ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* gentle bottom gradient so the dots/chip always read */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

        {/* funky rotating camera sticker */}
        <span className={`absolute -right-1 -top-1 flex h-11 w-11 rotate-6 items-center justify-center rounded-2xl ${palette.badge} text-white shadow-lg ring-2 ring-white transition-transform group-hover:animate-wiggle`}>
          <FiCamera className="text-lg" />
        </span>

        {/* photo count chip */}
        <span className={`absolute left-2.5 top-2.5 rounded-full ${palette.chip} px-2.5 py-0.5 text-xs font-bold text-white shadow-sm`}>
          {images.length} pics
        </span>

        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? `w-5 ${palette.dot}` : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-between gap-2 px-2.5 pb-1.5 pt-3">
        <div className="min-w-0">
          <h3 className={`truncate font-display text-lg font-semibold tracking-wide text-slate-900 transition-colors ${palette.hover}`}>
            {catalog.heading}
          </h3>
          {catalog.description && (
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-500">{catalog.description}</p>
          )}
        </div>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${palette.badge} text-white opacity-0 transition-all duration-300 group-hover:opacity-100`}>
          <FiArrowUpRight />
        </span>
      </div>
    </Card>
  );
}
