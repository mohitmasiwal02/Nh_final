import { Link } from "react-router-dom";
import { Card, Badge, inr, coverOf } from "./ui";
import { FiClock, FiArrowRight, FiStar, FiMapPin } from "react-icons/fi";
import { FaHotel, FaUtensils } from "react-icons/fa6";

// One card, used wherever a package is shown in a grid/list.
export default function PackageCard({ pkg }) {
  const days = Array.isArray(pkg.itinerary) ? pkg.itinerary.length : 0;
  const hasDiscount =
    pkg.discountedPrice != null &&
    Number(pkg.discountedPrice) < Number(pkg.price);
  const off = hasDiscount
    ? Math.round((1 - pkg.discountedPrice / pkg.price) * 100)
    : 0;

  return (
    <Link to={`/packages/${pkg.id}`} className="group block">
      <Card className="flex h-full flex-row overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-col">
        {/* image */}
        <div className="relative w-32 shrink-0 overflow-hidden sm:w-full rounded-[9%]">
          <img
            src={coverOf(pkg)}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105 sm:h-48"
          />
          {/* featured = diagonal corner ribbon (clipped by the image's overflow-hidden) */}
          {pkg.featured && (
            <div className="pointer-events-none absolute -left-9 top-3.5 flex w-32 -rotate-45 items-center justify-center gap-1 bg-linear-to-r from-amber-300 to-amber-500 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-md">
              <FiStar /> Featured
            </div>
          )}
          {/* discount = mirrored diagonal ribbon on the top-right corner */}
          {hasDiscount && !pkg.featured && (
            <div className="pointer-events-none absolute -left-9 top-3.5 flex w-32 -rotate-45 items-center justify-center bg-linear-to-r from-[#D84E55] to-[#b83c43] py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              {off}% OFF
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-[#D84E55]">
            {pkg.title}
          </h3>

          {(pkg.from || pkg.to) && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <FiMapPin className="shrink-0 text-[#D84E55]" />
              <span className="line-clamp-1">
                {pkg.from}
                {pkg.from && pkg.to && (
                  <FiArrowRight className="mx-1 inline text-slate-400" />
                )}
                {pkg.to}
              </span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {days > 0 && (
              <Badge className="bg-slate-100 text-slate-600">
                <FiClock /> {days} Day{days > 1 ? "s" : ""}
              </Badge>
            )}
            <Badge className="bg-emerald-50 text-emerald-700">
              <FaHotel /> Stay
            </Badge>
            <Badge className="bg-sky-50 text-sky-700">
              <FaUtensils /> Meals
            </Badge>
            {hasDiscount && (
              <Badge className="bg-[#D84E55]/10 text-[#D84E55]">
                {off}% OFF
              </Badge>
            )}
          </div>

          {/* price row — separated with a hairline like redBus fare rows */}
          <div className="mt-auto flex items-end justify-between border-t border-dashed border-slate-100 pt-3 sm:pt-4">
            <div className="leading-tight">
              <span className="text-lg font-bold text-slate-900">
                {inr(hasDiscount ? pkg.discountedPrice : pkg.price)}
              </span>
              {hasDiscount && (
                <span className="ml-1 text-sm text-slate-400 line-through">
                  {inr(pkg.price)}
                </span>
              )}
              <p className="text-xs text-slate-400"> {pkg.iscouple ? 'per couple' : 'per person'}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#D84E55]/10 px-2.5 py-1 text-sm font-semibold text-[#D84E55] transition group-hover:bg-[#D84E55] group-hover:text-white">
              View <FiArrowRight />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
