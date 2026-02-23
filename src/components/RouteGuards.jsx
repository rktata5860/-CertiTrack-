import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Checking session..." />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function UserOnlyRoute() {
  const { role, loading } = useAuth();
  if (loading) return <Loader text="Checking role..." />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

export function AdminOnlyRoute() {
  const { role, loading } = useAuth();
  if (loading) return <Loader text="Checking admin access..." />;
  return role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
