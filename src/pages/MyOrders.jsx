import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { retryPayment } from '../api/payment';
import { useAuth } from '../hooks/useAuth';
import { Card, Badge, Alert, Spinner, PageHeader, Button, inr } from '../components/ui';
import {
  FiCheckCircle, FiClock, FiXCircle, FiTag, FiCreditCard, FiChevronRight, FiShoppingBag,
  FiDownload, FiCalendar, FiUsers, FiRotateCcw,
} from 'react-icons/fi';

// order.status -> badge look + icon
const STATUS = {
  paid: { label: 'Confirmed', icon: FiCheckCircle, cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  pending: { label: 'Pending', icon: FiClock, cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  failed: { label: 'Failed', icon: FiXCircle, cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
  refunded: { label: 'Refunded', icon: FiCheckCircle, cls: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
};

// backend stores money in paise
const paise = (n) => inr(Number(n || 0) / 100);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// days between today and the trip date, counting only whole calendar days
const daysUntil = (d) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - start) / 86400000);
};

// short human label for the countdown pill
const countdownLabel = (days) => {
  if (days > 1) return `${days} days left`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  return 'Trip completed';
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // id of the order whose receipt is currently downloading
  const [downloading, setDownloading] = useState(null);
  // id of the order currently being (re)paid
  const [paying, setPaying] = useState(null);

  // fetch the PDF as a blob (the auth header goes along via the api instance),
  // then trigger a "save as" through a temporary object URL
  const downloadReceipt = async (orderId, receiptNo) => {
    setError('');
    setDownloading(orderId);
    try {
      const res = await api.get(`/orders/${orderId}/receipt`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptNo || orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // error responses also arrive as blobs — decode to show the real message
      let message = 'Could not download the receipt';
      try {
        message = JSON.parse(await err.response.data.text()).error || message;
      } catch { /* keep fallback */ }
      setError(message);
      toast.error(message);
    } finally {
      setDownloading(null);
    }
  };

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load your orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your trips…" />;
  if (error) return <Alert type="error">{error}</Alert>;



  // retry an existing pending/failed order — reuses the same Order row server-side
  const payNow = async (orderId) => {
    setError('');
    setPaying(orderId);
    try {
      await retryPayment({ user, orderId });
      // refresh so the just-paid order flips to "Confirmed"
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
      toast.success('Payment successful — your trip is confirmed!');
    } catch (err) {
      // ignore the "cancelled" case — the user simply closed the popup
      if (err.message !== 'Payment cancelled') {
        const msg = err.message || 'Payment could not be completed';
        setError(msg);
        toast.error(msg);
      } else {
        toast('Payment cancelled.', { icon: '⚠️' });
      }
    } finally {
      setPaying(null);
    }
  };

  const cancelTrip = async (orderId) => {
    setError('');
    try {
      await api.get(`/refundOrder/${orderId}`);
      // refresh so the "Trip Cancelled" stamp shows
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
      toast.success('Trip cancelled and refund initiated.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel the trip';
      setError(msg);
      toast.error(msg);
    }
  };


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
            const pkg = o.Package || o.Packages || {};
            const coupon = o.Coupon;
            const payment = o.Payment;
            const statusInfo = STATUS[o.status] || STATUS.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={o.id} className="relative overflow-hidden ring-1 ring-slate-100">
                {/* rubber-stamp for cancelled/refunded trips */}
                {o.status === 'refunded' && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <div className="-rotate-12 select-none rounded-md border-4 border-rose-500/60 px-3 py-1 text-base font-extrabold uppercase tracking-widest text-rose-500/70 sm:text-lg">
                      Trip Cancelled
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 bg-linear-to-r from-brand-50/60 to-slate-50 p-4">
                  <div className="min-w-0">
                    <Link
                      to={pkg.id ? `/packages/${pkg.id}` : '#'}
                      className="group inline-flex max-w-full items-center gap-1 font-semibold text-slate-900 hover:text-brand-700"
                    >
                      <span className="truncate">{pkg.title || 'Package'}</span>
                      {pkg.id && <FiChevronRight className="shrink-0 opacity-0 transition group-hover:opacity-100" />}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-400">
                      #{(o.razorpay_order_id || o.id).slice(-8)} · booked {formatDate(o.createdAt || o.created_at)}
                    </p>
                  </div>
                  <Badge className={`shrink-0 ${statusInfo.cls}`}>
                    <StatusIcon /> {statusInfo.label}
                  </Badge>
                </div>
              
                {o.status === 'paid' && o.bookingDate && (() => {
                  const days = daysUntil(o.bookingDate);
                  const upcoming = days >= 0;
                  return (
                    <div className="flex items-center gap-2.5 border-t border-amber-100 bg-amber-50 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <FiCalendar />
                      </span>
                      <div className="min-w-0 text-sm leading-tight">
                        <p className="font-semibold text-amber-900">Trip date · {formatDate(o.bookingDate)}</p>
                        <p className="text-xs text-amber-700/90">
                          {upcoming ? 'Please reach the venue on time 🙂' : 'Hope you had a great trip! 🎉'}
                        </p>
                      </div>
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          upcoming ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {countdownLabel(days)}
                      </span>
                    </div>
                  );
                })()}

                {/* price summary — itemised rows read cleanly on narrow screens */}
                <div className="space-y-2 p-4 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <FiUsers className="text-slate-400" />
                      {o.persons > 1
                        ? `${paise(o.original_amount / o.persons)} × ${o.persons} persons`
                        : 'Package price'}
                    </span>
                    <span className="font-medium text-slate-700">{paise(o.original_amount)}</span>
                  </div>
                  {Number(o.discount_amount) > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <FiTag className="text-emerald-500" />
                        Discount
                        {coupon && <span className="font-semibold text-emerald-600">· {coupon.code}</span>}
                      </span>
                      <span className="font-medium text-emerald-600">−{paise(o.discount_amount)}</span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5">
                    <span className="font-semibold text-slate-900">Amount paid</span>
                    <span className="text-base font-bold text-slate-900">{paise(o.amount)}</span>
                  </div>
                  {payment?.razorpay_payment_id && (
                    <p className="flex items-center gap-1.5 truncate pt-1 text-xs text-slate-400">
                      <FiCreditCard className="shrink-0" />
                      <span className="truncate">Paid via {payment.razorpay_payment_id}</span>
                    </p>
                  )}
                  {payment?.refund_amount > 0 && (
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <FiRotateCcw className="shrink-0" />
                        Refunded
                        {payment.refunded_at && (
                          <span className="font-normal text-emerald-600/80">on {formatDate(payment.refunded_at)}</span>
                        )}
                      </span>
                      <span className="font-bold">{paise(payment.refund_amount)}</span>
                    </div>
                  )}
                </div>

                {/* receipt / cancel — paid orders only */}
                {o.status === 'paid' && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:justify-end">
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={() => downloadReceipt(o.id, o.razorpay_order_id)}
                      disabled={downloading === o.id}
                    >
                      <FiDownload />
                      {downloading === o.id ? 'Preparing…' : 'Download receipt'}
                    </Button>

                    <Button variant="danger" className="w-full sm:w-auto" onClick={() => cancelTrip(o.id)}>
                      Cancel Trip
                    </Button>
                  </div>
                )}

                {/* pending / failed — let the user complete the payment */}
                {(o.status === 'pending' || o.status === 'failed') && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      {o.status === 'failed'
                        ? 'Payment failed — you can try again.'
                        : 'Payment pending — complete it to confirm your trip.'}
                    </p>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => payNow(o.id)}
                      disabled={paying === o.id}
                    >
                      <FiCreditCard />
                      {paying === o.id ? 'Processing…' : 'Pay now'}
                    </Button>
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
