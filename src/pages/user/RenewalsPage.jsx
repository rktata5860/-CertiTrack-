import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCertificates, updateCertificate } from '../../services/certificateService';

const daysLeft = (expiryDate) => (expiryDate ? Math.ceil((new Date(expiryDate) - new Date()) / 86400000) : null);

export default function RenewalsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newExpiry, setNewExpiry] = useState('');

  const load = () => fetchCertificates(user.uid).then(setItems);
  useEffect(() => { if (user) load(); }, [user]);

  const groups = useMemo(() => {
    const g = { urgent: [], upcoming: [], expired: [], noExpiry: [] };
    items.forEach((item) => {
      const d = daysLeft(item.expiryDate);
      if (d === null) g.noExpiry.push(item);
      else if (d < 0) g.expired.push(item);
      else if (d <= 30) g.urgent.push(item);
      else if (d <= 60) g.upcoming.push(item);
    });
    return g;
  }, [items]);

  const renewNow = async () => {
    await updateCertificate(selected.id, { ...selected, uid: user.uid, expiryDate: newExpiry });
    setSelected(null); setNewExpiry(''); load();
  };

  return (
    <div>
      <h2>Renewals</h2>
      <div className="chip-row">
        <span>Expiring Soon: {groups.urgent.length}</span><span>Upcoming: {groups.upcoming.length}</span><span>Expired: {groups.expired.length}</span>
      </div>
      {['urgent', 'upcoming', 'expired', 'noExpiry'].map((key) => (
        <div key={key} className="glass-card">
          <h3>{key === 'urgent' ? 'Urgent (0-30 days)' : key === 'upcoming' ? 'Upcoming (31-60 days)' : key === 'expired' ? 'Expired' : 'No Expiry'}</h3>
          {groups[key].map((item) => (
            <div className="list-row" key={item.id}><span>{item.title} · {item.issuer}</span><button onClick={() => setSelected(item)}>{key === 'upcoming' ? 'Set Reminder' : 'Renew Now'}</button></div>
          ))}
          {groups[key].length === 0 && <p>No records.</p>}
        </div>
      ))}
      {selected && (
        <div className="glass-card modal-like">
          <h3>Renew: {selected.title}</h3>
          <input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
          <button className="btn-primary" onClick={renewNow}>Update Renewal</button>
        </div>
      )}
    </div>
  );
}
