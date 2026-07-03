import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { bookPackage } from '../api/payment';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Badge, Alert, Spinner, inr, MOUNTAIN_IMG } from '../components/ui';
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

  useEffect(() => {
    api.get(`/packages/${id}`)
      .then((res) => setPkg(res.data.package))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load package'));
  }, [id]);

  const applyCoupon = async () => {
    setCouponError('');
    setCouponResult(null);
    try {
      const { data } = await api.post('/coupons/apply', { code, packageId: id });
      setCouponResult(data);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Could not apply coupon');
    }
  };

  const handleBook = async () => {
    // must be logged in to pay — send guests to login first
    if (!user) {
      navigate('/login');
      return;
    }

    setBookError('');
    setBookSuccess('');
    setPaying(true);
    try {
      const result = await bookPackage({
        user,
        packageId: id,
        // only pass a coupon that was successfully applied above
        couponCode: couponResult?.code,
      });
      setBookSuccess(`Payment successful! Your booking is confirmed (order ${result.order_id}).`);
    } catch (err) {
      // ignore the "cancelled" case — the user simply closed the popup
      if (err.message !== 'Payment cancelled') {
        setBookError(err.message || 'Payment could not be completed');
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
  const payAmount = couponResult
    ? couponResult.finalPrice
    : hasDiscount ? pkg.discountedPrice : pkg.price;

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
                {inr(hasDiscount ? pkg.discountedPrice : pkg.price)}
              </span>
              {hasDiscount && <span className="pb-1 text-slate-400 line-through">{inr(pkg.price)}</span>}
            </div>
            <p className="text-sm text-slate-400">per person · taxes included</p>

            {couponResult && (
              <p className="mt-2 text-sm font-medium text-emerald-700">
                You pay {inr(couponResult.finalPrice)} after coupon {couponResult.code}
              </p>
            )}

            {/* desktop book button — mobile uses the sticky bottom bar */}
            <Button className="mt-4 hidden w-full lg:flex" onClick={handleBook} disabled={paying}>
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
              per person{couponResult ? ` · ${couponResult.code} applied` : ''}
            </p>
          </div>
          <Button className="flex-1 max-w-52" onClick={handleBook} disabled={paying}>
            {paying ? 'Processing…' : user ? 'Book this trip' : 'Login to book'}
          </Button>
        </div>
      </div>
    </div>
  );
}
