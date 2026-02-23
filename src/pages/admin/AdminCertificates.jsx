import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDate, getCertificateStatus } from '../../utils/certificateUtils';

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const userSnap = await getDocs(collection(db, 'users'));
    const userMap = Object.fromEntries(userSnap.docs.map((d) => [d.id, d.data().email]));
    const certSnap = await getDocs(collection(db, 'certificates'));
    setItems(certSnap.docs.map((d) => ({ id: d.id, ...d.data(), userEmail: userMap[d.data().uid] || 'Unknown' })));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((i) => `${i.userEmail} ${i.title} ${i.issuer}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const exportCsv = () => {
    const header = 'userEmail,uid,title,issuer,expiry,status,verified,proofUrl';
    const rows = filtered.map((r) => [r.userEmail, r.uid, r.title, r.issuer, r.expiryDate || '', getCertificateStatus(r.expiryDate), !!r.verified, r.proofUrl || ''].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'admin-certificates.csv'; a.click();
  };

  const toggleVerified = async (item) => { await updateDoc(doc(db, 'certificates', item.id), { verified: !item.verified }); load(); };

  return (
    <div>
      <div className="section-head"><h2>All Certificates (Admin)</h2><button onClick={exportCsv}>Export CSV</button></div>
      <div className="glass-card"><input placeholder="Search user/title/issuer" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="glass-card table-wrap">
        <table>
          <thead><tr><th>User</th><th>Raw UID</th><th>Title</th><th>Issuer</th><th>Expiry</th><th>Status</th><th>Verified</th><th>PDF/Proof</th></tr></thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}><td>{i.userEmail}</td><td>{i.uid}</td><td>{i.title}</td><td>{i.issuer}</td><td>{formatDate(i.expiryDate)}</td><td>{getCertificateStatus(i.expiryDate)}</td><td><button onClick={() => toggleVerified(i)}>{i.verified ? 'Yes' : 'No'}</button></td><td>{i.proofUrl ? <a href={i.proofUrl} target="_blank">Open</a> : '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
