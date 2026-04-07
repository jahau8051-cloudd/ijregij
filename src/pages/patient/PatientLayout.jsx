import React, { useState } from 'react';
import PatientHome from './PatientHome.jsx';
import FindDoctor from './FindDoctor.jsx';
import MyAppointments from './MyAppointments.jsx';
import Prescriptions from './Prescriptions.jsx';
import PatientMessages from './PatientMessages.jsx';
import PaymentHistory from './PaymentHistory.jsx';
import PatientProfile from './PatientProfile.jsx';

import { Home, Search, Calendar, FileText, MessageSquare, CreditCard, User, LogOut } from 'lucide-react';

const MENU = [
 { id: 'home', icon: <Home size={20} />, label: 'Dashboard' },
 { id: 'find', icon: <Search size={20} />, label: 'Find Doctor' },
 { id: 'appointments', icon: <Calendar size={20} />, label: 'Appointments' },
 { id: 'prescriptions', icon: <FileText size={20} />, label: 'Prescriptions' },
 { id: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
 { id: 'payments', icon: <CreditCard size={20} />, label: 'Payments' },
 { id: 'profile', icon: <User size={20} />, label: 'My Profile' },
];

const C = { primary: '#3b82f6', dark: '#0f172a', sidebar: '#1e293b' };

export default function PatientLayout({ user, onLogout }) {
 const [page, setPage] = useState('home');
 const [bookingDoctor, setBookingDoctor] = useState(null);

 const handleBookDoctor = (doctor) => {
 setBookingDoctor(doctor);
 setPage('appointments');
 };

 const renderPage = () => {
 switch (page) {
 case 'home': return <PatientHome user={user} onNav={setPage} onBook={handleBookDoctor} />;
 case 'find': return <FindDoctor user={user} onBook={handleBookDoctor} />;
 case 'appointments': return <MyAppointments user={user} initialBooking={bookingDoctor} onClearBooking={() => setBookingDoctor(null)} />;
 case 'prescriptions': return <Prescriptions user={user} />;
 case 'messages': return <PatientMessages user={user} />;
 case 'payments': return <PaymentHistory user={user} />;
 case 'profile': return <PatientProfile user={user} />;
 default: return <PatientHome user={user} onNav={setPage} onBook={handleBookDoctor} />;
 }
 };

 return (
 <div className="dash-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
 {/* Sidebar */}
 <aside className="dash-sidebar" style={{ width: 240, background: C.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
 <div className="sidebar-header" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
 <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>MediDash</div>
 <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Patient Portal</div>
 </div>
 <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
 {MENU.map(m => (
  <button key={m.id} onClick={() => setPage(m.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all .15s', background: page === m.id ? C.primary : 'transparent', color: page === m.id ? '#fff' : '#94a3b8', fontWeight: page === m.id ? 600 : 400, fontSize: 14, textAlign: 'left' }}>
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
  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}><User size={18} /></div>
 <div>
 <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{user.fullName}</div>
 <div style={{ color: '#64748b', fontSize: 11 }}>Patient</div>
 </div>
 </div>
 <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
 Sign Out
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="dash-main" style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
 {renderPage()}
 </main>
 </div>
 );
}
