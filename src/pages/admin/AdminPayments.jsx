import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getAllPayments().then(data => { setPayments(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p => !search || p.patient_name?.toLowerCase().includes(search.toLowerCase()) || p.doctor_name?.toLowerCase().includes(search.toLowerCase()) || p.transaction_id?.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const todayRevenue = payments.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const thisMonth = payments.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="fade" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Payment Reports</h1>
        <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>All payment transactions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '$', label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: C.green },
          { icon: '▣', label: 'This Month', value: `$${thisMonth.toFixed(2)}`, color: C.primary },
          { icon: '⊙', label: 'Today', value: `$${todayRevenue.toFixed(2)}`, color: C.orange },
          { icon: '≡', label: 'Total Transactions', value: payments.length, color: C.dark },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{s.value}</div>
              <div style={{ color: C.gray, fontSize: 13 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient, doctor, or transaction ID..." style={{ width: '100%', maxWidth: 420, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: 12, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>
            <span>Patient</span><span>Doctor</span><span>Date</span><span>Method</span><span>Amount</span>
          </div>
          {filtered.map(p => (
            <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{p.patient_name}</div>
                <div style={{ color: C.gray, fontSize: 11, fontFamily: 'monospace' }}>{p.transaction_id?.slice(0, 18)}...</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{p.doctor_name}</div>
                <div style={{ color: C.gray, fontSize: 12 }}>{p.specialty}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: C.dark }}>{new Date(p.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: 12, color: C.gray }}>Paid: {new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 13, color: C.dark }}>···· {p.card_last4}</div>
              <div style={{ fontWeight: 800, color: C.green, fontSize: 17 }}>${parseFloat(p.amount).toFixed(2)}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: C.gray }}>No payments found</div>}
        </div>
      )}
    </div>
  );
}
