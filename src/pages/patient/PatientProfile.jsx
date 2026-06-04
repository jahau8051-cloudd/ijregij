import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { User, AlertCircle, HeartPulse, Lock } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b' };

export default function PatientProfile({ user }) {
 const [profile, setProfile] = useState(null);
 const [form, setForm] = useState({});
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [success, setSuccess] = useState('');
 const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
 const [pwdSaving, setPwdSaving] = useState(false);
 const [pwdError, setPwdError] = useState('');

 useEffect(() => {
 if (!user.profileId) return setLoading(false);
 api.getPatient(user.profileId).then(data => {
 setProfile(data);
 setForm({
 fullName: data.full_name || user.fullName,
 phone: data.phone || '',
 dateOfBirth: data.date_of_birth?.split('T')[0] || '',
 bloodType: data.blood_type || '',
 heightCm: data.height_cm || '',
 weightKg: data.weight_kg || '',
 allergies: data.allergies || '',
 chronicConditions: data.chronic_conditions || '',
 emergencyContactName: data.emergency_contact_name || '',
 emergencyContactPhone: data.emergency_contact_phone || '',
 });
 setLoading(false);
 }).catch(() => setLoading(false));
 }, [user]);

 const save = async (e) => {
 e.preventDefault();
 setSaving(true);
 try {
 await api.updatePatient(user.profileId, form);
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
        
        setProfile(p => ({ ...p, avatar: base64 }));
        window.location.reload(); // Quick global refresh to update sidebar
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

 const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
 const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc' };
 const label = (t) => <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>{t}</label>;

 if (loading) return <div style={{ padding: 32, color: C.gray }}>Loading...</div>;

 return (
 <div className="fade" style={{ padding: 32, maxWidth: 760 }}>
 <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>My Profile</h1>
      <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Manage your personal & medical information</p>
    </div>
    <div style={{ position: 'relative' }} title="Change Avatar">
      <label style={{ display: 'block', cursor: 'pointer', overflow: 'hidden', borderRadius: '50%', width: 70, height: 70, background: '#e2e8f0', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {profile?.avatar || user.avatar ? (
          <img src={profile?.avatar || user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray }}>
            <User size={32} />
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
      </label>
      <div style={{ position: 'absolute', bottom: -2, right: -2, background: C.primary, color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, pointerEvents: 'none', fontWeight: 700 }}>Edit</div>
      {(profile?.avatar || user.avatar) && (
        <button type="button" onClick={async () => {
          await api.updateAvatar(user.id, null);
          const lsUser = JSON.parse(localStorage.getItem('medidash_user'));
          lsUser.avatar = null;
          localStorage.setItem('medidash_user', JSON.stringify(lsUser));
          setProfile(p => ({ ...p, avatar: null }));
          window.location.reload();
        }} style={{ position: 'absolute', top: -5, left: -5, background: '#ef4444', color: '#fff', width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }} title="Remove Avatar">×</button>
      )}
    </div>
  </div>

 {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{success}</div>}

 <form onSubmit={save}>
 {/* Personal Info */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><User size={20} color={C.dark} /> Personal Information</h2>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div>{label('Full Name')}<input style={inputStyle} value={form.fullName || ''} onChange={set('fullName')} /></div>
 <div>{label('Phone Number')}<input style={inputStyle} value={form.phone || ''} onChange={set('phone')} placeholder="+1 555 0123" /></div>
 <div>{label('Date of Birth')}<input type="date" style={inputStyle} value={form.dateOfBirth || ''} onChange={set('dateOfBirth')} /></div>
 <div>{label('Blood Type')}<select style={inputStyle} value={form.bloodType || ''} onChange={set('bloodType')}>
 <option value="">Select</option>
 {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => <option key={t}>{t}</option>)}
 </select></div>
 <div>{label('Height (cm)')}<input type="number" style={inputStyle} value={form.heightCm || ''} onChange={set('heightCm')} placeholder="175" /></div>
 <div>{label('Weight (kg)')}<input type="number" style={inputStyle} value={form.weightKg || ''} onChange={set('weightKg')} placeholder="70" /></div>
 </div>
 </div>

 {/* Medical Info */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><HeartPulse size={20} color={C.dark} /> Medical Information</h2>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div>
 {label('Allergies')}
 <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.allergies || ''} onChange={set('allergies')} placeholder="List any known allergies..." />
 </div>
 <div>
 {label('Chronic Conditions')}
 <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.chronicConditions || ''} onChange={set('chronicConditions')} placeholder="List any chronic conditions..." />
 </div>
 </div>
 </div>

 {/* Emergency Contact */}
 <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={20} color={C.dark} /> Emergency Contact</h2>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div>{label('Contact Name')}<input style={inputStyle} value={form.emergencyContactName || ''} onChange={set('emergencyContactName')} /></div>
 <div>{label('Contact Phone')}<input style={inputStyle} value={form.emergencyContactPhone || ''} onChange={set('emergencyContactPhone')} /></div>
 </div>
 </div>

 <button type="submit" disabled={saving} style={{ padding: '14px 36px', background: C.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, opacity: saving ? 0.7 : 1 }}>
 {saving ? 'Saving...' : 'Save Changes'}
 </button>
 </form>

 {/* Change Password */}
 <form onSubmit={updatePassword} style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginTop: 24 }}>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={20} color={C.dark} /> Change Password</h2>
 {pwdError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: 10, border: '1px solid #fecaca', marginBottom: 16, fontSize: 13 }}>{pwdError}</div>}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 20 }}>
 <div>{label('Current Password')}<input type="password" style={inputStyle} value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} required /></div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 <div>{label('New Password')}<input type="password" style={inputStyle} value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} required placeholder="Min 6 characters" /></div>
 <div>{label('Confirm New Password')}<input type="password" style={inputStyle} value={pwdForm.confirmPassword} onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))} required /></div>
 </div>
 </div>
 <button type="submit" disabled={pwdSaving} style={{ padding: '12px 28px', background: C.dark, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, opacity: pwdSaving ? 0.7 : 1 }}>
 {pwdSaving ? 'Updating...' : 'Update Password'}
 </button>
 </form>
 </div>
 );
}
