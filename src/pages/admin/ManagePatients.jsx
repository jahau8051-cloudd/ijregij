import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', red: '#ef4444' };

export default function ManagePatients() {
 const [patients, setPatients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');

 const load = () => {
 api.getAllPatients().then(data => { setPatients(data); setLoading(false); }).catch(() => setLoading(false));
 };

 useEffect(() => { load(); }, []);

 const toggleActive = async (userId) => {
 await api.toggleUserActive(userId);
 load();
 };

 const filtered = patients.filter(p => !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()));

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Manage Patients</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>{patients.length} registered patients</p>
 </div>

 <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email..." style={{ width: '100%', maxWidth: 360, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 </div>

 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
 ) : (
 <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
 <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>
 <span>Patient</span><span>Phone</span><span>Appointments</span><span>Member Since</span><span>Active</span>
 </div>
 {filtered.map(p => (
 <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
 <div>
 <div style={{ fontWeight: 700, color: C.dark, fontSize: 15 }}>{p.full_name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{p.email}</div>
 </div>
 <div style={{ fontSize: 14, color: C.dark }}>{p.phone || '–'}</div>
 <div style={{ fontSize: 14, fontWeight: 600, color: C.primary }}>{p.total_appointments || 0} visits</div>
 <div style={{ fontSize: 13, color: C.gray }}>{new Date(p.member_since).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
 <div style={{ width: 40, height: 22, borderRadius: 20, background: p.is_active ? C.green : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'background .2s' }} onClick={() => toggleActive(p.user_id)}>
 <div style={{ position: 'absolute', top: 2, left: p.is_active ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
 </div>
 </div>
 ))}
 {filtered.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: C.gray }}>No patients found</div>}
 </div>
 )}
 </div>
 );
}
