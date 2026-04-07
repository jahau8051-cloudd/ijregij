import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };

import { UserPlus, Users, Calendar, DollarSign, Activity } from 'lucide-react';

export default function AdminHome({ onNav }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats().then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: C.gray }}>Loading...</div>;

  const cards = [
    { icon: <UserPlus size={24} />, label: 'Total Doctors', value: stats.total_doctors || 0, color: C.primary, sub: `${stats.pending_doctors || 0} pending approval` },
    { icon: <Users size={24} />, label: 'Total Patients', value: stats.total_patients || 0, color: C.green, sub: 'Registered patients' },
    { icon: <Calendar size={24} />, label: 'Total Appointments', value: stats.total_appointments || 0, color: C.orange, sub: `${stats.pending_appointments || 0} pending` },
    { icon: <DollarSign size={24} />, label: 'Total Revenue', value: `$${parseFloat(stats.total_revenue || 0).toFixed(2)}`, color: C.dark, sub: `$${parseFloat(stats.today_revenue || 0).toFixed(2)} today` },
    { icon: <Activity size={24} />, label: "Today's Appointments", value: stats.today_appointments || 0, color: C.primary, sub: 'Scheduled for today' },
  ];

  const monthly = stats.monthly || [];

  return (
    <div className="fade" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Admin Overview</h1>
        <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Platform statistics and metrics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: c.color }}>{c.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.dark }}>{c.value}</div>
            <div style={{ color: C.dark, fontSize: 14, fontWeight: 600, marginTop: 4 }}>{c.label}</div>
            {c.sub && <div style={{ color: c.color, fontSize: 12, marginTop: 2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {monthly.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 24, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Revenue Trend</h2>
              <p style={{ color: C.gray, fontSize: 14, marginTop: 4 }}>Last 6 months trailing</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.primary }}>${parseFloat(stats.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div style={{ color: C.gray, fontSize: 13, fontWeight: 600 }}>Lifetime Volume</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 220, borderBottom: '2px solid #f1f5f9', paddingBottom: 16 }}>
            {monthly.map((m, i) => {
              const maxVal = Math.max(...monthly.map(x => parseFloat(x.revenue)));
              const h = maxVal > 0 ? (parseFloat(m.revenue) / maxVal) * 160 : 10;
              const d = new Date(); d.setMonth(parseInt(m.month) - 1);
              const mName = d.toLocaleString('en-US', { month: 'short' });
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 12 }}>${parseFloat(m.revenue).toLocaleString()}</div>
                  <div 
                    title={`${m.payments} appointments collected`}
                    style={{ width: '100%', maxWidth: 56, height: Math.max(h, 4), background: i === monthly.length - 1 ? `linear-gradient(to top, ${C.primary}, #93c5fd)` : '#e2e8f0', borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all .2s' }} 
                    onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                    onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                  />
                  <div style={{ fontSize: 13, fontWeight: 700, color: i === monthly.length - 1 ? C.dark : C.gray, marginTop: 14 }}>{mName}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[
          { title: 'Platform Health', items: [
            { label: 'Active Doctors', value: parseInt(stats.total_doctors || 0) - parseInt(stats.pending_doctors || 0), color: C.green },
            { label: 'Pending Approvals', value: stats.pending_doctors || 0, color: C.orange },
            { label: 'Pending Appointments', value: stats.pending_appointments || 0, color: C.primary },
          ]},
          { title: 'Quick Actions', isActions: true },
        ].map((section, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 16 }}>{section.title}</h2>
            {section.isActions ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Manage Doctors', color: C.primary, nav: 'doctors' },
                  { label: 'Manage Patients', color: C.green, nav: 'patients' },
                  { label: 'View Appointments', color: C.orange, nav: 'appointments' },
                  { label: 'Payment Reports', color: C.dark, nav: 'payments' },
                ].map(action => (
                  <button key={action.label} onClick={() => onNav(action.nav)} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: action.color, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>{action.label} &rarr;</button>
                ))}
              </div>
            ) : (
              section.items?.map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: C.gray, fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 800, color: item.color, fontSize: 18 }}>{item.value}</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
