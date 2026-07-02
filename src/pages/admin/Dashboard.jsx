import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../components/ui';

const tiles = [
  { to: '/admin/packages', icon: '📦', title: 'Manage Packages', desc: 'Create, edit and delete tour packages.' },
  { to: '/admin/coupons', icon: '🎟️', title: 'Manage Coupons', desc: 'Create and delete discount coupons.' },
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Manage your packages and coupons." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="flex items-start gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">
                {t.icon}
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 group-hover:text-brand-700">{t.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{t.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
