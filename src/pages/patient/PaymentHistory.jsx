import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981' };

import { CreditCard, DollarSign, Calendar } from 'lucide-react';

export default function PaymentHistory({ user }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.profileId) return setLoading(false);
    api.getPatientPayments(user.profileId).then(data => { setPayments(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const totalSpent = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="fade" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Payment History</h1>
        <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Your billing & payment records</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Payments', value: payments.length, icon: <CreditCard size={24} />, color: C.primary },
          { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, icon: <DollarSign size={24} />, color: C.green },
          { label: 'This Month', value: `$${payments.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).reduce((s, p) => s + parseFloat(p.amount || 0), 0).toFixed(2)}`, icon: <Calendar size={24} />, color: '#f59e0b' },
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: C.gray }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CreditCard size={52} strokeWidth={1.5} color="#cbd5e1" /></div>
          <p style={{ fontSize: 18, fontWeight: 600 }}>No payments yet</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 16, fontSize: 12, fontWeight: 600, color: C.gray, textTransform: 'uppercase' }}>
            <span>Doctor</span><span>Date</span><span>Method</span><span>Transaction</span><span>Amount</span>
          </div>
          {payments.map(p => (
            <div key={p.id} style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{p.doctor_name}</div>
                <div style={{ color: C.gray, fontSize: 12 }}>{p.specialty}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: C.dark }}>{new Date(p.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{p.type}</div>
              </div>
              <div style={{ fontSize: 13, color: C.dark }}>···· {p.card_last4}</div>
              <div style={{ fontSize: 11, color: C.gray, fontFamily: 'monospace' }}>{p.transaction_id?.slice(0, 16)}...</div>
              <div style={{ fontWeight: 800, color: C.green, fontSize: 16 }}>${parseFloat(p.amount).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
