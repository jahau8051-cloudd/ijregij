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
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);
  const todayRevenue = payments.filter(p => new Date(p.created_at).toISOString().startsWith(todayStr)).reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const thisMonth = payments.filter(p => new Date(p.created_at).toISOString().startsWith(thisMonthStr)).reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="fade" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Payment Reports</h1>
        <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>All payment transactions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a4.5 4.5 0 0 0 0 9h5a4.5 4.5 0 0 1 0 9H7"/></svg>, label: 'Total Revenue', value: `EGP ${totalRevenue.toFixed(2)}`, color: C.green },
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'This Month', value: `EGP ${thisMonth.toFixed(2)}`, color: C.primary },
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Today', value: `EGP ${todayRevenue.toFixed(2)}`, color: C.orange },
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, label: 'Total Transactions', value: payments.length, color: C.dark },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{s.value}</div>
              <div style={{ color: C.gray, fontSize: 13 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by patient, doctor, or transaction ID..." style={{ width: '100%', maxWidth: 420, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 100px 120px', gap: 16, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>
            <span>Patient</span><span>Doctor</span><span>Date</span><span>Method</span><span style={{textAlign:'right'}}>Amount</span>
          </div>
          {filtered.map(p => (
            <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 100px 120px', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray }}>
                  {p.patient_avatar ? <img src={p.patient_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p"/> : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{p.patient_name}</div>
                  <div style={{ color: C.gray, fontSize: 10, fontFamily: 'monospace' }}>{p.transaction_id?.slice(0, 14)}...</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                  {p.doctor_avatar ? <img src={p.doctor_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="d"/> : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H7M19 9H5M21 13H3M19 17H5M17 21H7"/></svg>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{p.doctor_name}</div>
                  <div style={{ color: C.gray, fontSize: 11 }}>{p.specialty}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>{new Date(p.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: 11, color: C.gray }}>Paid: {new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 12, color: C.gray, fontWeight: 500 }}>
                <div style={{display:'flex', alignItems:'center', gap:4}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <span>···· {p.card_last4 || '4242'}</span>
                </div>
              </div>
              <div style={{ fontWeight: 800, color: C.green, fontSize: 15, textAlign: 'right' }}>EGP {parseFloat(p.amount).toFixed(2)}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: C.gray }}>No payments found</div>}
        </div>
      )}
    </div>
  );
}
