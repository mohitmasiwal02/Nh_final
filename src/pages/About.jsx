import { Link } from 'react-router-dom';
import { PageHeader, Card, Button } from '../components/ui';
import {
  FiMap, FiHeart, FiShield, FiUsers, FiAward, FiCompass, FiArrowRight,
} from 'react-icons/fi';

const STATS = [
  { value: '5,000+', label: 'Happy travellers' },
  { value: '120+', label: 'Curated trips' },
  { value: '15+', label: 'Destinations' },
  { value: '4.9★', label: 'Average rating' },
];

const VALUES = [
  { icon: FiCompass, title: 'Handpicked journeys', text: 'Every stay, route and experience is scouted by our team before it reaches you.' },
  { icon: FiShield, title: 'Travel with trust', text: 'Secure payments, transparent pricing and 24×7 on-trip support you can rely on.' },
  { icon: FiHeart, title: 'Made with care', text: 'Small-group trips designed around comfort, local culture and unhurried moments.' },
  { icon: FiUsers, title: 'People first', text: 'From your first query to the ride home, real humans look after every detail.' },
];

export default function About() {
  return (
    <div>
      <PageHeader title="About Us" subtitle="Who we are and why we love putting trips together." />

      {/* hero */}
      <Card className="relative mb-8 overflow-hidden border-brand-100 bg-linear-to-br from-brand-50 via-emerald-50 to-teal-50 p-6 sm:p-10">
        <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-200/40" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-teal-200/40" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            <FiMap /> Northern Harrier
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            We turn the Himalayas into your best story yet.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Northern Harrier began with a simple idea — that a great trip should feel effortless.
            We handle the routes, the stays and the little details, so all you have to do is show up
            and soak in the mountains. From lakeside mornings in Nainital to quiet ridgeline sunsets,
            we craft journeys that stay with you long after you're home.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to="/">
              <FiMap /> Explore trips
            </Button>
            <Button as={Link} to="/gallery" variant="secondary">
              View gallery <FiArrowRight />
            </Button>
          </div>
        </div>
      </Card>

      {/* stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label} className="border-slate-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-brand-700 sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* values */}
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
        <FiAward className="text-brand-600" /> What we stand for
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="flex gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="text-xl" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* closing CTA */}
      <Card className="mt-8 flex flex-col items-center gap-4 border-brand-100 bg-brand-50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Ready for your next escape?</h3>
          <p className="mt-1 text-sm text-slate-600">Browse our latest curated trips and find your mountain.</p>
        </div>
        <Button as={Link} to="/" className="shrink-0">
          <FiMap /> See all packages
        </Button>
      </Card>
    </div>
  );
}
