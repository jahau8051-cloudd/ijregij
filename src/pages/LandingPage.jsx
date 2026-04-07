import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { Search, Calendar, CreditCard, MessageSquare, FileText, FolderOpen, Activity, Brain, Sun, Bone, Smile, Eye, Stethoscope, Star, ChevronRight, User } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', navy: '#1e293b', green: '#10b981', gray: '#64748b', lightBg: '#f8fafc' };

const SPECIALTIES = [
 { icon: <Activity size={24} />, name: 'Cardiology' }, { icon: <Brain size={24} />, name: 'Neurology' },
 { icon: <Sun size={24} />, name: 'Dermatology' }, { icon: <Bone size={24} />, name: 'Orthopedics' },
 { icon: <Smile size={24} />, name: 'Pediatrics' }, { icon: <MessageSquare size={24} />, name: 'Psychiatry' },
 { icon: <Eye size={24} />, name: 'Ophthalmology' }, { icon: <Stethoscope size={24} />, name: 'General Practice' },
];

const FEATURES = [
 { icon: <Search size={30} color={C.primary} />, title: 'Find the right doctor', desc: 'Filter by specialty, availability and consultation fee to find someone who fits your needs.' },
 { icon: <Calendar size={30} color={C.primary} />, title: 'Book in seconds', desc: 'Pick a time that works for you and get an instant confirmation. No phone calls, no waiting.' },
 { icon: <CreditCard size={30} color={C.primary} />, title: 'Pay online', desc: 'Settle your consultation fee at booking so you can just show up and focus on your health.' },
 { icon: <MessageSquare size={30} color={C.primary} />, title: 'Message your doctor', desc: 'Have a quick question? Send a message directly from your dashboard without booking a full appointment.' },
 { icon: <FileText size={30} color={C.primary} />, title: 'Prescriptions, digitally', desc: 'Your doctor sends prescriptions straight to your account — no more chasing paper copies.' },
 { icon: <FolderOpen size={30} color={C.primary} />, title: 'Your records, in one place', desc: 'Past visits, prescriptions, lab notes — all neatly organized so nothing gets lost.' },
];

const HOW = [
 { num: '01', title: 'Create a free account', desc: 'Sign up in under a minute. No subscription, no credit card needed to get started.' },
 { num: '02', title: 'Find a specialist', desc: 'Browse doctors, read patient reviews, and check real-time availability.' },
 { num: '03', title: 'Book and pay', desc: 'Pick a slot that suits you, pay online, and you\'re set.' },
 { num: '04', title: 'Attend your appointment', desc: 'Show up in person or join a video call — whatever works best for you.' },
];

