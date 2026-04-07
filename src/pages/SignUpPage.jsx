import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { CheckCircle, UserPlus, User, Stethoscope, FileText } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', error: '#ef4444', green: '#10b981' };

export default function SignUpPage({ onSuccess, onNav }) {
 const [step, setStep] = useState(1);
 const [role, setRole] = useState('');
 const [specialties, setSpecialties] = useState([]);
 const [form, setForm] = useState({
 fullName: '', email: '', password: '', confirm: '', phone: '',
 licenseNumber: '', specialtyId: '', experienceYears: '', idDocument: '',
 });
 const [err, setErr] = useState('');
 const [loading, setLoading] = useState(false);
 const [pending, setPending] = useState(false);

 useEffect(() => {
 api.getSpecialties().then(setSpecialties).catch(() => {});
 }, []);

 const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

 const handleIdUpload = (e) => {
 const file = e.target.files[0];
 if (!file) return;
 if (file.size > 3 * 1024 * 1024) return setErr('File must be under 3MB');
 const reader = new FileReader();
 reader.onload = (ev) => setForm(f => ({ ...f, idDocument: ev.target.result }));
 reader.readAsDataURL(file);
 };

 const submit = async (e) => {
 e.preventDefault();
 if (form.password !== form.confirm) return setErr('Passwords do not match');
 if (form.password.length < 6) return setErr('Password must be at least 6 characters');
 if (role === 'doctor' && !form.licenseNumber) return setErr('License number is required');
 setLoading(true); setErr('');
 try {
 const data = await api.signup({
 ...form, role,
 specialtyId: form.specialtyId || null,
 experienceYears: parseInt(form.experienceYears) || 0,
 });
 if (data.user.doctorStatus === 'pending') {
 setPending(true);
 } else {
 onSuccess(data.user);
 }
 } catch (e) {
 setErr(e.message);
 } finally {
 setLoading(false);
 }
 };

 const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc' };
 const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 };

 if (pending) {
 return (
 <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, #0f172a 0%, #1e3a6e 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
 <div className="fade" style={{ background: '#fff', borderRadius: 20, padding: 48, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', textAlign: 'center' }}>
 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><CheckCircle color={C.green} size={64} strokeWidth={1.5} /></div>
 <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Application Received</h1>
 <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
 Thanks for applying to join MediDash. Our team will review your credentials and get back to you within 1–2 business days.
 </p>
 <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 28, textAlign: 'left' }}>
 <p style={{ fontSize: 14, fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>What happens next?</p>
 {['We verify your license and credentials', 'Admin reviews and approves your account', 'You\'ll be able to sign in and start seeing patients'].map((s, i) => (
 <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
 <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✓</span>
 <span style={{ color: '#0369a1', fontSize: 13 }}>{s}</span>
 </div>
 ))}
 </div>
 <button onClick={() => onNav('signin')} style={{ padding: '13px 32px', background: C.primary, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
 Back to Sign In
 </button>
 </div>
 </div>
 );
 }

 return (
 <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.dark} 0%, #1e3a6e 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
 <div className="fade" style={{ background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
 <div style={{ textAlign: 'center', marginBottom: 28 }}>
 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><UserPlus color={C.primary} size={40} strokeWidth={1.5} /></div>
 <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark }}>Create account</h1>
 <p style={{ color: C.gray, fontSize: 14, marginTop: 4 }}>Step {step} of {role === 'doctor' ? 3 : 2}</p>
 </div>

 {/* Progress */}
 <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
 {[1, 2, role === 'doctor' ? 3 : null].filter(Boolean).map(s => (
 <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? C.primary : '#e2e8f0', transition: 'background .3s' }} />
 ))}
 </div>

 {/* Step 1: Role selection */}
 {step === 1 && (
 <div>
 <p style={{ fontWeight: 600, color: C.dark, marginBottom: 16, fontSize: 15 }}>Who are you signing up as?</p>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
 {[
 { id: 'patient', icon: <User size={36} color={C.dark} />, label: 'Patient', sub: 'Find doctors and book appointments' },
 { id: 'doctor', icon: <Stethoscope size={36} color={C.dark} />, label: 'Doctor', sub: 'Join our verified medical network' },
 ].map(r => (
 <div key={r.id} onClick={() => setRole(r.id)} style={{ padding: 20, borderRadius: 14, border: `2px solid ${role === r.id ? C.primary : '#e2e8f0'}`, background: role === r.id ? '#eff6ff' : '#f8fafc', cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }}>
 <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
 <div style={{ fontWeight: 700, color: C.dark, fontSize: 16 }}>{r.label}</div>
 <div style={{ color: C.gray, fontSize: 12, marginTop: 4 }}>{r.sub}</div>
 </div>
 ))}
 </div>
 <button disabled={!role} onClick={() => setStep(2)} style={{ width: '100%', padding: '13px', background: role ? C.primary : '#e2e8f0', color: role ? '#fff' : C.gray, borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: role ? 'pointer' : 'default', transition: 'all .2s' }}>
 Continue →
 </button>
 <p style={{ textAlign: 'center', marginTop: 18, color: C.gray, fontSize: 14 }}>
 Already have an account?{' '}
 <span style={{ color: C.primary, fontWeight: 600, cursor: 'pointer' }} onClick={() => onNav('signin')}>Sign in</span>
 </p>
 </div>
 )}

 {/* Step 2: Account details */}
 {step === 2 && (
 <form onSubmit={role === 'patient' ? submit : (e) => { e.preventDefault(); if (!form.fullName || !form.email || !form.password) return setErr('Fill in all fields'); if (form.password !== form.confirm) return setErr('Passwords do not match'); if (form.password.length < 6) return setErr('Password must be at least 6 characters'); setErr(''); setStep(3); }}>
 {err && <div style={{ background: '#fef2f2', color: C.error, padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca' }}>{err}</div>}
 <div style={{ marginBottom: 16 }}>
 <label style={lbl}>Full Name</label>
 <input style={inp} required placeholder="Ahmed Khalil" value={form.fullName} onChange={set('fullName')} />
 </div>
 <div style={{ marginBottom: 16 }}>
 <label style={lbl}>Phone</label>
 <input style={inp} placeholder="+1 555 0123" value={form.phone} onChange={set('phone')} />
 </div>
 <div style={{ marginBottom: 12 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Email</label>
 <input style={inp} type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Password</label>
 <input style={inp} type="password" required placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Confirm password</label>
 <input style={inp} type="password" required placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
 </div>
 </div>
 <div style={{ display: 'flex', gap: 10 }}>
 <button type="button" onClick={() => { setStep(1); setErr(''); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: C.dark, borderRadius: 10, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>← Back</button>
 <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: loading ? '#93c5fd' : C.primary, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
 {loading ? 'Creating account...' : role === 'doctor' ? 'Next: Credentials →' : 'Create account'}
 </button>
 </div>
 </form>
 )}

 {/* Step 3: Doctor credentials */}
 {step === 3 && role === 'doctor' && (
 <form onSubmit={submit}>
 {err && <div style={{ background: '#fef2f2', color: C.error, padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca' }}>{err}</div>}

 <div style={{ background: '#fef9c3', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid #fde68a' }}>
 <p style={{ fontSize: 13, color: '#854d0e', fontWeight: 600, marginBottom: 2 }}>Credential verification required</p>
 <p style={{ fontSize: 12, color: '#92400e' }}>Your application will be reviewed by our admin team before you can start accepting patients.</p>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Medical License No. *</label>
 <input style={inp} required placeholder="e.g. MD-12345" value={form.licenseNumber} onChange={set('licenseNumber')} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Years of experience</label>
 <input style={inp} type="number" min="0" max="60" placeholder="e.g. 10" value={form.experienceYears} onChange={set('experienceYears')} />
 </div>
 </div>

 <div style={{ marginBottom: 12 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Specialty</label>
 <select style={inp} value={form.specialtyId} onChange={set('specialtyId')}>
 <option value="">Select your specialty...</option>
 {specialties.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
 </select>
 </div>

 <div style={{ marginBottom: 20 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 5 }}>
 Government-issued ID or Medical License Document
 </label>
 <div style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
 <input type="file" accept="image/*,.pdf" onChange={handleIdUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
 {form.idDocument ? (
 <div style={{ color: C.green, fontWeight: 600, fontSize: 14 }}>✓ Document uploaded</div>
 ) : (
 <>
 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><FileText color={C.gray} size={32} strokeWidth={1.5} /></div>
 <div style={{ color: C.dark, fontSize: 13, fontWeight: 600 }}>Click to upload</div>
 <div style={{ color: C.gray, fontSize: 12, marginTop: 2 }}>JPEG, PNG or PDF · Max 3MB</div>
 </>
 )}
 </div>
 </div>

 <div style={{ display: 'flex', gap: 10 }}>
 <button type="button" onClick={() => { setStep(2); setErr(''); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: C.dark, borderRadius: 10, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>← Back</button>
 <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: loading ? '#93c5fd' : C.primary, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
 {loading ? 'Submitting...' : 'Submit application'}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
}
