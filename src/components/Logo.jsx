import { GiHawkEmblem } from 'react-icons/gi';

// Brand logo — the northern harrier is a hawk, hence the emblem.
// Used in the navbar, footer and anywhere else the brand appears.
export default function Logo({ size = 'text-lg', icon = 'text-2xl' }) {
  return (
    <span className={`flex items-center gap-2 font-bold text-slate-900 ${size}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <GiHawkEmblem className={icon} />
      </span>
      <span className="leading-none">
        Northern <span className="text-brand-600">Harrier</span>
      </span>
    </span>
  );
}
