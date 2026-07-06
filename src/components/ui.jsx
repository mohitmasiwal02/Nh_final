// Shared UI primitives — import these everywhere so the whole app stays consistent.

// ---- Button ---------------------------------------------------------------
const buttonVariants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

// small inline spinner shown inside a Button while `loading`
function ButtonSpinner() {
  return (
    <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

export function Button({
  as: Comp = 'button',
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';
  return (
    <Comp className={`${base} ${buttonVariants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <ButtonSpinner />}
      {children}
    </Comp>
  );
}

// ---- Card -----------------------------------------------------------------
export function Card({ className = '', ...props }) {
  return <div className={`  rounded-2xl border border-green-500 shadow-sm ring-1 ring-slate-100 ${className}`} {...props} />;
}

// ---- Page header ----------------------------------------------------------
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ---- Form fields ----------------------------------------------------------
const fieldBase =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

export function Input({ className = '', ...props }) {
  return <input className={`${fieldBase} ${className}`} {...props} />;
}
export function Textarea({ className = '', ...props }) {
  return <textarea className={`${fieldBase} ${className}`} {...props} />;
}
export function Select({ className = '', ...props }) {
  return <select className={`${fieldBase} ${className}`} {...props} />;
}

export function Label({ children, className = '' }) {
  return <label className={`block text-sm font-medium text-slate-700 ${className}`}>{children}</label>;
}

// ---- Badge ----------------------------------------------------------------
export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

// ---- Alert ----------------------------------------------------------------
const alertVariants = {
  error: 'bg-rose-50 text-rose-700 ring-rose-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  info: 'bg-brand-50 text-brand-700 ring-brand-200',
};

export function Alert({ type = 'info', children }) {
  if (!children) return null;
  return <div className={`rounded-lg px-3 py-2 text-sm ring-1 ${alertVariants[type]}`}>{children}</div>;
}

// ---- Spinner --------------------------------------------------------------
export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      {label}
    </div>
  );
}

// ---- Currency helper ------------------------------------------------------
export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// ---- Fallback imagery -----------------------------------------------------
// Used anywhere a trip/destination has no cover image — an Uttarakhand
// Himalayan mountain shot so the app never shows a broken/off-theme picture.
export const MOUNTAIN_IMG =
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';

// Returns the first cover image, else the mountain fallback.
export const coverOf = (pkg) => pkg?.coverImage?.[0] || MOUNTAIN_IMG;
