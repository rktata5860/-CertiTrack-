import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { getCertificateStatus } from '../../utils/certificateUtils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, certs: 0, expiring: 0, pending: 12 });
  const [raw, setRaw] = useState([]);

  useEffect(() => {
    (async () => {
      const userSnap = await getDocs(collection(db, 'users'));
      const certSnap = await getDocs(collection(db, 'certificates'));
      const certs = certSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRaw(certs.slice(0, 5));
      setStats({
        users: userSnap.size,
        certs: certSnap.size,
        expiring: certs.filter((c) => getCertificateStatus(c.expiryDate) === 'Expiring Soon').length,
        pending: 12,
      });
    })();
  }, []);

  return (
    <div>
      <h2>Admin Command Center</h2>
      <div className="grid-4">
        <article className="glass-card kpi"><h4>Total Users</h4><strong>{stats.users}</strong></article>
        <article className="glass-card kpi"><h4>Total Certificates</h4><strong>{stats.certs}</strong></article>
        <article className="glass-card kpi"><h4>Expiring Soon</h4><strong>{stats.expiring}</strong></article>
        <article className="glass-card kpi"><h4>Pending Requests</h4><strong>{stats.pending}</strong></article>
      </div>
      <div className="glass-card">
        <h3>Raw Data Preview</h3>
        {raw.map((r) => <div key={r.id} className="list-row"><span>{r.uid} · {r.title}</span><span>{r.issuer}</span></div>)}
      </div>
    </div>
  );
}
