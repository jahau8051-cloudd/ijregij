import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981' };

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function WritePrescription({ user, initialAppt, onClear }) {
 const [appointments, setAppointments] = useState([]);
 const [selectedAppt, setSelectedAppt] = useState(null);
 const [medications, setMedications] = useState([{ ...EMPTY_MED }]);
 const [diagnosis, setDiagnosis] = useState('');
 const [notes, setNotes] = useState('');
 const [saving, setSaving] = useState(false);
 const [success, setSuccess] = useState('');

 useEffect(() => {
 if (!user.profileId) return;
 api.getDoctorAppointments(user.profileId).then(data => {
 const eligible = data.filter(a => a.status === 'confirmed' || a.status === 'completed');
 setAppointments(eligible);
 if (initialAppt) {
 setSelectedAppt(eligible.find(a => a.id === initialAppt.id) || initialAppt);
 }
 }).catch(console.error);
 }, [user, initialAppt]);

 const addMed = () => setMedications(m => [...m, { ...EMPTY_MED }]);
 const removeMed = (i) => setMedications(m => m.filter((_, idx) => idx !== i));
 const updateMed = (i, k, v) => setMedications(m => m.map((med, idx) => idx === i ? { ...med, [k]: v } : med));

 const submit = async (e) => {
 e.preventDefault();
 if (!selectedAppt) return alert('Please select an appointment');
 if (medications.some(m => !m.name)) return alert('Fill in all medication names');
 setSaving(true);
 try {
 await api.createPrescription({
 appointmentId: selectedAppt.id,
 patientId: selectedAppt.patient_id,
 doctorId: user.profileId,
 medications,
 diagnosis,
 notes,
 });
 setSuccess('Prescription saved and appointment marked as completed!');
 setTimeout(() => setSuccess(''), 5000);
 setMedications([{ ...EMPTY_MED }]);
 setDiagnosis('');
 setNotes('');
 setSelectedAppt(null);
 onClear?.();
 } catch (e) { alert(e.message); }
 finally { setSaving(false); }
 };

 const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc' };

 return (
 <div className="fade" style={{ padding: 32, maxWidth: 820 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Write Prescription</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Create a digital prescription for your patient</p>
 </div>

 {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{success}</div>}

 <form onSubmit={submit}>
 {/* Select Appointment */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Select Appointment</h2>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
 {appointments.length === 0 && <p style={{ color: C.gray, fontSize: 14 }}>No eligible appointments found. Confirm appointments first.</p>}
 {appointments.map(a => (
 <div key={a.id} onClick={() => setSelectedAppt(a)}
 style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${selectedAppt?.id === a.id ? C.primary : '#e2e8f0'}`, background: selectedAppt?.id === a.id ? '#eff6ff' : '#f8fafc', cursor: 'pointer', transition: 'all .15s' }}>
 <div style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{a.patient_name}</div>
 <div style={{ color: C.gray, fontSize: 12, marginTop: 2 }}>{new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {a.appointment_time?.slice(0,5)}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Diagnosis */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Diagnosis</h2>
 <input style={inputStyle} placeholder="e.g., Hypertension, Type 2 Diabetes..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
 </div>

 {/* Medications */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>Medications</h2>
 <button type="button" onClick={addMed} style={{ padding: '8px 16px', background: `${C.primary}15`, color: C.primary, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Add Medication</button>
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 {medications.map((med, i) => (
 <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
 <span style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>Medication #{i+1}</span>
 {medications.length > 1 && <button type="button" onClick={() => removeMed(i)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Remove</button>}
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4 }}>Drug Name *</label>
 <input style={inputStyle} required placeholder="e.g., Amoxicillin" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4 }}>Dosage *</label>
 <input style={inputStyle} required placeholder="e.g., 500mg" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4 }}>Frequency</label>
 <select style={inputStyle} value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)}>
 <option value="">Select...</option>
 {['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'As needed', 'Weekly'].map(f => <option key={f}>{f}</option>)}
 </select>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4 }}>Duration</label>
 <input style={inputStyle} placeholder="e.g., 7 days, 2 weeks" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
 </div>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4 }}>Special Instructions</label>
 <input style={inputStyle} placeholder="e.g., Take with food, avoid alcohol..." value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Notes */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Doctor's Notes</h2>
 <textarea style={{ ...inputStyle, resize: 'none' }} rows={4} placeholder="Additional notes, follow-up instructions, lifestyle advice..." value={notes} onChange={e => setNotes(e.target.value)} />
 </div>

 <button type="submit" disabled={saving || !selectedAppt} style={{ padding: '14px 40px', background: saving || !selectedAppt ? '#e2e8f0' : C.green, color: saving || !selectedAppt ? C.gray : '#fff', borderRadius: 12, border: 'none', cursor: saving || !selectedAppt ? 'default' : 'pointer', fontWeight: 700, fontSize: 16, transition: 'all .2s' }}>
 {saving ? 'Saving...' : ' Issue Prescription'}
 </button>
 </form>
 </div>
 );
}
