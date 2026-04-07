import React, { useState } from 'react';
import AdminHome from './AdminHome.jsx';
import ManageDoctors from './ManageDoctors.jsx';
import ManagePatients from './ManagePatients.jsx';
import AdminAppointments from './AdminAppointments.jsx';
import AdminPayments from './AdminPayments.jsx';

import { LayoutDashboard, User, Users, Calendar, CreditCard, Shield, LogOut } from 'lucide-react';

const MENU = [
  { id: 'home', icon: <LayoutDashboard size={20} />, label: 'Overview' },
  { id: 'doctors', icon: <User size={20} />, label: 'Doctors' },
  { id: 'patients', icon: <Users size={20} />, label: 'Patients' },
  { id: 'appointments', icon: <Calendar size={20} />, label: 'Appointments' },
  { id: 'payments', icon: <CreditCard size={20} />, label: 'Payments' },
];

export default function AdminLayout({ user, onLogout }) {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home': return <AdminHome onNav={setPage} />;
      case 'doctors': return <ManageDoctors />;
      case 'patients': return <ManagePatients />;
      case 'appointments': return <AdminAppointments />;
      case 'payments': return <AdminPayments />;
      default: return <AdminHome onNav={setPage} />;
    }
  };

  return (
    <div className="dash-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside className="dash-sidebar" style={{ width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div className="sidebar-header" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>MediDash</div>
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Admin Console</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {MENU.map(m => (
            <button key={m.id} onClick={() => setPage(m.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all .15s', background: page === m.id ? '#3b82f6' : 'transparent', color: page === m.id ? '#fff' : '#94a3b8', fontWeight: page === m.id ? 600 : 400, fontSize: 14, textAlign: 'left' }}>
              <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>{m.icon}</span>
              <span className="nav-label">{m.label}</span>
            </button>
          ))}
          <button className="mobile-logout" onClick={onLogout} style={{ width: '100%', alignItems: 'center', gap: 2, padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 600, fontSize: 10, flexDirection: 'column' }}>
            <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}><LogOut size={20} /></span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer" style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f620', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} /></div>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{user.fullName}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Administrator</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Sign Out</button>
        </div>
      </aside>
      <main className="dash-main" style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>{renderPage()}</main>
    </div>
  );
}
