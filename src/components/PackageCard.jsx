import { Link } from 'react-router-dom';
import { Card, Badge, inr, coverOf } from './ui';
import { FiClock, FiArrowRight, FiStar, FiMapPin } from 'react-icons/fi';
import { FaHotel, FaUtensils } from 'react-icons/fa6';

// One card, used wherever a package is shown in a grid/list.
export default function PackageCard({ pkg }) {
  const days = Array.isArray(pkg.itinerary) ? pkg.itinerary.length : 0;
  const hasDiscount =
    pkg.discountedPrice != null && Number(pkg.discountedPrice) < Number(pkg.price);
  const off = hasDiscount ? Math.round((1 - pkg.discountedPrice / pkg.price) * 100) : 0;

  return (
    <Link to={`/packages/${pkg.id}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        {/* image */}
        <div className="relative overflow-hidden">
          <img
            src={coverOf(pkg)}
            alt={pkg.title}
            loading="lazy"
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {pkg.featured && (
            <Badge className="absolute left-3 top-3 bg-amber-400 text-amber-950 shadow">
              <FiStar /> Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="absolute right-3 top-3 bg-rose-600 text-white shadow">{off}% OFF</Badge>
          )}
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-brand-700">
            {pkg.title}
          </h3>

          {(pkg.from || pkg.to) && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <FiMapPin className="shrink-0 text-brand-500" />
              <span className="line-clamp-1">
                {pkg.from}
                {pkg.from && pkg.to && <FiArrowRight className="mx-1 inline text-slate-400" />}
                {pkg.to}
              </span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {days > 0 && (
              <Badge className="bg-slate-100 text-slate-600">
                <FiClock /> {days} Day{days > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge className="bg-emerald-50 text-emerald-700"><FaHotel /> Stay</Badge>
            <Badge className="bg-sky-50 text-sky-700"><FaUtensils /> Meals</Badge>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4">
            <div className="leading-tight">
              <span className="text-lg font-bold text-slate-900">
                {inr(hasDiscount ? pkg.discountedPrice : pkg.price)}
              </span>
              {hasDiscount && (
                <span className="ml-1 text-sm text-slate-400 line-through">{inr(pkg.price)}</span>
              )}
              <p className="text-xs text-slate-400">per person</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:translate-x-0.5">
              View <FiArrowRight />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
