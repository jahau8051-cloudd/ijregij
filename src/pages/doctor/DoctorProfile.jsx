import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b' };

export default function DoctorProfile({ user }) {
 const [specialties, setSpecialties] = useState([]);
 const [form, setForm] = useState({ bio: '', specialtyId: '', consultationFee: '', experienceYears: '', clinicName: '', clinicAddress: '', availableDays: 'Mon,Tue,Wed,Thu,Fri', availableFrom: '09:00', availableTo: '17:00', licenseNumber: '', education: '' });
 const [saving, setSaving] = useState(false);
 const [success, setSuccess] = useState('');

 useEffect(() => {
 api.getSpecialties().then(setSpecialties).catch(console.error);
 if (user.profileId) {
 api.getDoctor(user.profileId).then(d => {
 setForm({
 bio: d.bio || '', specialtyId: d.specialty_id || '', consultationFee: d.consultation_fee || '',
 experienceYears: d.experience_years || '', clinicName: d.clinic_name || '',
 clinicAddress: d.clinic_address || '', availableDays: d.available_days || 'Mon,Tue,Wed,Thu,Fri',
 availableFrom: d.available_from?.slice(0,5) || '09:00', availableTo: d.available_to?.slice(0,5) || '17:00',
 licenseNumber: d.license_number || '', education: d.education || '',
 });
 }).catch(console.error);
 }
 }, [user]);

 const save = async (e) => {
 e.preventDefault();
 setSaving(true);
 try {
 await api.updateDoctor(user.profileId, form);
 setSuccess('Profile updated!');
 setTimeout(() => setSuccess(''), 3000);
 } catch (e) { alert(e.message); }
 finally { setSaving(false); }
 };

 const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
 const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc' };
 const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

 return (
 <div className="fade" style={{ padding: 32, maxWidth: 760 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Doctor Profile</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Update your professional information</p>
 </div>

 {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{success}</div>}

 <form onSubmit={save}>
 <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20 }}> Professional Info</h2>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Specialty</label>
 <select style={inputStyle} value={form.specialtyId} onChange={set('specialtyId')}>
 <option value="">Select specialty...</option>
 {specialties.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
 </select>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Consultation Fee ($)</label>
 <input type="number" style={inputStyle} value={form.consultationFee} onChange={set('consultationFee')} placeholder="100" />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Years of Experience</label>
 <input type="number" style={inputStyle} value={form.experienceYears} onChange={set('experienceYears')} placeholder="10" />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>License Number</label>
 <input style={inputStyle} value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="MD12345" />
 </div>
 </div>
 <div style={{ marginBottom: 16 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Bio / About</label>
 <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell patients about yourself, your approach, specializations..." />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Education</label>
 <input style={inputStyle} value={form.education} onChange={set('education')} placeholder="e.g., MD from Cairo University, Board Certified" />
 </div>
 </div>

 <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20 }}> Clinic Information</h2>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Clinic Name</label>
 <input style={inputStyle} value={form.clinicName} onChange={set('clinicName')} placeholder="City Medical Center" />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Clinic Address</label>
 <input style={inputStyle} value={form.clinicAddress} onChange={set('clinicAddress')} placeholder="123 Main St, City, State" />
 </div>
 </div>
 </div>

 <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20 }}>Availability</h2>
 <div style={{ marginBottom: 16 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 10 }}>Working Days</label>
 <div style={{ display: 'flex', gap: 8 }}>
 {days.map(d => {
 const active = form.availableDays?.includes(d);
 return (
 <button key={d} type="button" onClick={() => {
 const current = form.availableDays?.split(',').filter(Boolean) || [];
 const updated = active ? current.filter(x => x !== d) : [...current, d];
 setForm(f => ({ ...f, availableDays: updated.join(',') }));
 }} style={{ padding: '8px 14px', borderRadius: 8, border: `2px solid ${active ? C.primary : '#e2e8f0'}`, background: active ? '#eff6ff' : '#f8fafc', color: active ? C.primary : C.gray, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{d}</button>
 );
 })}
 </div>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Start Time</label>
 <input type="time" style={inputStyle} value={form.availableFrom} onChange={set('availableFrom')} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>End Time</label>
 <input type="time" style={inputStyle} value={form.availableTo} onChange={set('availableTo')} />
 </div>
 </div>
 </div>

 <button type="submit" disabled={saving} style={{ padding: '14px 40px', background: C.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, opacity: saving ? 0.7 : 1 }}>
 {saving ? 'Saving...' : 'Save Profile'}
 </button>
 </form>
 </div>
 );
}
