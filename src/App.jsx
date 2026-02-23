import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import { AdminOnlyRoute, ProtectedRoute, UserOnlyRoute } from './components/RouteGuards';
import UserDashboard from './pages/user/UserDashboard';
import CertificatesPage from './pages/user/CertificatesPage';
import RenewalsPage from './pages/user/RenewalsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminRenewals from './pages/admin/AdminRenewals';
import AdminPanel from './pages/admin/AdminPanel';
import NotFound from './pages/NotFound';
import ChatbotWidget from './components/ChatbotWidget';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserOnlyRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/renewals" element={<RenewalsPage />} />
            </Route>
          </Route>

          <Route element={<AdminOnlyRoute />}>
            <Route element={<AppLayout admin />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
              <Route path="/admin/renewals" element={<AdminRenewals />} />
              <Route path="/admin/panel" element={<AdminPanel />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatbotWidget />
    </>
  );
}
