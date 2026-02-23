import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const daysLeft = (e) => (e ? Math.ceil((new Date(e) - new Date()) / 86400000) : null);

export default function AdminRenewals() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const userSnap = await getDocs(collection(db, 'users'));
      const users = Object.fromEntries(userSnap.docs.map((d) => [d.id, d.data().email]));
      const certSnap = await getDocs(collection(db, 'certificates'));
      setItems(certSnap.docs.map((d) => ({ id: d.id, ...d.data(), userEmail: users[d.data().uid] || 'Unknown' })));
    })();
  }, []);

  const list = useMemo(() => items.filter((i) => filter === 'all' || i.userEmail === filter), [items, filter]);
  const users = ['all', ...new Set(items.map((i) => i.userEmail))];

  return (
    <div>
      <h2>Admin Renewals</h2>
      <div className="glass-card"><select value={filter} onChange={(e) => setFilter(e.target.value)}>{users.map((u) => <option key={u}>{u}</option>)}</select></div>
      {list.map((item) => {
        const d = daysLeft(item.expiryDate);
        const bucket = d === null ? 'No Expiry' : d < 0 ? 'Expired' : d <= 30 ? 'Urgent' : d <= 60 ? 'Upcoming' : 'Healthy';
        return <div key={item.id} className="glass-card list-row"><span>{item.userEmail} · {item.title}</span><strong>{bucket}</strong></div>;
      })}
    </div>
  );
}
