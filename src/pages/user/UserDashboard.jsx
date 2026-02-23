import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCertificates } from '../../services/certificateService';
import { getCertificateStatus, formatDate } from '../../utils/certificateUtils';

export default function UserDashboard() {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchCertificates(user.uid).then(setCerts);
  }, [user]);

  const stats = useMemo(() => {
    const expiring = certs.filter((c) => getCertificateStatus(c.expiryDate) === 'Expiring Soon').length;
    const expired = certs.filter((c) => getCertificateStatus(c.expiryDate) === 'Expired').length;
    return { total: certs.length, expiring, expired };
  }, [certs]);

  return (
    <div>
      <h2>User Dashboard</h2>
      <div className="grid-4">
        <article className="glass-card kpi"><h4>Total Certificates</h4><strong>{stats.total}</strong></article>
        <article className="glass-card kpi"><h4>Expiring Soon</h4><strong>{stats.expiring}</strong></article>
        <article className="glass-card kpi"><h4>Expired</h4><strong>{stats.expired}</strong></article>
        <article className="glass-card kpi"><h4>Compliance Rate</h4><strong>{stats.total ? Math.round(((stats.total - stats.expired) / stats.total) * 100) : 100}%</strong></article>
      </div>
      <div className="actions-row">
        <Link to="/certificates" className="btn-primary">Add Certificate</Link>
        <Link to="/renewals" className="btn-secondary">View Renewals</Link>
      </div>
      <div className="glass-card">
        <h3>Recent Certificates</h3>
        {certs.slice(0, 5).map((c) => (
          <div key={c.id} className="list-row">
            <span>{c.title} · {c.issuer}</span>
            <span>{formatDate(c.issueDate)}</span>
          </div>
        ))}
        {certs.length === 0 && <p>No certificates found.</p>}
      </div>
    </div>
  );
}
