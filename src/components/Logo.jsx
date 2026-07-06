import { GiHawkEmblem } from 'react-icons/gi';
import logo from '../assets/Logo.png';
 
export default function Logo({ size = 'text-lg', icon = 'text-2xl' }) {
  return (
    <span className={`flex items-center gap-2 font-bold text-slate-900 ${size}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white shadow-sm">
        <img  className="h-full w-full object-cover rounded-full" src={logo} alt="Brand Logo" />
      </span>
      <span className="leading-none">
        Northern <span className="text-brand-600">Harrier</span>
      </span>
    </span>
  );
}
