import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', green: '#10b981', orange: '#f59e0b', red: '#ef4444', gray: '#64748b' };

function StatCard({ icon, label, value, color, sub }) {
 return (
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
 <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
 <div>
 <div style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>{value}</div>
 <div style={{ fontSize: 13, color: C.gray }}>{label}</div>
 {sub && <div style={{ fontSize: 12, color: color, marginTop: 2 }}>{sub}</div>}
 </div>
 </div>
 );
}

import { Calendar, History, FileText, Heart, Activity } from 'lucide-react';

export default function PatientHome({ user, onNav, onBook }) {
 const [appointments, setAppointments] = useState([]);
 const [prescriptions, setPrescriptions] = useState([]);
 const [doctors, setDoctors] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 (async () => {
 try {
 if (user.profileId) {
 const [appts, rxs] = await Promise.all([
 api.getPatientAppointments(user.profileId),
 api.getPatientPrescriptions(user.profileId),
 ]);
 setAppointments(appts);
 setPrescriptions(rxs);
 }
 const docs = await api.getDoctors({ limit: 4 });
 setDoctors(docs.slice(0, 4));
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 })();
 }, [user]);

 const upcoming = appointments.filter(a => a.status !== 'cancelled' && new Date(a.appointment_date) >= new Date());
 const past = appointments.filter(a => a.status === 'completed');
 const active_rx = prescriptions.length;

 if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 24 }}> Loading...</div>;

 return (
 <div className="fade" style={{ padding: 32 }}>
 {/* Header */}
 <div style={{ marginBottom: 28 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Dashboard Overview</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Here's your health overview for today.</p>
 </div>

 {/* Stats */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
 <StatCard icon={<Calendar size={24} />} label="Upcoming Appointments" value={upcoming.length} color={C.primary} sub={upcoming.length > 0 ? `Next: ${new Date(upcoming[0]?.appointment_date).toLocaleDateString()}` : 'No upcoming'} />
 <StatCard icon={<History size={24} />} label="Past Consultations" value={past.length} color={C.green} />
 <StatCard icon={<FileText size={24} />} label="Active Prescriptions" value={active_rx} color={C.orange} />
 <StatCard icon={<Heart size={24} />} label="Health Score" value="Good" color={C.red} sub="Based on your records" />
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
 {/* Upcoming Appointments */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
 <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark }}>Upcoming Appointments</h2>
 <button onClick={() => onNav('appointments')} style={{ color: C.primary, fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
 </div>
 {upcoming.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '32px 0', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Calendar color="#cbd5e1" size={48} strokeWidth={1.5} /></div>
 <p style={{ marginBottom: 16 }}>No upcoming appointments</p>
 <button onClick={() => onNav('find')} style={{ background: C.primary, color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Find a Doctor</button>
 </div>
 ) : upcoming.slice(0, 3).map(a => (
 <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
 <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{a.specialty_icon || ''}</div>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{a.doctor_name}</div>
 <div style={{ color: C.gray, fontSize: 12 }}>{a.specialty} · {a.type}</div>
 </div>
 <div style={{ textAlign: 'right' }}>
 <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
 <div style={{ fontSize: 12, color: C.gray }}>{a.appointment_time?.slice(0, 5)}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Find a Doctor */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
 <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark }}>Top Doctors</h2>
 <button onClick={() => onNav('find')} style={{ color: C.primary, fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
 </div>
 {doctors.map(d => (
 <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
 <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{d.specialty_icon || ''}</div>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{d.full_name}</div>
 <div style={{ color: C.gray, fontSize: 12 }}>{d.specialty_name} · {d.rating}</div>
 </div>
 <button onClick={() => onBook(d)} style={{ background: C.primary, color: '#fff', padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Book</button>
 </div>
 ))}
 </div>
 </div>

 {/* Recent Prescriptions */}
 {prescriptions.length > 0 && (
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginTop: 24 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
 <h2 style={{ fontSize: 17, fontWeight: 700, color: C.dark }}>Recent Prescriptions</h2>
 <button onClick={() => onNav('prescriptions')} style={{ color: C.primary, fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
 {prescriptions.slice(0, 3).map(rx => (
 <div key={rx.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
 <span style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>Dr. {rx.doctor_name}</span>
 <span style={{ fontSize: 11, color: C.gray }}>{new Date(rx.created_at).toLocaleDateString()}</span>
 </div>
 <div style={{ color: C.gray, fontSize: 13, marginBottom: 8 }}>{rx.diagnosis || 'Prescription'}</div>
 {Array.isArray(rx.medications) && rx.medications.slice(0, 2).map((m, i) => (
 <div key={i} style={{ fontSize: 12, color: C.dark, background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, marginBottom: 4 }}>{m.name} — {m.dosage}</div>
 ))}
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
