import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b' };

import { DollarSign, BarChart2, CheckCircle, Calendar } from 'lucide-react';

export default function Earnings({ user }) {
  const [earnings, setEarnings] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.profileId) return setLoading(false);
    Promise.all([
      api.getDoctorEarnings(user.profileId),
      api.getDoctorAppointments(user.profileId),
    ]).then(([earn, appts]) => {
      setEarnings(earn);
      setAppointments(appts.filter(a => a.status === 'completed'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 32, color: C.gray }}>Loading...</div>;

  const monthly = earnings.monthly || [];

  return (
    <div className="fade" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Earnings Overview</h1>
        <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Track your revenue and payment history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: <DollarSign size={24} />, label: 'Total Earned', value: `$${parseFloat(earnings.total_earned || 0).toFixed(2)}`, color: C.green },
          { icon: <BarChart2 size={24} />, label: 'This Month', value: `$${parseFloat(earnings.this_month || 0).toFixed(2)}`, color: C.primary },
          { icon: <CheckCircle size={24} />, label: 'Completed', value: earnings.completed || 0, color: C.green },
          { icon: <Calendar size={24} />, label: 'Total Appointments', value: earnings.total_appointments || 0, color: C.orange },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.dark }}>{s.value}</div>
              <div style={{ color: C.gray, fontSize: 13 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Chart (visual bars) */}
      {monthly.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 20 }}>Monthly Revenue</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 160 }}>
            {monthly.map((m, i) => {
              const maxVal = Math.max(...monthly.map(x => parseFloat(x.amount)));
              const h = maxVal > 0 ? (parseFloat(m.amount) / maxVal) * 130 : 10;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>${parseFloat(m.amount).toFixed(0)}</div>
                  <div style={{ width: '100%', height: h + 10, background: `linear-gradient(to top, ${C.primary}, #60a5fa)`, borderRadius: '6px 6px 0 0', transition: 'height .5s', minHeight: 10 }} />
                  <div style={{ fontSize: 11, color: C.gray }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Payment History</h2>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>No payments yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
              <span>Patient / Date</span><span>Type</span><span>Amount</span>
            </div>
            {appointments.map(a => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '14px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{a.patient_name}</div>
                  <div style={{ color: C.gray, fontSize: 12 }}>{new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div style={{ fontSize: 13, color: C.gray }}>{a.type === 'video' ? ' Video' : ' In-Person'}</div>
                <div style={{ fontWeight: 800, color: C.green, fontSize: 16 }}>${parseFloat(a.fee || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
