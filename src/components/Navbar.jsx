import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiMap, FiShoppingBag, FiSettings, FiLogIn, FiImage, FiInfo,
} from 'react-icons/fi';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); 
   const [openProfile, setOpenProfile] = useState(false); 
  // lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`;

  // mobile drawer link — bigger touch target, icon + label
  const drawerLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
    }`;

  const closeDrawer = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" onClick={closeDrawer}>
          <Logo />
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            <span className="inline-flex items-center gap-1.5"><FiMap /> Packages</span>
          </NavLink>
          <NavLink to="/gallery" className={navLinkClass}>
            <span className="inline-flex items-center gap-1.5"><FiImage /> Gallery</span>
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <span className="inline-flex items-center gap-1.5"><FiInfo /> About Us</span>
          </NavLink>
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              <span className="inline-flex items-center gap-1.5"><FiShoppingBag /> My Trips</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="inline-flex items-center gap-1.5"><FiSettings /> Admin</span>
            </NavLink>
          )}
          {user ? (
            <div className="flex items-center gap-3 relative cursor-pointer">
              <span onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                <img src={user.picture} alt={user.picture} className="h-6 w-6 rounded-full" />
                {user.name}
              </span>
              {openProfile && (
                <div className="absolute right-0 top-10   ">
                  <Button variant="secondary" onClick={handleLogout}><FiLogOut /> Logout</Button>
                </div>
              )}
            </div>
          ) : (
            <Button as={Link} to="/login"><FiLogIn /> Login</Button>
          )}
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[57px] z-40 md:hidden">
          {/* backdrop */}
          <div className="absolute inset-0 bg-slate-900/40" onClick={closeDrawer} />
          {/* panel */}
          <div className="absolute inset-x-0 top-0 rounded-b-2xl bg-white px-3 pb-5 pt-3 shadow-xl">
            {/* user strip */}
            {user ? (
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  <img src={user.picture} alt={user.name} className="h-10 w-10 rounded-full" />
                </span>
                <div className="leading-tight">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user.role}</p>
                </div>
              </div>
            ) : (
              <Button as={Link} to="/login" className="mb-2 w-full" onClick={closeDrawer}>
                <FiLogIn /> Login / Sign up
              </Button>
            )}

            <div className="flex flex-col gap-1">
              <NavLink to="/" className={drawerLinkClass} end onClick={closeDrawer}>
                <FiMap className="text-lg" /> Packages
              </NavLink>
              <NavLink to="/gallery" className={drawerLinkClass} onClick={closeDrawer}>
                <FiImage className="text-lg" /> Gallery
              </NavLink>
              <NavLink to="/about" className={drawerLinkClass} onClick={closeDrawer}>
                <FiInfo className="text-lg" /> About Us
              </NavLink>
              {user && (
                <NavLink to="/orders" className={drawerLinkClass} onClick={closeDrawer}>
                  <FiShoppingBag className="text-lg" /> My Trips
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={drawerLinkClass} onClick={closeDrawer}>
                  <FiSettings className="text-lg" /> Admin
                </NavLink>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-rose-600 hover:bg-rose-50"
                >
                  <FiLogOut className="text-lg" /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
