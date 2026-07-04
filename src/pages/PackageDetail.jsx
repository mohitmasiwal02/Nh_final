import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { bookPackage } from '../api/payment';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Label, Badge, Alert, Spinner, inr, MOUNTAIN_IMG } from '../components/ui';
import { FiClock, FiStar, FiChevronRight, FiTag, FiCheckCircle } from 'react-icons/fi';
import { FaHotel, FaUtensils } from 'react-icons/fa6';

export default function PackageDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState('');

  // coupon apply state
  const [code, setCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');

  // booking / payment state
  const [paying, setPaying] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  // raw input value — may be '' while editing; effective count defaults to 1
  const [persons, setPersons] = useState('1');

  useEffect(() => {
    api.get(`/packages/${id}`)
      .then((res) => setPkg(res.data.package))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load package'));
  }, [id]);

  const applyCoupon = async () => {
    if (!code.trim()) {
      toast.error('Enter a coupon code first.');
      return;
    }
    setCouponError('');
    setCouponResult(null);
    try {
      const count = Math.max(1, parseInt(persons, 10) || 1);
      const { data } = await api.post('/coupons/apply', { code, packageId: id, persons: count });
      setCouponResult(data);
      toast.success(`Coupon ${data.code} applied!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not apply coupon';
      setCouponError(msg);
      toast.error(msg);
    }
  };

  const handleBook = async () => {
    // must be logged in to pay — send guests to login first
    if (!user) {
      toast.error('Please log in to book this trip.');
      navigate('/login');
      return;
    }

    if (!bookingDate) {
      toast.error('Please select a date to confirm your booking.');
      return;
    }

    // empty / invalid input falls back to 1 person
    const count = Math.max(1, parseInt(persons, 10) || 1);

    setBookError('');
    setBookSuccess('');
    setPaying(true);
    try {
      const result = await bookPackage({
        user,
        packageId: id,
        couponCode: couponResult?.code,
        bookingDate,
        persons: count,
      });
      const msg = `Booking confirmed for ${count} ${count > 1 ? 'persons' : 'person'} (order ${result.order_id}).`;
      setBookSuccess(msg);
      toast.success(msg);
    } catch (err) {
      // ignore the "cancelled" case — the user simply closed the popup
      if (err.message !== 'Payment cancelled') {
        const msg = err.message || 'Payment could not be completed';
        setBookError(msg);
        toast.error(msg);
      } else {
        toast('Payment cancelled.', { icon: '⚠️' });
      }
    } finally {
      setPaying(false);
    }
  };

  if (error) return <Alert type="error">{error}</Alert>;
  if (!pkg) return <Spinner />;

  const days = Array.isArray(pkg.itinerary) ? pkg.itinerary.length : 0;
  const hasDiscount = pkg.discountedPrice != null && Number(pkg.discountedPrice) < Number(pkg.price);
  // Always show at least one on-theme mountain shot if the trip has no photos.
  const images = pkg.coverImage?.length ? pkg.coverImage : [MOUNTAIN_IMG];

  // empty field -> book for 1 person by default (but keep the input clearable)
  const personsCount = Math.max(1, parseInt(persons, 10) || 1);
  // per-head base price, then everything scales with the number of persons.
  const perPerson = Number(hasDiscount ? pkg.discountedPrice : pkg.price);
  const subtotal = perPerson * personsCount;
  // discount is already computed for the whole group (persons was sent to the API)
  const couponDiscount = couponResult ? Number(couponResult.discount) : 0;
  const payAmount = subtotal - couponDiscount;

  return (
    // extra bottom padding on mobile so the sticky book bar never covers content
    <div className="pb-24 lg:pb-0">
      {/* breadcrumb */}
      <nav className="mb-4 flex items-center text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-700">Packages</Link>
        <FiChevronRight className="mx-1 text-slate-300" />
        <span className="line-clamp-1 text-slate-700">{pkg.title}</span>
      </nav>

      {/* gallery */}
      {images.length > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
          <img
            src={images[0]}
            alt={pkg.title}
            className="col-span-4 h-56 w-full object-cover sm:col-span-2 sm:h-80 lg:col-span-2"
          />
          <div className="col-span-4 grid grid-cols-2 gap-2 sm:col-span-2">
            {images.slice(1, 5).map((url, i) => (
              <img key={i} src={url} alt={`${pkg.title} ${i + 2}`} className="h-28 w-full object-cover sm:h-[9.5rem]" />
            ))}
            {images.length === 1 && (
              <div className="col-span-2 flex items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
                More photos coming soon
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* left: content */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {pkg.featured && <Badge className="bg-amber-100 text-amber-800"><FiStar /> Featured</Badge>}
            {days > 0 && <Badge className="bg-slate-100 text-slate-600"><FiClock /> {days} Day{days > 1 ? 's' : ''}</Badge>}
            <Badge className="bg-emerald-50 text-emerald-700"><FaHotel /> Stay included</Badge>
            <Badge className="bg-sky-50 text-sky-700"><FaUtensils /> Meals included</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{pkg.title}</h1>

          <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Itinerary</h2>
          <ol className="space-y-4">
            {(pkg.itinerary || []).map((day, i) => (
              <li key={i} className="relative rounded-xl border border-slate-100 bg-white p-4 pl-5 shadow-sm">
                <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-brand-500" />
                <p className="font-semibold text-slate-900">
                  <span className="mr-2 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                    Day {day.day}
                  </span>
                  {day.title}
                </p>
                {day.description && <p className="mt-1 text-sm text-slate-600">{day.description}</p>}
                {day.activities?.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-slate-500">
                    {day.activities.map((a, j) => (
                      <li key={j} className="flex gap-2">
                        <FiCheckCircle className="mt-0.5 shrink-0 text-brand-500" /> {a}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* right: booking panel (sticky sidebar on desktop) */}
        <div className="lg:col-span-1">
          <Card className="p-5 lg:sticky lg:top-24">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {inr(perPerson)}
              </span>
              {hasDiscount && <span className="pb-1 text-slate-400 line-through">{inr(pkg.price)}</span>}
            </div>
            <p className="text-sm text-slate-400">per person · taxes included</p>

            {/* booking date + number of persons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Label>Booking date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={bookingDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Persons</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="1"
                  className="mt-1"
                  value={persons}
                  onChange={(e) => {
                    const v = e.target.value;
                    // allow clearing the field; accept only whole numbers
                    if (v === '' || /^\d+$/.test(v)) {
                      setPersons(v);
                      // discount was computed for the old headcount — make them re-apply
                      setCouponResult(null);
                      setCouponError('');
                    }
                  }}
                />
              </div>
            </div>

            {/* live price breakdown — subtotal, coupon, total */}
            <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>{inr(perPerson)} × {personsCount} {personsCount > 1 ? 'persons' : 'person'}</span>
                <span className="font-medium text-slate-700">{inr(subtotal)}</span>
              </div>
              {couponResult && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon {couponResult.code}</span>
                  <span>−{inr(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{inr(payAmount)}</span>
              </div>
            </div>

            {/* desktop book button — mobile uses the sticky bottom bar */}
            <Button
              className="mt-4 hidden w-full lg:flex"
              onClick={handleBook}
              disabled={paying}
            >
              {paying ? 'Processing…' : user ? 'Book this trip' : 'Login to book'}
            </Button>

            {bookError && <div className="mt-3"><Alert type="error">{bookError}</Alert></div>}
            {bookSuccess && <div className="mt-3"><Alert type="success">{bookSuccess}</Alert></div>}

            {/* coupon apply — requires login */}
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                <FiTag className="text-brand-600" /> Have a coupon?
              </h3>
              {user ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter code"
                    />
                    <Button variant="secondary" onClick={applyCoupon}>Apply</Button>
                  </div>
                  {couponError && <div className="mt-2"><Alert type="error">{couponError}</Alert></div>}
                  {couponResult && (
                    <div className="mt-3 space-y-1 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
                      <p className="flex justify-between"><span>Original</span><span>{inr(couponResult.originalPrice)}</span></p>
                      <p className="flex justify-between text-rose-600"><span>Discount</span><span>−{inr(couponResult.discount)}</span></p>
                      <p className="flex justify-between border-t border-emerald-200 pt-1 font-bold"><span>Final</span><span>{inr(couponResult.finalPrice)}</span></p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link> to apply a coupon.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* mobile sticky book bar — price + CTA always in reach of the thumb */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="text-lg font-bold text-slate-900">{inr(payAmount)}</p>
            <p className="text-xs text-slate-400">
              {personsCount} {personsCount > 1 ? 'persons' : 'person'}{couponResult ? ` · ${couponResult.code} applied` : ''}
            </p>
          </div>
          <Button
            className="flex-1 max-w-52"
            onClick={handleBook}
            disabled={paying}
          >
            {paying ? 'Processing…' : user ? 'Book this trip' : 'Login to book'}
          </Button>
        </div>
      </div>
    </div>
  );
}
