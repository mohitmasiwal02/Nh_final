import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Card, Badge, Alert, Spinner, PageHeader, Button, inr } from '../components/ui';
import {
  FiCheckCircle, FiClock, FiXCircle, FiTag, FiCreditCard, FiChevronRight, FiShoppingBag,
} from 'react-icons/fi';

// order.status -> badge look + icon
const STATUS = {
  paid: { label: 'Confirmed', icon: FiCheckCircle, cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  pending: { label: 'Pending', icon: FiClock, cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  failed: { label: 'Failed', icon: FiXCircle, cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
};

// backend stores money in paise
const paise = (n) => inr(Number(n || 0) / 100);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load your orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your trips…" />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      <PageHeader title="My Trips" subtitle="All your bookings in one place." />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <FiShoppingBag className="text-4xl text-slate-300" />
          <p className="text-slate-500">You haven’t booked any trips yet.</p>
          <Button as={Link} to="/">Browse packages</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            // association keys as Sequelize serialises them (be tolerant of both forms)
            const pkg = o.Package || o.Packages || {};
            const coupon = o.Coupon;
            const payment = o.Payment;
            const status = STATUS[o.status] || STATUS.pending;
            const StatusIcon = status.icon;

            return (
              <Card key={o.id} className="overflow-hidden">
                {/* header row: package + status */}
                <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      to={pkg.id ? `/packages/${pkg.id}` : '#'}
                      className="group inline-flex max-w-full items-center gap-1 font-semibold text-slate-900 hover:text-brand-700"
                    >
                      <span className="truncate">{pkg.title || 'Package'}</span>
                      {pkg.id && <FiChevronRight className="shrink-0 opacity-0 transition group-hover:opacity-100" />}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Booked on {formatDate(o.createdAt || o.created_at)} · #{(o.razorpay_order_id || o.id).slice(-8)}
                    </p>
                  </div>
                  <Badge className={status.cls}>
                    <StatusIcon /> {status.label}
                  </Badge>
                </div>

                {/* amount breakdown */}
                <div className="grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Package price</p>
                    <p className="font-medium text-slate-700">{paise(o.original_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Discount</p>
                    <p className={`font-medium ${Number(o.discount_amount) > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      −{paise(o.discount_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Amount paid</p>
                    <p className="font-bold text-slate-900">{paise(o.amount)}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-400">Payment</p>
                    {payment?.razorpay_payment_id ? (
                      <p className="flex items-center gap-1 truncate font-medium text-slate-700">
                        <FiCreditCard className="shrink-0 text-brand-600" />
                        <span className="truncate">{payment.razorpay_payment_id}</span>
                      </p>
                    ) : (
                      <p className="text-slate-400">—</p>
                    )}
                  </div>
                </div>

                {/* coupon strip */}
                {coupon && (
                  <div className="flex items-center gap-2 border-t border-dashed border-slate-100 bg-emerald-50/50 px-4 py-2 text-xs text-emerald-700">
                    <FiTag />
                    Coupon <span className="font-bold">{coupon.code}</span> applied
                    {coupon.discountType === 'percentage'
                      ? ` (${Number(coupon.discountValue)}% off)`
                      : ` (${inr(coupon.discountValue)} off)`}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
