import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { Search, Star, Loader2 } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981' };

function DoctorCard({ doc, onBook }) {
 return (
 <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'transform .2s, box-shadow .2s' }}
 onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
 onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)'; }}>
 <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
 <div style={{ width: 68, height: 68, borderRadius: 16, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
 {doc.specialty_icon || ''}
 </div>
 <div style={{ flex: 1 }}>
 <h3 style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 2 }}>{doc.full_name}</h3>
 <div style={{ color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{doc.specialty_name || 'General Practice'}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{doc.clinic_name || 'Private Clinic'}</div>
 </div>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
 {[
 { label: 'Rating', value: `${parseFloat(doc.rating || 0).toFixed(1)}` },
 { label: 'Experience', value: `${doc.experience_years || 0}y` },
 { label: 'Reviews', value: doc.total_reviews || 0 },
 ].map(s => (
 <div key={s.label} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '10px 8px' }}>
 <div style={{ fontWeight: 700, color: C.dark, fontSize: 16 }}>{s.value}</div>
 <div style={{ color: C.gray, fontSize: 11 }}>{s.label}</div>
 </div>
 ))}
 </div>
 {doc.bio && <p style={{ color: C.gray, fontSize: 13, lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.bio}</p>}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>${doc.consultation_fee}<span style={{ fontSize: 13, fontWeight: 400, color: C.gray }}>/visit</span></div>
 <button onClick={() => onBook(doc)} style={{ background: C.primary, color: '#fff', padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Book Now</button>
 </div>
 </div>
 );
}

export default function FindDoctor({ user, onBook }) {
 const [doctors, setDoctors] = useState([]);
 const [specialties, setSpecialties] = useState([]);
 const [search, setSearch] = useState('');
 const [specialty, setSpecialty] = useState('all');
 const [maxFee, setMaxFee] = useState('');
 const [minRating, setMinRating] = useState('');
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 api.getSpecialties().then(setSpecialties).catch(console.error);
 }, []);

 useEffect(() => {
 setLoading(true);
 const t = setTimeout(() => {
 const params = {};
 if (search) params.search = search;
 if (specialty !== 'all') params.specialty = specialty;
 if (maxFee) params.maxFee = maxFee;
 if (minRating) params.minRating = minRating;
 api.getDoctors(params).then(data => { setDoctors(data); setLoading(false); }).catch(() => setLoading(false));
 }, 350);
 return () => clearTimeout(t);
 }, [search, specialty, maxFee, minRating]);

 const selectStyle = { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, background: '#fff', outline: 'none', color: C.dark };

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Find a Doctor</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Discover specialists matching your requirements</p>
 </div>

 {/* Filters */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
 <div style={{ flex: '2 1 220px', position: 'relative' }}>
 <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><Search size={18} color="#94a3b8" /></span>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Cardiologist," style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', color: C.dark }} />
 </div>
 <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={{ ...selectStyle, flex: '1 1 160px' }}>
 <option value="all">All Specialties</option>
 {specialties.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
 </select>
 <select value={minRating} onChange={e => setMinRating(e.target.value)} style={{ ...selectStyle, flex: '1 1 130px' }}>
 <option value="">Any Rating</option>
 <option value="4.5">4.5+ ⭐</option>
 <option value="4">4.0+ ⭐</option>
 <option value="3">3.0+ ⭐</option>
 </select>
 <select value={maxFee} onChange={e => setMaxFee(e.target.value)} style={{ ...selectStyle, flex: '1 1 130px' }}>
 <option value="">Any Price</option>
 <option value="50">Under $50</option>
 <option value="100">Under $100</option>
 <option value="150">Under $150</option>
 </select>
 {(search || specialty !== 'all' || maxFee || minRating) && (
 <button onClick={() => { setSearch(''); setSpecialty('all'); setMaxFee(''); setMinRating(''); }} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: C.gray, fontSize: 13, cursor: 'pointer' }}>
 Clear ×
 </button>
 )}
 </div>

 {/* Results */}
 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Loader2 size={40} className="spin" color={C.primary} /></div>
 <p style={{ fontSize: 15, fontWeight: 500 }}>Retrieving specialists...</p>
 </div>
 ) : doctors.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Search size={48} color="#cbd5e1" strokeWidth={1.5} /></div>
 <p style={{ fontSize: 17, marginBottom: 8, fontWeight: 600, color: C.dark }}>No doctors found</p>
 <p style={{ fontSize: 14 }}>Try adjusting your search filters</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
 {doctors.map(d => <DoctorCard key={d.id} doc={d} onBook={onBook} />)}
 </div>
 )}
 </div>
 );
}
