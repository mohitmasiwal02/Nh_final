import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import PackageCard from '../components/PackageCard';
import OffersMarquee from '../components/OffersMarquee';
import { Alert, Spinner, MOUNTAIN_IMG } from '../components/ui';
import {
  FiSearch, FiShield, FiHeadphones, FiCreditCard, FiStar,
} from 'react-icons/fi';
import { FaHotel, FaUtensils, FaCarSide, FaMountainSun } from 'react-icons/fa6';

// Looping aerial-mountain video for the hero (poster shows until it loads / if it fails)
const HERO_VIDEO = 'https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4';
const HERO_POSTER =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80';

const FEATURES = [
  { icon: FaHotel, title: 'Stays included', text: 'Handpicked hotels & camps' },
  { icon: FaUtensils, title: 'Meals included', text: 'Breakfast & dinner covered' },
  { icon: FaCarSide, title: 'Full transport', text: 'Pickup to drop, all covered' },
  { icon: FiShield, title: 'Secure payments', text: 'Razorpay protected checkout' },
  { icon: FiHeadphones, title: '24×7 support', text: 'On-trip help, anytime' },
  { icon: FiCreditCard, title: 'Coupons & offers', text: 'Save more on every trip' },
];

// category tabs — 'home' shows every package, the rest filter by package.category
const CATEGORIES = ['home', 'wildlife', 'wellness', 'adventure', 'spirituality', 'leisure'];

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('home');

  useEffect(() => {
    api.get('/packages')
      .then((res) => setPackages(res.data.packages))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load packages'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((p) => {
      const matchesQuery =
        !q || p.title?.toLowerCase().includes(q) || p.to?.toLowerCase().includes(q);
      const matchesCategory = category === 'home' || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [packages, query, category]);

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  // Popular destinations = featured packages, deduped by their "to" location.
  const destinations = useMemo(() => {
    const seen = new Set();
    return packages
      .filter((p) => p.featured && p.to && !seen.has(p.to) && seen.add(p.to))
      .map((p) => ({ name: p.to, img: p.coverImage?.[0] || MOUNTAIN_IMG }));
  }, [packages]);

  return (
    <div>
 
  
         {/* ---- offers marquee (redBus-style square coupon tiles) ---- */}
      <OffersMarquee />
 

      {/* ---- popular destinations: featured packages, horizontal scroll on mobile ---- */}
      {destinations.length > 0 && (
      <section className="mb-8 sm:mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className=" text-lg font-bold text-slate-900 sm:text-xl">Popular destinations</h2>
          <button onClick={()=>setQuery("")} className="text-sm font-medium text-brand-600 hover:underline">Show All Packages</button>
      </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {destinations.map((d) => (
            <button
              key={d.name}
              onClick={() => setQuery(query === d.name ? '' : d.name)}
              className={`group relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl ring-2 transition sm:h-28 sm:w-40 ${
                query === d.name ? 'ring-brand-500' : 'ring-transparent'
              }`}
            >
              <img
                src={d.img}
                alt={d.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-center text-sm font-semibold text-white">
                {d.name}
              </span>
            </button>
          ))}
        </div>
      </section>
      )}

      

      {/* ---- category tabs (round pills) — 'Home' shows all packages ---- */}
      <section className="mb-8 sm:mb-10">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                category === c
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* ---- featured packages ---- */}
      {!loading && !error && featured.length > 0 && (
        <section className="mb-8 sm:mb-12">
          <div className="mb-4 flex items-center gap-2">
            <FiStar className="text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Featured trips</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </section>
      )}
  

  

      {/* ---- all packages (heading + grid together) ---- */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              All packages
            </h2>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Explore our best-selling Uttarakhand trips.
            </p>
          </div>
          {!loading && !error && (
            <span className="text-sm text-slate-400">{filtered.length} trips</span>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
            {query ? `No trips match “${query}”.` : 'No packages yet. Check back soon!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(featured.length > 0 ? rest : filtered).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>


          {/* ---- why book with us ---- */}
      {!loading && !error && (
        <section className="mb-8 mt-10 rounded-3xl bg-linear-to-br from-brand-50 to-emerald-50 p-5 ring-1 ring-brand-100 sm:mb-12 sm:p-8">
          <h2 className="mb-5 text-lg font-bold text-slate-900 sm:text-xl">Why book with us</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-brand-100">
                  <Icon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
