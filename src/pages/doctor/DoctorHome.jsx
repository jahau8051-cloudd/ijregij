import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };
const STATUS_COLORS = { pending: { bg: '#fef9c3', c: '#854d0e' }, confirmed: { bg: '#dbeafe', c: '#1d4ed8' }, completed: { bg: '#d1fae5', c: '#065f46' }, cancelled: { bg: '#fee2e2', c: '#991b1b' } };

import { Calendar, Clock, CheckCircle, DollarSign, Wallet, User } from 'lucide-react';

export default function DoctorHome({ user, onNav, onPrescribe }) {
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user.profileId) return setLoading(false);
      try {
        const [appts, earn] = await Promise.all([
          api.getDoctorAppointments(user.profileId),
          api.getDoctorEarnings(user.profileId),
        ]);
        setAppointments(appts);
        setEarnings(earn);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointment_date?.split('T')[0] === today && a.status !== 'cancelled');
  const upcoming = appointments.filter(a => a.appointment_date?.split('T')[0] > today && a.status !== 'cancelled');
  const pending = appointments.filter(a => a.status === 'pending');

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 24 }}></div>;

  return (
    <div className="fade" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Dashboard Overview</h1>
        <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: <Calendar size={24} />, label: "Today's Appointments", value: todayAppts.length, color: C.primary },
          { icon: <Clock size={24} />, label: 'Pending', value: pending.length, color: C.orange },
          { icon: <CheckCircle size={24} />, label: 'Completed', value: earnings.completed || 0, color: C.green },
          { icon: <DollarSign size={24} />, label: 'This Month', value: `$${parseFloat(earnings.this_month || 0).toFixed(0)}`, color: C.dark },
          { icon: <Wallet size={24} />, label: 'Total Earned', value: `$${parseFloat(earnings.total_earned || 0).toFixed(0)}`, color: C.green },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{s.value}</div>
              <div style={{ color: C.gray, fontSize: 12 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Today's Appointments */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark }}>Today's Schedule</h2>
            <button onClick={() => onNav('appointments')} style={{ color: C.primary, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          {todayAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: C.gray }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}></div>
              <p>No appointments today</p>
            </div>
          ) : todayAppts.slice(0, 5).map(a => {
            const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ textAlign: 'center', minWidth: 44 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{a.appointment_time?.slice(0,5)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{a.patient_name}</div>
                  <div style={{ color: C.gray, fontSize: 12 }}>{a.type === 'video' ? ' Video' : ' In-Person'}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.c }}>{a.status}</span>
                {a.status === 'confirmed' && (
                  <button onClick={() => onPrescribe(a)} style={{ padding: '5px 12px', background: `${C.green}15`, color: C.green, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Rx</button>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming Appointments */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark }}>Upcoming</h2>
            <span style={{ background: `${C.primary}15`, color: C.primary, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{upcoming.length} scheduled</span>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: C.gray }}>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Calendar color="#cbd5e1" size={40} strokeWidth={1.5} /></div>
              <p>No upcoming appointments</p>
            </div>
          ) : upcoming.slice(0, 5).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}><User size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{a.patient_name}</div>
                <div style={{ color: C.gray, fontSize: 12 }}>
                  {new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {a.appointment_time?.slice(0,5)}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>${a.fee}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
