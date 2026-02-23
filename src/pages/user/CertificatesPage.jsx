import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createCertificate, fetchCertificates, removeCertificate, updateCertificate } from '../../services/certificateService';
import { formatDate, getCertificateStatus, isAllowedFile } from '../../utils/certificateUtils';

const initialForm = { title: '', issuer: '', category: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', notes: '' };

export default function CertificatesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [filterIssuer, setFilterIssuer] = useState('all');

  const load = () => fetchCertificates(user.uid).then(setItems);
  useEffect(() => { if (user) load(); }, [user]);

  const issuers = useMemo(() => ['all', ...new Set(items.map((i) => i.issuer))], [items]);
  const filtered = useMemo(() => items.filter((i) => {
    const text = `${i.title} ${i.issuer}`.toLowerCase().includes(query.toLowerCase());
    const issuer = filterIssuer === 'all' || i.issuer === filterIssuer;
    return text && issuer;
  }), [items, query, filterIssuer]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isAllowedFile(file)) return alert('File must be PDF/JPG/PNG and max 5MB.');
    const payload = { ...form, uid: user.uid, expiryDate: form.expiryDate || null };
    if (editing) await updateCertificate(editing.id, payload, file);
    else await createCertificate(payload, file);
    setOpen(false); setEditing(null); setForm(initialForm); setFile(null); load();
  };

  const onEdit = (item) => { setEditing(item); setForm({ ...item, expiryDate: item.expiryDate || '' }); setOpen(true); };

  return (
    <div>
      <div className="section-head"><h2>Certificates</h2><button className="btn-primary" onClick={() => setOpen(true)}>Add Certificate</button></div>
      <div className="glass-card filters-row">
        <input placeholder="Search by title or issuer" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={filterIssuer} onChange={(e) => setFilterIssuer(e.target.value)}>{issuers.map((i) => <option key={i}>{i}</option>)}</select>
      </div>

      {open && (
        <div className="glass-card modal-like">
          <h3>{editing ? 'Edit Certificate' : 'Add Certificate'}</h3>
          <form onSubmit={submit} className="grid-form">
            {['title', 'issuer', 'category', 'issueDate', 'expiryDate', 'credentialId', 'credentialUrl'].map((k) => (
              <input key={k} type={k.includes('Date') ? 'date' : 'text'} placeholder={k} value={form[k] || ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} required={['title', 'issuer', 'category', 'issueDate'].includes(k)} />
            ))}
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0])} />
            <div className="actions-row"><button className="btn-primary">Save</button><button type="button" className="btn-secondary" onClick={() => {setOpen(false); setEditing(null);}}>Cancel</button></div>
          </form>
        </div>
      )}

      <div className="glass-card table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Issuer</th><th>Issue</th><th>Expiry</th><th>Status</th><th>PDF/Proof</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td><td>{item.issuer}</td><td>{formatDate(item.issueDate)}</td><td>{formatDate(item.expiryDate)}</td>
                <td><span className={`status ${getCertificateStatus(item.expiryDate).toLowerCase().replace(' ', '-')}`}>{getCertificateStatus(item.expiryDate)}</span></td>
                <td>{item.proofUrl ? <a href={item.proofUrl} target="_blank">Open</a> : '—'}</td>
                <td>
                  <button onClick={() => onEdit(item)}>Edit</button>
                  <button onClick={() => removeCertificate(item).then(load)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p>No certificates found.</p>}
      </div>
    </div>
  );
}
