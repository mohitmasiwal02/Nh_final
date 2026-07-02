import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import Dashboard from './pages/admin/Dashboard';
import ManagePackages from './pages/admin/ManagePackages';
import ManageCoupons from './pages/admin/ManageCoupons';
import ProtectedRoute from './routes/ProtectedRoute';
import { FaMountainSun } from 'react-icons/fa6';
import { FiShield, FiPhone, FiMail } from 'react-icons/fi';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Routes>
          {/* public */}
          <Route path="/" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* logged-in users */}
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

          {/* admin only */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/packages" element={<ProtectedRoute adminOnly><ManagePackages /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute adminOnly><ManageCoupons /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p className="flex items-center gap-2">
          <FaMountainSun className="text-brand-600" />
          Devbhoomi Trips — Uttarakhand tour packages, stay &amp; meals included.
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><FiShield /> Secure payments</span>
          <span className="inline-flex items-center gap-1"><FiPhone /> 24×7 support</span>
          <span className="inline-flex items-center gap-1"><FiMail /> hello@devbhoomitrips.in</span>
        </div>
        <p>© {new Date().getFullYear()} Devbhoomi Trips</p>
      </div>
    </footer>
  );
}
