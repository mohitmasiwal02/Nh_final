import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// adminOnly: also require role === 'admin'
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
