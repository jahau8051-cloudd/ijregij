import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import PatientLayout from './pages/patient/PatientLayout.jsx';
import DoctorLayout from './pages/doctor/DoctorLayout.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';

const G = `
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
 *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
 body{font-family:'Inter',sans-serif;background:#f1f5f9;color:#1e293b;}
 ::-webkit-scrollbar{width:6px;height:6px;}
 ::-webkit-scrollbar-track{background:#f1f5f9;}
 ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
 @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
 @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
 .fade{animation:fadeIn .3s ease}
 .slide{animation:slideIn .25s ease}
 input,select,textarea,button{font-family:inherit;}
 a{text-decoration:none;}

 /* ===== MOBILE RESPONSIVE ===== */
 @media(max-width:768px){
   /* Landing navbar */
   .nav-links{display:none !important;}
   .nav-buttons .btn-signin{display:none !important;}
   .nav-buttons .btn-signup{padding:7px 14px !important;font-size:13px !important;}

   /* Hero grid */
   .hero-grid{grid-template-columns:1fr !important;gap:32px !important;padding:40px 5% !important;}
   .hero-right{display:none !important;}
   .hero-stats{gap:20px !important;}
   .hero-stats>div>div:first-child{font-size:20px !important;}

   /* Stats bar */
   .stats-grid{grid-template-columns:repeat(2,1fr) !important;gap:20px !important;}
   .stats-grid>div>div:first-child{font-size:26px !important;}

   /* Feature / specialty grids */
   .feature-grid{grid-template-columns:1fr !important;}
   .how-grid{grid-template-columns:1fr !important;}
   .specialty-grid{grid-template-columns:repeat(2,1fr) !important;}
   .doctor-grid{grid-template-columns:1fr !important;}

   /* Dashboard sidebar → bottom tab bar */
   .dash-layout{flex-direction:column !important;}
   .dash-sidebar{
     width:100% !important;height:auto !important;position:fixed !important;
     bottom:0 !important;left:0 !important;right:0 !important;z-index:999 !important;
     flex-direction:row !important;padding:0 !important;
     border-top:1px solid rgba(255,255,255,0.1) !important;
     overflow-x:auto !important;
   }
   .dash-sidebar .sidebar-header{display:none !important;}
   .dash-sidebar .sidebar-footer{display:none !important;}
   .dash-sidebar nav{
     display:flex !important;flex-direction:row !important;
     padding:6px 4px !important;gap:2px !important;
     overflow-x:auto !important;flex:1 !important;
     justify-content:space-around !important;
   }
   .dash-sidebar nav button{
     flex-direction:column !important;gap:2px !important;
     padding:6px 8px !important;font-size:10px !important;
     min-width:0 !important;white-space:nowrap !important;
     border-radius:8px !important;
   }
   .dash-sidebar nav button span.nav-icon{display:flex !important;}
   .dash-sidebar nav button span.nav-label{font-size:9px !important;}
   .dash-main{padding-bottom:72px !important;}
   .mobile-logout{display:flex !important;}

   /* Cards and forms */
   .page-header{flex-direction:column !important;gap:12px !important;align-items:flex-start !important;}
 }

 .mobile-logout{display:none;}

 @media(max-width:480px){
   .stats-grid{grid-template-columns:1fr 1fr !important;}
   .specialty-grid{grid-template-columns:repeat(2,1fr) !important;}
   .doctor-grid{grid-template-columns:1fr !important;}
 }
`;

function DoctorPendingScreen({ user, onLogout }) {
 return (
 <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a6e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
 <div className="fade" style={{ background: '#fff', borderRadius: 20, padding: 52, width: '100%', maxWidth: 500, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', textAlign: 'center' }}>
 <div style={{ fontSize: 56, marginBottom: 20 }}></div>
 <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Account under review</h1>
 <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
 Hi {user.fullName.split(' ')[0]}, your application is being reviewed by our team.
 </p>
 <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
 This typically takes 1–2 business days. You'll be able to sign in and start accepting patients once approved.
 </p>
 <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
 <p style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 10 }}>What we're checking:</p>
 {['Medical license validity', 'Professional credentials', 'Identity verification'].map((s, i) => (
 <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
 <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
 <span style={{ color: '#0369a1', fontSize: 13 }}>{s}</span>
 </div>
 ))}
 </div>
 <button onClick={onLogout} style={{ padding: '12px 28px', background: '#f1f5f9', color: '#0f172a', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
 Sign out
 </button>
 </div>
 </div>
 );
}

export default function App() {
 const [page, setPage] = useState('landing');
 const [user, setUser] = useState(null);

 useEffect(() => {
 const stored = localStorage.getItem('medidash_user');
 if (stored) {
 const u = JSON.parse(stored);
 setUser(u);
 setPage(u.role);
 }
 }, []);

 useEffect(() => {
 const titles = {
   landing: 'MediDash - Healthcare Made Simple',
   signup: 'Create Account | MediDash',
   signin: 'Sign In | MediDash',
   patient: 'Patient Portal | MediDash',
   doctor: 'Provider Dashboard | MediDash',
   admin: 'Admin Console | MediDash'
 };
 document.title = titles[page] || 'MediDash - Healthcare Made Simple';
 }, [page]);

 const login = (u) => {
 localStorage.setItem('medidash_user', JSON.stringify(u));
 setUser(u);
 setPage(u.role);
 };

 const logout = () => {
 localStorage.removeItem('medidash_user');
 setUser(null);
 setPage('landing');
 };

 const nav = (p) => setPage(p);

 // Doctor with pending status — show waiting screen
 const isPendingDoctor = page === 'doctor' && user?.doctorStatus === 'pending';

 return (
 <>
 <style>{G}</style>
 {page === 'landing' && <LandingPage onNav={nav} />}
 {page === 'signup' && <SignUpPage onSuccess={login} onNav={nav} />}
 {page === 'signin' && <SignInPage onSuccess={login} onNav={nav} />}
 {page === 'patient' && user && <PatientLayout user={user} onLogout={logout} />}
 {page === 'doctor' && user && isPendingDoctor && <DoctorPendingScreen user={user} onLogout={logout} />}
 {page === 'doctor' && user && !isPendingDoctor && <DoctorLayout user={user} onLogout={logout} />}
 {page === 'admin' && user && <AdminLayout user={user} onLogout={logout} />}
 </>
 );
}
