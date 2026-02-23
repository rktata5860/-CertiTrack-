import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { getCertificateStatus } from '../../utils/certificateUtils';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    (async () => {
      const userSnap = await getDocs(collection(db, 'users'));
      const certSnap = await getDocs(collection(db, 'certificates'));
      setUsers(userSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCerts(certSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const stats = useMemo(() => ({
    users: users.length,
    certs: certs.length,
    expiringSoon: certs.filter((c) => getCertificateStatus(c.expiryDate) === 'Expiring Soon').length,
    pending: 12,
  }), [users, certs]);

  return (
    <div className="dashboard-shell glass-card admin-shell">
      <h2>🛡️ Admin Command Center</h2>
      <p className="auth-hint">Different view from user dashboard: organization-level KPIs, governance signals, and raw data stream.</p>

      <div className="grid-4">
        <article className="glass-card kpi"><h4>Total Users</h4><strong>{stats.users}</strong></article>
        <article className="glass-card kpi"><h4>Total Certificates</h4><strong>{stats.certs}</strong></article>
        <article className="glass-card kpi"><h4>Expiring Soon</h4><strong>{stats.expiringSoon}</strong></article>
        <article className="glass-card kpi"><h4>Pending Requests</h4><strong>{stats.pending}</strong></article>
      </div>

      <div className="split-two">
        <section className="glass-card">
          <h3>Issuer Insights</h3>
          <ul>
            {[...new Set(certs.map((c) => c.issuer).filter(Boolean))].slice(0, 5).map((issuer) => (
              <li key={issuer}>{issuer}: {certs.filter((c) => c.issuer === issuer).length} certs</li>
            ))}
            {certs.length === 0 && <li>No data.</li>}
          </ul>
        </section>

        <section className="glass-card">
          <h3>Governance Notes</h3>
          <ul>
            <li>Admins can verify certificates and review all user records.</li>
            <li>Use Admin Certificates to toggle verification and export CSV.</li>
            <li>Use Admin Renewals to monitor overdue renewal risk.</li>
          </ul>
        </section>
      </div>

      <section className="glass-card table-wrap">
        <h3>Raw Data Preview (Latest Certificates)</h3>
        <table>
          <thead>
            <tr><th>Doc ID</th><th>UID</th><th>Title</th><th>Issuer</th><th>Verified</th></tr>
          </thead>
          <tbody>
            {certs.slice(0, 6).map((item) => (
              <tr key={item.id}><td>{item.id}</td><td>{item.uid}</td><td>{item.title}</td><td>{item.issuer}</td><td>{String(!!item.verified)}</td></tr>
            ))}
          </tbody>
        </table>
        {certs.length === 0 && <p>No raw records available.</p>}
      </section>
    </div>
  );
}
