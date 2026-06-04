import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import PatientLayout from './pages/patient/PatientLayout.jsx';
import DoctorLayout from './pages/doctor/DoctorLayout.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import MedicalChatbot from './components/MedicalChatbot.jsx';

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
 .profile-box{padding:0 40px 40px;}
 
 /* Desktop Messages */
 .msg-container { display: grid; grid-template-columns: 300px 1fr; height: 75vh; min-height: 520px; max-height: 800px; }
 .msg-sidebar { height: 100%; border-right: 1px solid #f1f5f9; }
 .msg-chat-area { overflow: hidden; }
 
 .bot-fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; opacity: 0.85; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 9999; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
 .bot-fab:hover { transform: scale(1.08) translateY(-2px); opacity: 1; box-shadow: 0 12px 40px rgba(59, 130, 246, 0.5); }
 .bot-window { position: fixed; bottom: 24px; right: 24px; width: 90%; max-width: 380px; height: 600px; max-height: 80vh; background: #fff; border-radius: 24px; box-shadow: 0 12px 48px rgba(0,0,0,0.15); display: flex; flex-direction: column; z-index: 9999; overflow: hidden; border: 1px solid #e2e8f0; animation: fadeIn 0.2s ease-out; }

 /* ===== MOBILE RESPONSIVE ===== */
 @media(max-width:768px){
   /* Landing navbar */
   .nav-links{display:none !important;}
   .nav-buttons{gap:6px !important;}
   .nav-buttons .btn-signin{padding:7px 10px !important;font-size:13px !important;}
   .nav-buttons .btn-signup{padding:7px 10px !important;font-size:13px !important;}

   /* Hero grid */
   .hero-grid{grid-template-columns:1fr !important;gap:32px !important;padding:40px 5% !important;}
   .hero-right{display:block !important; width:100% !important;}
   .hero-stats{gap:20px !important; flex-wrap: wrap !important;}
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
   .bot-fab { bottom: 90px !important; right: 16px !important; }
   .bot-window { bottom: 90px !important; right: 16px !important; width: calc(100% - 32px) !important; max-height: 70vh !important; }
   .dash-layout{flex-direction:column !important;}
   .dash-sidebar{
     width:100% !important;height:auto !important;position:fixed !important;
     bottom:0 !important;left:0 !important;right:0 !important;z-index:999 !important;
     flex-direction:row !important;padding: 0 0 max(env(safe-area-inset-bottom), 12px) 0 !important;
     border-top:1px solid rgba(255,255,255,0.1) !important;
     background: #1e293b !important;
   }
   .dash-sidebar .sidebar-header{display:none !important;}
   .dash-sidebar .sidebar-footer{display:none !important;}
   .dash-sidebar nav{
     display:flex !important;flex-direction:row !important;
     padding:10px 8px !important;gap:2px !important;
     overflow-x:hidden !important;flex:1 !important;
     justify-content:space-between !important;
   }
   .dash-sidebar nav::-webkit-scrollbar { display: none; }
   .dash-sidebar nav button{
     flex-direction:row !important;
     padding:12px 0 !important;
     min-width:0 !important;
     border-radius:12px !important;
     flex: 1 !important;
     align-items:center !important;
     justify-content:center !important;
     text-align:center !important;
     transition: all 0.2s ease !important;
     background: transparent !important;
   }
   .dash-sidebar nav button[style*="background: rgb(59, 130, 246)"] svg,
   .dash-sidebar nav button[style*="background: #3b82f6"] svg {
     color: #3b82f6 !important;
     transform: scale(1.1) !important;
   }
   .dash-sidebar nav button:active { transform: scale(0.9) !important; opacity: 0.8; }
   .dash-sidebar nav button span.nav-icon{display:flex !important;}
   .dash-sidebar nav button span.nav-icon svg{width:22px !important; height:22px !important;}
   .dash-sidebar nav button span.nav-label{display:none !important;}
   .dash-main{padding-bottom:calc(80px + env(safe-area-inset-bottom)) !important; padding-top: env(safe-area-inset-top) !important;}
   .mobile-logout{display:flex !important;}

   /* App-wide Container Normalization */
   .dash-layout { height: 100dvh !important; width: 100vw !important; }
   .dash-main { overflow-x: hidden !important; width: 100% !important; }
   .fade[style] { padding: 16px !important; padding-bottom: 32px !important; }
   
   /* Force structural multi-column grids to stack securely */
   .fade > div[style*="grid-template-columns: 1fr 1fr"],
   .fade > div[style*="grid-template-columns: repeat(auto-fill"],
   .fade > div[style*="grid-template-columns: 300px 1fr"] {
     grid-template-columns: 1fr !important;
   }
   
   /* Admin Data Tables Mobile Wrapping */
   div[style*="grid-template-columns: 1fr 1fr 1fr auto auto"],
   div[style*="grid-template-columns: 2fr 1fr 1fr 1fr auto"] {
     display: flex !important;
     flex-wrap: wrap !important;
     gap: 16px !important;
     padding: 20px !important;
   }
   /* Hide data table headers on mobile */
   div[style*="text-transform: uppercase"][style*="grid-template-columns: 1fr 1fr 1fr auto auto"],
   div[style*="textTransform: uppercase"][style*="grid-template-columns: 1fr 1fr 1fr auto auto"],
   div[style*="text-transform: uppercase"][style*="grid-template-columns: 2fr 1fr 1fr 1fr auto"],
   div[style*="textTransform: uppercase"][style*="grid-template-columns: 2fr 1fr 1fr 1fr auto"],
   div[style*="grid-template-columns: 1fr 1fr 1fr auto auto"]:first-child,
   div[style*="grid-template-columns: 2fr 1fr 1fr 1fr auto"]:first-child {
     display: none !important;
   }
   
   /* Filter Buttons Mobile Wrapping (ManageDoctors etc) */
   div[style*="display: flex"][style*="gap: 6"] {
     flex-wrap: wrap !important;
   }
   div[style*="display: flex"][style*="gap: 6px"] {
     flex-wrap: wrap !important;
   }
   
   /* Doctor Patients UX Fix */
   .doc-patients-grid {
     display: flex !important;
     flex-direction: column-reverse !important;
   }
   .mobile-stack {
     grid-template-columns: 1fr !important;
   }
   
   /* Cards and forms */
   .page-header{flex-direction:column !important;gap:12px !important;align-items:flex-start !important;}
   .auth-box{padding:24px !important; border-radius: 16px !important;}
   .profile-box{padding:0 20px 24px !important;}
   
   /* Messages Responsive */
   .msg-container { display: flex !important; flex-direction: column !important; min-height: 0 !important; height: calc(100vh - 180px) !important; max-height: none !important; }
   .msg-container.has-selected .msg-sidebar { display: none !important; }
   .msg-container:not(.has-selected) .msg-sidebar { max-height: none !important; height: 100% !important; border-bottom: none !important; }
   .msg-container:not(.has-selected) .msg-chat-area { display: none !important; }
   .msg-chat-area { flex: 1 !important; min-height: 0 !important; display: flex !important; flex-direction: column !important; }
   .mobile-back-btn { display: block !important; }
 }

 .mobile-logout{display:none;}
 .mobile-back-btn { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: #3b82f6; padding-right: 12px; margin-right: 4px; }

 @media(max-width:480px){
   .stats-grid{grid-template-columns:1fr 1fr !important;}
   .specialty-grid{grid-template-columns:repeat(2,1fr) !important;}
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
 <MedicalChatbot />
 </>
 );
}