export default function LandingPage({ onNav }) {
 const [searchQ, setSearchQ] = useState('');
 const [doctors, setDoctors] = useState([]);
 const [selectedDocId, setSelectedDocId] = useState(null);
 const [docProfile, setDocProfile] = useState(null);

  useEffect(() => {
  api.getAllDoctors().then(docs => {
  setDoctors(docs.filter(d => d.status === 'approved'));
  }).catch(console.error);
  }, []);

  const displayedDocs = doctors.filter(d => {
  if (!searchQ.trim()) return true;
  const q = searchQ.toLowerCase();
  return (d.full_name || '').toLowerCase().includes(q) || 
         (d.specialty_name || '').toLowerCase().includes(q) || 
         (d.clinic_name || '').toLowerCase().includes(q);
  });
  
  const renderDocs = searchQ.trim() ? displayedDocs : displayedDocs.slice(0, 8);
  
  const handleSearch = () => {
    document.getElementById('featured-doctors')?.scrollIntoView({ behavior: 'smooth' });
  };

 const openProfile = async (id) => {
 setSelectedDocId(id);
 setDocProfile(null);
 try {
 const data = await api.getDoctor(id);
 setDocProfile(data);
 } catch (err) { console.error(err); }
 };

 const nav = { position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', padding: '0 6%', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100, borderBottom: '1px solid #e2e8f0' };

 return (
 <div style={{ background: C.lightBg }}>
 {/* NAV */}
 <nav style={nav}>
 <div onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 21, fontWeight: 800, color: C.primary, cursor: 'pointer' }}>
 <span></span> MediDash
 </div>
 <div className="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
 <span onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{ color: C.navy, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Home</span>
 <span onClick={() => document.getElementById('featured-doctors')?.scrollIntoView({behavior: 'smooth'})} style={{ color: C.navy, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Find Doctors</span>
 <span onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior: 'smooth'})} style={{ color: C.navy, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>How It Works</span>
 </div>
 <div className="nav-buttons" style={{ display: 'flex', gap: 10 }}>
 <button className="btn-signin" style={{ border: `2px solid ${C.primary}`, color: C.primary, padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: 'transparent', cursor: 'pointer' }} onClick={() => onNav('signin')}>Sign In</button>
 <button className="btn-signup" style={{ background: C.primary, color: '#fff', padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }} onClick={() => onNav('signup')}>Get Started</button>
 </div>
 </nav>

 {/* HERO */}
 <section style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.dark} 0%, #1e3a6e 55%, ${C.primary} 100%)`, display: 'flex', alignItems: 'center', paddingTop: 68 }}>
 <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 6%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%' }}>
 <div className="fade">
 <span style={{ display: 'inline-block', background: 'rgba(59,130,246,0.25)', color: '#93c5fd', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
 Healthcare made simple
 </span>
 <h1 style={{ fontSize: 'clamp(34px,5vw,58px)', fontWeight: 800, color: '#fff', lineHeight: 1.18, marginBottom: 22 }}>
 Your health, <br />sorted.
 </h1>
 <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
 Book appointments with verified doctors, get digital prescriptions, and keep your medical history in one place.
 </p>
 <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
 <button style={{ padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16, background: C.primary, color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => onNav('signup')}>
 Create free account →
 </button>
 <button style={{ padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }} onClick={() => onNav('signin')}>
 Sign in
 </button>
 </div>
 <div className="hero-stats" style={{ marginTop: 44, display: 'flex', gap: 36 }}>
 {[{ value: '500+', label: 'Verified doctors' }, { value: '50K+', label: 'Patients' }, { value: '200K+', label: 'Appointments' }].map(s => (
 <div key={s.label}>
 <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{s.value}</div>
 <div style={{ color: '#94a3b8', fontSize: 12 }}>{s.label}</div>
 </div>
 ))}
 </div>
 </div>

 <div className="fade hero-right">
 <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 30, border: '1px solid rgba(255,255,255,0.15)' }}>
 <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Search for a doctor</h3>
 <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 18, marginBottom: 18 }}>
 <div style={{ position: 'relative', marginBottom: 10 }}>
 <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><Search size={18} color="#94a3b8" /></span>
 <input
 style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 8, border: 'none', outline: 'none', fontSize: 14, background: 'rgba(255,255,255,0.9)' }}
 placeholder="e.g. Cardiologist, Dr. Ahmed Khalil..."
 value={searchQ}
 onChange={e => setSearchQ(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && handleSearch()}
 />
 </div>
 <button style={{ width: '100%', padding: '12px', background: C.primary, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }} onClick={handleSearch}>
 Search Doctors
 </button>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
 {SPECIALTIES.slice(0, 6).map(sp => (
 <span key={sp.name} onClick={() => { setSearchQ(sp.name); handleSearch(); }} style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0', padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
 {React.cloneElement(sp.icon, { size: 14 })} {sp.name}
 </span>
 ))}
 </div>
 <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
 <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, letterSpacing: '.5px', marginBottom: 10 }}>HOW IT WORKS</div>
 {['Register as a patient', 'Find and book a doctor', 'Attend your appointment'].map((s, i) => (
 <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
 <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
 <span style={{ color: '#e2e8f0', fontSize: 13 }}>{s}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* STATS BAR */}
 <div style={{ background: C.dark, padding: '52px 6%' }}>
 <div className="stats-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, textAlign: 'center' }}>
 {[{ value: '500+', label: 'Verified doctors' }, { value: '50K+', label: 'Active patients' }, { value: '200K+', label: 'Appointments booked' }, { value: '4.9★', label: 'Average rating' }].map(s => (
 <div key={s.label}>
 <div style={{ fontSize: 38, fontWeight: 800, color: C.primary }}>{s.value}</div>
 <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>{s.label}</div>
 </div>
 ))}
 </div>
 </div>

 {/* SPECIALTIES */}
 <div style={{ background: '#fff', padding: '80px 6%' }}>
 <div style={{ maxWidth: 1200, margin: '0 auto' }}>
 <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: C.dark, textAlign: 'center', marginBottom: 10 }}>Browse by specialty</h2>
 <p style={{ color: C.gray, textAlign: 'center', fontSize: 16, marginBottom: 48, lineHeight: 1.7 }}>From routine check-ups to specialist consultations — we've got you covered.</p>
 <div className="specialty-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 16 }}>
 {SPECIALTIES.map(sp => (
 <div key={sp.name} onClick={() => { setSearchQ(sp.name); handleSearch(); }}
 style={{ textAlign: 'center', padding: '26px 14px', background: C.lightBg, borderRadius: 14, cursor: 'pointer', transition: 'all .2s', border: '2px solid transparent' }}
 onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = C.primary; }}
 onMouseOut={e => { e.currentTarget.style.background = C.lightBg; e.currentTarget.style.borderColor = 'transparent'; }}>
 <div style={{ fontSize: 34, marginBottom: 10, display: 'flex', justifyContent: 'center', color: C.primary }}>{sp.icon}</div>
 <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{sp.name}</div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* TOP DOCTORS */}
 {doctors.length > 0 && (
 <div id="featured-doctors" style={{ background: searchQ.trim() && renderDocs.length === 0 ? '#fff' : C.lightBg, padding: '80px 6%', minHeight: 400 }}>
 <div style={{ maxWidth: 1200, margin: '0 auto' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
 <div>
 <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: C.dark, marginBottom: 10 }}>
 {searchQ.trim() ? `Search Results for "${searchQ}"` : 'Featured specialists'}
 </h2>
 <p style={{ color: C.gray, fontSize: 16 }}>
 {searchQ.trim() ? `Found ${renderDocs.length} matching professional${renderDocs.length === 1 ? '' : 's'}.` : 'Book appointments with top-rated medical professionals natively available in your area.'}
 </p>
 </div>
 {searchQ.trim() ? (
 <button onClick={() => setSearchQ('')} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: C.navy, padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.background='#f1f5f9'}>
 Clear Search
 </button>
 ) : (
 <button onClick={() => { setSearchQ(''); handleSearch(); }} style={{ background: 'transparent', border: 'none', color: C.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
 View all doctors <ChevronRight size={18} />
 </button>
 )}
 </div>
 {renderDocs.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: 24, border: '2px dashed #e2e8f0' }}>
 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Search size={56} color="#cbd5e1" strokeWidth={1.5} /></div>
 <h3 style={{ fontSize: 22, fontWeight: 800, color: C.dark, marginBottom: 10 }}>No doctors found</h3>
 <p style={{ color: C.gray, fontSize: 16, maxWidth: 400, margin: '0 auto' }}>Try adjusting your search terms, removing filters, or checking another medical specialty.</p>
 </div>
 ) : (
 <div className="doctor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
 {renderDocs.map(d => (
 <div key={d.id} className="fade" onClick={() => openProfile(d.id)} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'transform .2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
 <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>
 <Stethoscope size={28} />
 </div>
 <div style={{ overflow: 'hidden' }}>
 <div style={{ fontWeight: 800, fontSize: 17, color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.full_name}</div>
 <div style={{ color: C.primary, fontSize: 13, fontWeight: 600 }}>{d.specialty_name || 'Specialist'}</div>
 </div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 13, color: C.gray }}>
 <Star size={14} color="#f59e0b" fill="#f59e0b" />
 <span style={{ fontWeight: 700, color: C.dark }}>{d.rating > 0 ? parseFloat(d.rating).toFixed(1) : 'New'}</span>
 <span>({d.total_reviews || 0} reviews)</span>
 </div>
 <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
 <div style={{ fontWeight: 800, color: C.dark, fontSize: 18 }}>${d.consultation_fee || 100}</div>
 <button style={{ background: '#f8fafc', color: C.primary, padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, border: `1.5px solid #e2e8f0`, cursor: 'pointer' }}>
 Book visit
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* HOW IT WORKS */}
 <div id="how-it-works" style={{ padding: '80px 6%', background: doctors.length > 0 ? '#fff' : C.lightBg }}>
 <div style={{ maxWidth: 1200, margin: '0 auto' }}>
 <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: C.dark, textAlign: 'center', marginBottom: 10 }}>How it works</h2>
 <p style={{ color: C.gray, textAlign: 'center', fontSize: 16, marginBottom: 52, lineHeight: 1.7 }}>Getting care should be simple. Here's how MediDash gets you treated faster.</p>
 <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
 {HOW.map((h, i) => (
 <div key={h.num} style={{ background: '#fff', borderRadius: 16, padding: 32, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
 <div style={{ fontSize: 64, fontWeight: 800, color: '#f8fafc', position: 'absolute', top: 12, right: 18, lineHeight: 1, zIndex: 0 }}>{h.num}</div>
 <div style={{ position: 'relative', zIndex: 1 }}>
 <div style={{ width: 48, height: 48, borderRadius: 12, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: C.primary }}>
 {i === 0 ? <User size={24} /> : i === 1 ? <Search size={24} /> : i === 2 ? <CreditCard size={24} /> : <Calendar size={24} />}
 </div>
 <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 10 }}>{h.title}</h3>
 <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7 }}>{h.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* FEATURES */}
 <div style={{ background: '#fff', padding: '80px 6%' }}>
 <div style={{ maxWidth: 1200, margin: '0 auto' }}>
 <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: C.dark, textAlign: 'center', marginBottom: 10 }}>Everything in one place</h2>
 <p style={{ color: C.gray, textAlign: 'center', fontSize: 16, marginBottom: 52, lineHeight: 1.7 }}>No more juggling between apps and paper records.</p>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 }}>
 {FEATURES.map(f => (
 <div key={f.title} style={{ padding: 28, borderRadius: 14, border: '1px solid #e2e8f0', background: C.lightBg }}>
 <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
 <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{f.title}</h3>
 <p style={{ color: C.gray, fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* CTA */}
 <div style={{ background: `linear-gradient(135deg, ${C.dark}, #1e3a6e)`, padding: '80px 6%', textAlign: 'center' }}>
 <h2 style={{ fontSize: 'clamp(26px,5vw,42px)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>Ready to get started?</h2>
 <p style={{ color: '#94a3b8', fontSize: 17, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
 Join thousands of patients already using MediDash to manage their healthcare.
 </p>
 <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
 <button onClick={() => onNav('signup')} style={{ background: C.primary, color: '#fff', padding: '14px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>
 Create free account
 </button>
 <button onClick={() => onNav('signin')} style={{ background: 'transparent', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 15, border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
 Sign in
 </button>
 </div>
 </div>

 {/* FOOTER */}
 <div style={{ background: C.dark, padding: '36px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
 <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>MediDash</div>
 <p style={{ color: '#475569', fontSize: 13 }}>© 2025 MediDash. Built for people, not paperwork.</p>
 <div style={{ display: 'flex', gap: 20 }}>
 {['Privacy', 'Terms', 'Contact'].map(l => (
 <span key={l} style={{ color: '#475569', fontSize: 13, cursor: 'pointer' }}>{l}</span>
 ))}
 </div>
 </div>

 {/* DOCTOR PROFILE OVERLAY */}
 {selectedDocId && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
 <div className="slide" style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
 {!docProfile ? (
 <div style={{ padding: 100, textAlign: 'center', color: C.gray, fontSize: 15, fontWeight: 600 }}>Loading profile...</div>
 ) : (
 <div>
 <div style={{ height: 160, background: `linear-gradient(135deg, ${C.navy}, ${C.primary})`, borderRadius: '24px 24px 0 0' }} />
 <div style={{ padding: '0 40px 40px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: -50, marginBottom: 24 }}>
 <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#fff', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
 <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
 <Stethoscope size={44} />
 </div>
 </div>
 <button onClick={() => {setSelectedDocId(null); setDocProfile(null)}} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 64, backdropFilter: 'blur(4px)' }}>
 ✕
 </button>
 </div>
 
 <h2 style={{ fontSize: 32, fontWeight: 800, color: C.dark, marginBottom: 4 }}>{docProfile.full_name}</h2>
 <div style={{ fontSize: 18, fontWeight: 600, color: C.primary, marginBottom: 20 }}>{docProfile.specialty_name || 'Specialist'}</div>
 
 <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap', padding: '16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.dark, fontWeight: 700, fontSize: 15 }}><Star size={20} color="#f59e0b" fill="#f59e0b" /> {docProfile.rating > 0 ? parseFloat(docProfile.rating).toFixed(1) : 'New'} <span style={{color: C.gray, fontWeight: 500, fontSize: 13}}>({docProfile.total_reviews || 0} reviews)</span></div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.gray, fontSize: 15, fontWeight: 500 }}><Calendar size={20} /> {docProfile.experience_years} Years Exp.</div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.gray, fontSize: 15, fontWeight: 500 }}><Activity size={20} /> ${docProfile.consultation_fee} / visit</div>
 </div>
 
 <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 12 }}>About</h3>
 <p style={{ color: C.gray, fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>{docProfile.bio || 'This doctor has not provided a biographical statement yet.'}</p>
 
 <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Clinic Information</h3>
 <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 40 }}>
 <strong style={{ display: 'block', fontSize: 16, color: C.navy, marginBottom: 4 }}>{docProfile.clinic_name || 'Independent Practice'}</strong>
 <span style={{ color: C.gray, fontSize: 15 }}>{docProfile.clinic_address || 'Address not listed'}</span>
 </div>
 
 <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.navy})`, padding: 32, borderRadius: 20, textAlign: 'center' }}>
 <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Ready to book?</h3>
 <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>Create a free patient account in seconds to schedule a verified appointment with {docProfile.full_name}.</p>
 <button onClick={() => onNav('signup')} style={{ background: C.primary, color: '#fff', padding: '16px 40px', borderRadius: 12, fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', transition: 'transform 0.2s', width: '100%', maxWidth: 300 }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
 Create Account & Book
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 </div>
 );
}
