import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981' };

export default function Prescriptions({ user }) {
 const [prescriptions, setPrescriptions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selected, setSelected] = useState(null);

 useEffect(() => {
 if (!user.profileId) return setLoading(false);
 api.getPatientPrescriptions(user.profileId).then(data => { setPrescriptions(data); setLoading(false); }).catch(() => setLoading(false));
 }, [user]);

 if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: C.gray }}>Loading...</div>;

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>My Prescriptions</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Your medical prescriptions from doctors</p>
 </div>

 {prescriptions.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '80px 0', color: C.gray }}>
 <div style={{ fontSize: 52, marginBottom: 16 }}>💊</div>
 <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No prescriptions yet</p>
 <p style={{ fontSize: 14 }}>Your prescriptions will appear here after consultations</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 {prescriptions.map(rx => (
 <div key={rx.id} onClick={() => setSelected(selected?.id === rx.id ? null : rx)}
 style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: `2px solid ${selected?.id === rx.id ? C.primary : 'transparent'}`, transition: 'all .2s' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
 <div>
 <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>Dr. {rx.doctor_name}</div>
 <div style={{ color: C.primary, fontSize: 13, marginTop: 2 }}>{rx.specialty}</div>
 </div>
 <div style={{ fontSize: 12, color: C.gray }}>{new Date(rx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
 </div>
 {rx.diagnosis && <div style={{ color: C.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Diagnosis: {rx.diagnosis}</div>}
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
 {(Array.isArray(rx.medications) ? rx.medications : []).map((m, i) => (
 <span key={i} style={{ background: '#eff6ff', color: C.primary, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{m.name}</span>
 ))}
 </div>
 </div>
 ))}
 </div>

 {selected && (
 <div className="slide" style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', height: 'fit-content', position: 'sticky', top: 0 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
 <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Prescription Details</h2>
 <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 16, width: 32, height: 32, borderRadius: '50%' }}>×</button>
 </div>
 <div style={{ marginBottom: 16 }}>
 <div style={{ color: C.gray, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>PRESCRIBING DOCTOR</div>
 <div style={{ fontWeight: 700, color: C.dark }}>Dr. {selected.doctor_name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{selected.specialty}</div>
 </div>
 <div style={{ marginBottom: 16 }}>
 <div style={{ color: C.gray, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>DATE ISSUED</div>
 <div style={{ fontWeight: 600, color: C.dark }}>{new Date(selected.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
 </div>
 {selected.diagnosis && (
 <div style={{ marginBottom: 16 }}>
 <div style={{ color: C.gray, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>DIAGNOSIS</div>
 <div style={{ fontWeight: 600, color: C.dark }}>{selected.diagnosis}</div>
 </div>
 )}
 <div style={{ marginBottom: 16 }}>
 <div style={{ color: C.gray, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>MEDICATIONS</div>
 {(Array.isArray(selected.medications) ? selected.medications : []).map((m, i) => (
 <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #e2e8f0' }}>
 <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>{m.name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>Dosage: {m.dosage}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>Frequency: {m.frequency}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>Duration: {m.duration}</div>
 {m.instructions && <div style={{ color: C.dark, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>📌 {m.instructions}</div>}
 </div>
 ))}
 </div>
 {selected.notes && (
 <div style={{ background: '#fefce8', borderRadius: 10, padding: 14, border: '1px solid #fde68a' }}>
 <div style={{ color: '#854d0e', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>DOCTOR'S NOTES</div>
 <div style={{ color: '#713f12', fontSize: 13 }}>{selected.notes}</div>
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 );
}
