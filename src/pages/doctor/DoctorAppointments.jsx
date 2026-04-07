import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { Calendar, User } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };
const STATUS_COLORS = { pending: { bg: '#fef9c3', c: '#854d0e' }, confirmed: { bg: '#dbeafe', c: '#1d4ed8' }, completed: { bg: '#d1fae5', c: '#065f46' }, cancelled: { bg: '#fee2e2', c: '#991b1b' } };

export default function DoctorAppointments({ user, onPrescribe }) {
 const [appointments, setAppointments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState('upcoming');
 const [success, setSuccess] = useState('');

 const load = async () => {
 if (!user.profileId) return setLoading(false);
 try {
 const data = await api.getDoctorAppointments(user.profileId);
 setAppointments(data);
 } catch (e) { console.error(e); }
 finally { setLoading(false); }
 };

 useEffect(() => { load(); }, [user]);

 const updateStatus = async (id, status) => {
 await api.updateAppointmentStatus(id, status);
 setSuccess(`Appointment ${status}!`);
 setTimeout(() => setSuccess(''), 3000);
 load();
 };

 const now = new Date().toISOString().split('T')[0];
 const upcoming = appointments.filter(a => a.appointment_date?.split('T')[0] >= now && a.status !== 'cancelled');
 const past = appointments.filter(a => a.appointment_date?.split('T')[0] < now || a.status === 'completed');
 const cancelled = appointments.filter(a => a.status === 'cancelled');
 const tabs = [{ id: 'upcoming', label: `Upcoming (${upcoming.length})` }, { id: 'past', label: `Past (${past.length})` }, { id: 'cancelled', label: `Cancelled (${cancelled.length})` }];
 const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Appointments</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Manage your patient appointments</p>
 </div>

 {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{success}</div>}

 <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
 {tabs.map(t => (
 <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === t.id ? C.primary : 'transparent', color: tab === t.id ? '#fff' : C.gray, transition: 'all .15s' }}>{t.label}</button>
 ))}
 </div>

 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
 ) : shown.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Calendar color="#cbd5e1" size={56} strokeWidth={1.5} /></div>
 <p>No {tab} appointments</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
 {shown.map(a => {
 const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
 return (
 <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
 <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}><User size={24} /></div>
 <div style={{ flex: 1 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
 <span style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{a.patient_name}</span>
 <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.c }}>{a.status}</span>
 </div>
 <div style={{ color: C.gray, fontSize: 14 }}>
 {new Date(a.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {a.appointment_time?.slice(0,5)} · {a.type === 'video' ? ' Video' : ' In-Person'}
 </div>
 {a.reason && <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>{a.reason}</div>}
 {a.notes && <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>{a.notes}</div>}
 </div>
 <div style={{ textAlign: 'right', flexShrink: 0 }}>
 <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 8 }}>${a.fee || 0}</div>
 <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
 {a.status === 'pending' && (
 <>
 <button onClick={() => updateStatus(a.id, 'confirmed')} style={{ padding: '7px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✓ Confirm</button>
 <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ padding: '7px 14px', background: '#fee2e2', color: C.red, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✗ Cancel</button>
 </>
 )}
 {a.status === 'confirmed' && (
 <>
 <button onClick={() => onPrescribe(a)} style={{ padding: '7px 14px', background: '#dbeafe', color: C.primary, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Prescribe</button>
 <button onClick={() => updateStatus(a.id, 'completed')} style={{ padding: '7px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✓ Complete</button>
 </>
 )}
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
