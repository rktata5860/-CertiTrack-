export default function AdminPanel() {
  return (
    <div className="glass-card">
      <h2>Admin Panel</h2>
      <p>Use this governance space for policy notes, onboarding guidance, and audit process details.</p>
      <ul>
        <li>Admin roles are managed in <code>users/{'{uid}'}.role</code>.</li>
        <li>All certificate verification decisions are tracked in Firestore via <code>verified</code> flag.</li>
      </ul>
    </div>
  );
}
