import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { Lock, User } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b' };

export default function DoctorProfile({ user }) {
 const [specialties, setSpecialties] = useState([]);
 const [form, setForm] = useState({ bio: '', specialtyId: '', consultationFee: '', experienceYears: '', clinicName: '', clinicAddress: '', availableDays: 'Mon,Tue,Wed,Thu,Fri', availableFrom: '09:00', availableTo: '17:00', licenseNumber: '', education: '' });
 const [saving, setSaving] = useState(false);
 const [success, setSuccess] = useState('');
 const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
 const [pwdSaving, setPwdSaving] = useState(false);
 const [pwdError, setPwdError] = useState('');

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

 const updatePassword = async (e) => {
 e.preventDefault();
 if (pwdForm.newPassword !== pwdForm.confirmPassword) return setPwdError('Passwords do not match');
 setPwdSaving(true);
 try {
 await api.updatePassword(user.id, pwdForm);
 setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
 setPwdError('');
 alert('Password updated successfully');
 } catch (e) { setPwdError(e.message); }
 finally { setPwdSaving(false); }
 };

 const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
 const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc' };
 const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

 const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Image must be less than 2MB");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = ev.target.result;
        await api.updateAvatar(user.id, base64);
        
        const lsUser = JSON.parse(localStorage.getItem('medidash_user'));
        lsUser.avatar = base64;
        localStorage.setItem('medidash_user', JSON.stringify(lsUser));
        
        // Doctor profiles don't fetch 'avatar' in the doctor table, it's in the 'users' table, so it relies on 'user.avatar' primarily.
        window.location.reload(); // Quick global refresh to update sidebar & header
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

 return (
 <div className="fade" style={{ padding: 32, maxWidth: 760 }}>
 <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Doctor Profile</h1>
      <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Update your professional information</p>
    </div>
    <div style={{ position: 'relative' }} title="Change Avatar">
      <label style={{ display: 'block', cursor: 'pointer', overflow: 'hidden', borderRadius: '50%', width: 70, height: 70, background: '#e2e8f0', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray }}>
            <User size={32} />
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
      </label>
      <div style={{ position: 'absolute', bottom: -2, right: -2, background: C.primary, color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, pointerEvents: 'none', fontWeight: 700 }}>Edit</div>
      {user.avatar && (
        <button type="button" onClick={async () => {
          await api.updateAvatar(user.id, null);
          const lsUser = JSON.parse(localStorage.getItem('medidash_user'));
          lsUser.avatar = null;
          localStorage.setItem('medidash_user', JSON.stringify(lsUser));
          window.location.reload();
        }} style={{ position: 'absolute', top: -5, left: -5, background: '#ef4444', color: '#fff', width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }} title="Remove Avatar">×</button>
      )}
    </div>
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

 {/* Change Password */}
 <form onSubmit={updatePassword} style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginTop: 24 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={20} color={C.dark} /> Change Password</h2>
 {pwdError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: 10, border: '1px solid #fecaca', marginBottom: 16, fontSize: 13 }}>{pwdError}</div>}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 20 }}>
 <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Current Password</label><input type="password" style={inputStyle} value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} required /></div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>New Password</label><input type="password" style={inputStyle} value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} required placeholder="Min 6 characters" /></div>
 <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Confirm New Password</label><input type="password" style={inputStyle} value={pwdForm.confirmPassword} onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))} required /></div>
 </div>
 </div>
 <button type="submit" disabled={pwdSaving} style={{ padding: '12px 28px', background: C.dark, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, opacity: pwdSaving ? 0.7 : 1 }}>
 {pwdSaving ? 'Updating...' : 'Update Password'}
 </button>
 </form>
 </div>
 );
}
