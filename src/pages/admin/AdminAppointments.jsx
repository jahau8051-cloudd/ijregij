import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };
const STATUS_COLORS = { pending: { bg: '#fef9c3', c: '#854d0e' }, confirmed: { bg: '#dbeafe', c: '#1d4ed8' }, completed: { bg: '#d1fae5', c: '#065f46' }, cancelled: { bg: '#fee2e2', c: '#991b1b' } };

export default function AdminAppointments() {
 const [appointments, setAppointments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState('all');

 useEffect(() => {
 api.getAllAppointments().then(data => { setAppointments(data); setLoading(false); }).catch(() => setLoading(false));
 }, []);

 const filtered = appointments.filter(a => {
 const matchSearch = !search || a.patient_name?.toLowerCase().includes(search.toLowerCase()) || a.doctor_name?.toLowerCase().includes(search.toLowerCase());
 const matchFilter = filter === 'all' || a.status === filter;
 return matchSearch && matchFilter;
 });

 const counts = { all: appointments.length };
 ['pending','confirmed','completed','cancelled'].forEach(s => { counts[s] = appointments.filter(a => a.status === s).length; });

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>All Appointments</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>{appointments.length} total appointments</p>
 </div>

 <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search..." style={{ flex: '1 1 220px', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 {Object.entries(counts).map(([s, count]) => (
 <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${filter === s ? C.primary : '#e2e8f0'}`, background: filter === s ? '#eff6ff' : '#f8fafc', color: filter === s ? C.primary : C.gray, fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>{s} ({count})</button>
 ))}
 </div>

 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
 ) : (
 <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
 <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 100px 120px', gap: 16, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>
 <span>Patient</span><span>Doctor</span><span>Date & Time</span><span>Type</span><span style={{ textAlign: 'center' }}>Status</span>
 </div>
 {filtered.map(a => {
 const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
 return (
 <div key={a.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 100px 120px', gap: 16, alignItems: 'center' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
 <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray }}>
 {a.patient_avatar ? <img src={a.patient_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p"/> : (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
 )}
 </div>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{a.patient_name}</div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
 <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
 {a.doctor_avatar ? <img src={a.doctor_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="d"/> : (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H7M19 9H5M21 13H3M19 17H5M17 21H7"/></svg>
 )}
 </div>
 <div>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{a.doctor_name}</div>
 <div style={{ color: C.gray, fontSize: 11 }}>{a.specialty}</div>
 </div>
 </div>
 <div>
 <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>{new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
 <div style={{ fontSize: 12, color: C.gray }}>{a.appointment_time?.slice(0,5)}</div>
 </div>
 <div style={{ fontSize: 12, color: C.gray, textTransform: 'capitalize' }}>{a.type}</div>
 <div style={{ display: 'flex', justifyContent: 'center' }}>
 <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.c, textTransform: 'capitalize', whiteSpace: 'nowrap', minWidth: 80, textAlign: 'center' }}>{a.status}</span>
 </div>
 </div>
 );
 })}
 {filtered.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: C.gray }}>No appointments found</div>}
 </div>
 )}
 </div>
 );
}
