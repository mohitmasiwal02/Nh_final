import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { inr } from './ui';
import { FiTag } from 'react-icons/fi';

// big label for the discount, e.g. "15% OFF" or "₹500 OFF"
const offerLabel = (c) =>
  c.discountType === 'percentage'
    ? `${Number(c.discountValue)}% OFF`
    : `${inr(c.discountValue)} OFF`;

// which packages an offer applies to
const offerScope = (c) => {
  const pkgs = c.packages || [];
  if (c.scope === 'all' || pkgs.length === 0) return 'On all trips';
  if (pkgs.length === 1) return `On ${pkgs[0].title}`;
  return `On ${pkgs[0].title} & ${pkgs.length - 1} more`;
};

// keep only offers that are active and currently within their valid window
const isLive = (c) => {
  if (!c.isActive) return false;
  const now = Date.now();
  if (c.validFrom && new Date(c.validFrom).getTime() > now) return false;
  if (c.validTo && new Date(c.validTo).getTime() < now) return false;
  return true;
};

// soft light palettes
const PALETTES = [
  {
    bg: 'from-rose-50 to-rose-100',
    text: 'text-rose-900',
    accent: 'text-rose-500',
    blob: 'bg-rose-200/50',
    chip: 'border-rose-300 text-rose-700',
  },
  {
    bg: 'from-amber-50 to-amber-100',
    text: 'text-amber-900',
    accent: 'text-amber-500',
    blob: 'bg-amber-200/50',
    chip: 'border-amber-300 text-amber-700',
  },
  {
    bg: 'from-emerald-50 to-emerald-100',
    text: 'text-emerald-900',
    accent: 'text-emerald-500',
    blob: 'bg-emerald-200/50',
    chip: 'border-emerald-300 text-emerald-700',
  },
  {
    bg: 'from-sky-50 to-sky-100',
    text: 'text-sky-900',
    accent: 'text-sky-500',
    blob: 'bg-sky-200/50',
    chip: 'border-sky-300 text-sky-700',
  },
  {
    bg: 'from-violet-50 to-violet-100',
    text: 'text-violet-900',
    accent: 'text-violet-500',
    blob: 'bg-violet-200/50',
    chip: 'border-violet-300 text-violet-700',
  },
  {
    bg: 'from-teal-50 to-teal-100',
    text: 'text-teal-900',
    accent: 'text-teal-500',
    blob: 'bg-teal-200/50',
    chip: 'border-teal-300 text-teal-700',
  },
];

// Offer Card
function OfferCard({ c, palette ,isfirst}) {
  const pkgs = c.packages || [];
  const to =
    c.scope === 'specific' && pkgs.length === 1
      ? `/packages/${pkgs[0].id}`
      : null;

  const inner = (
    <div
      className={`offer-ring relative flex h-44 w-44 shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br ${palette.bg} p-4 ${palette.text} shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:scale-105 sm:h-48 sm:w-48`}
    >
    {isfirst && (
    <div className="absolute -right-9 top-4 z-20 w-32 rotate-45 bg-rose-600 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
    new user
    </div>
  )}
      {/* Decorative circles */}
      <span
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full ${palette.blob}`}
      />
      <span
        className={`pointer-events-none absolute -bottom-8 -left-4 h-16 w-16 rounded-full ${palette.blob}`}
      />

      {/* Offer label */}
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${palette.accent}`}
      >
        <FiTag />
        Offer 
      </div>

      {/* Discount */}
      <div className="relative">
        <p className="text-2xl font-extrabold leading-none sm:text-3xl">
          {offerLabel(c)}
        </p>

        <p className="mt-1 line-clamp-2 text-xs opacity-70">
          {offerScope(c)}
        </p>
      </div>

      {/* Coupon code */}
      <div
        className={`relative rounded-lg border border-dashed bg-white/60 px-2 py-1 text-center text-sm font-bold tracking-widest ${palette.chip}`}
      >
        {c.code} 
      </div>
      
    </div>
  );

  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function OffersMarquee() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api
      .get('/coupons')
      .then((res) => setOffers((res.data.coupons || []).filter(isLive)))
      .catch(() => setOffers([]));
  }, []);

  if (offers.length === 0) return null;

  return (
    <>
     <style>{`
  @keyframes offerRing {
    0%, 90%, 100% {
      transform: translateX(0) rotate(0deg);
    }

    91% {
      transform: translateX(-2px) rotate(-5deg);
    }

    93% {
      transform: translateX(2px) rotate(5deg);
    }

    95% {
      transform: translateX(-1.5px) rotate(-0.8deg);
    }

    97% {
      transform: translateX(1.5px) rotate(0.8deg);
    }

    99% {
      transform: translateX(0) rotate(0deg);
    }
  }

  .offer-ring {
    animation: offerRing 5.5s ease-in-out infinite;
    transform-origin: center;
    will-change: transform;
  }

  .offer-ring:hover {
    animation-play-state: paused;
  }
`}</style>

      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
          <FiTag className="text-[#D84E55]" />
          Offers for you
        </h2>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {offers.map((c, i) => (
            <OfferCard
              key={c.id}
              c={c}
              isfirst={c.firstTimeUserOnly || false}
              palette={PALETTES[i % PALETTES.length]}
            />
          ))}
        </div>
      </section>
    </>
  );
}