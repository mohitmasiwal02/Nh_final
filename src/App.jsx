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
import Logo from './components/Logo';
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
    <footer className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-500">

            <div className="flex items-center gap-2 justify-center sm:justify-start bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
              <FiShield className="text-slate-600" />
              <span>Secure payments</span>
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-start bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
              <FiPhone className="text-slate-600" />
              <span>24×7 support</span>
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-start bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
              <FiMail className="text-slate-600" />
              <span>hello@northernharrier.in</span>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-5">

          <p className="text-xs text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} Northern Harrier. All rights reserved.
          </p>

          <div className="flex gap-4 justify-center sm:justify-end text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition">Terms</a>
            <a href="#" className="hover:text-slate-600 transition">Contact</a>
          </div>

        </div>

      </div>
    </footer>
  );
}
