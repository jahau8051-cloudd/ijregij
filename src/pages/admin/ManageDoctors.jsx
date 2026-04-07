import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };
const SC = { approved: { bg: '#d1fae5', c: '#065f46' }, pending: { bg: '#fef9c3', c: '#854d0e' }, suspended: { bg: '#fee2e2', c: '#991b1b' } };

function AddDoctorPanel({ onClose, onSuccess }) {
 const [specialties, setSpecialties] = useState([]);
 const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', licenseNumber: '', specialtyId: '', experienceYears: '', consultationFee: '', clinicName: '', bio: '' });
 const [saving, setSaving] = useState(false);
 const [err, setErr] = useState('');
 const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

 useEffect(() => { api.getSpecialties().then(setSpecialties).catch(() => {}); }, []);

 const submit = async (e) => {
 e.preventDefault();
 if (!form.fullName || !form.email || !form.password) return setErr('Name, email and password are required');
 setSaving(true); setErr('');
 try {
 await api.createAdminDoctor(form);
 onSuccess('Doctor added and approved successfully');
 onClose();
 } catch (e) { setErr(e.message); } finally { setSaving(false); }
 };

 const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f8fafc' };
 const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 };

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }} onClick={onClose}>
 <div className="slide" style={{ background: '#fff', width: 440, height: '100vh', overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
 <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
 <div>
 <h2 style={{ fontWeight: 800, color: C.dark, fontSize: 18 }}>Add Doctor</h2>
 <p style={{ color: C.gray, fontSize: 13, marginTop: 2 }}>Creates an approved doctor account</p>
 </div>
 <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>

 <form onSubmit={submit} style={{ padding: 28 }}>
 {err && <div style={{ background: '#fef2f2', color: C.red, padding: '11px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca' }}>{err}</div>}

 <p style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>Account details</p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
 <div style={{ marginBottom: 16 }}>
 <label style={lbl}>Full Name *</label>
 <input style={inp} required placeholder="Dr. Sarah Othman" value={form.fullName} onChange={set('fullName')} />
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Email *</label>
 <input style={inp} type="email" required placeholder="dr.sarah@clinic.com" value={form.email} onChange={set('email')} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Phone</label>
 <input style={inp} placeholder="+1 555 0123" value={form.phone} onChange={set('phone')} />
 </div>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Temporary password *</label>
 <input style={inp} type="password" required placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
 </div>
 </div>

 <p style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>Professional details</p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>License Number</label>
 <input style={inp} placeholder="MD-12345" value={form.licenseNumber} onChange={set('licenseNumber')} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Years of experience</label>
 <input style={inp} type="number" min="0" placeholder="10" value={form.experienceYears} onChange={set('experienceYears')} />
 </div>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Specialty</label>
 <select style={inp} value={form.specialtyId} onChange={set('specialtyId')}>
 <option value="">Select specialty...</option>
 {specialties.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
 </select>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Consultation fee ($)</label>
 <input style={inp} type="number" placeholder="100" value={form.consultationFee} onChange={set('consultationFee')} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Clinic name</label>
 <input style={inp} placeholder="City Medical Center" value={form.clinicName} onChange={set('clinicName')} />
 </div>
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Short bio</label>
 <textarea style={{ ...inp, resize: 'none' }} rows={3} placeholder="Brief description of the doctor's expertise..." value={form.bio} onChange={set('bio')} />
 </div>
 </div>

 <button type="submit" disabled={saving} style={{ width: '100%', padding: '13px', background: saving ? '#93c5fd' : C.primary, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
 {saving ? 'Adding doctor...' : '✓ Add & approve doctor'}
 </button>
 </form>
 </div>
 </div>
 );
}

function CredentialModal({ doctor, onClose }) {
 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
 <div className="fade" style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
 <h2 style={{ fontWeight: 800, color: C.dark, fontSize: 18 }}>Doctor Credentials</h2>
 <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
 </div>
 <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
 <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}></div>
 <div>
 <div style={{ fontWeight: 700, fontSize: 17, color: C.dark }}>{doctor.full_name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{doctor.email}</div>
 <div style={{ color: C.gray, fontSize: 12 }}>{doctor.specialty_icon} {doctor.specialty_name || 'No specialty set'}</div>
 </div>
 </div>
 {[
 { label: 'License Number', value: doctor.license_number || 'Not provided' },
 { label: 'Experience', value: doctor.experience_years ? `${doctor.experience_years} years` : 'Not provided' },
 { label: 'Applied on', value: new Date(doctor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
 ].map(f => (
 <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
 <span style={{ color: C.gray, fontSize: 14 }}>{f.label}</span>
 <span style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{f.value}</span>
 </div>
 ))}
 {doctor.id_document && (
 <div style={{ marginTop: 20 }}>
 <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 10 }}>Submitted Document</p>
 {doctor.id_document.startsWith('data:image') ? (
 <img src={doctor.id_document} alt="ID Document" style={{ width: '100%', borderRadius: 10, border: '1px solid #e2e8f0', maxHeight: 240, objectFit: 'contain' }} />
 ) : (
 <a href={doctor.id_document} download="document" style={{ display: 'block', padding: '12px 16px', background: '#eff6ff', color: C.primary, borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
 Download submitted document
 </a>
 )}
 </div>
 )}
 {!doctor.id_document && <p style={{ color: C.gray, fontSize: 13, marginTop: 16, textAlign: 'center' }}>No document was uploaded during registration.</p>}
 </div>
 </div>
 );
}

export default function ManageDoctors() {
 const [doctors, setDoctors] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState('all');
 const [toast, setToast] = useState('');
 const [showAdd, setShowAdd] = useState(false);
 const [viewCreds, setViewCreds] = useState(null);
 const [delConfirm, setDelConfirm] = useState(null);

 const load = () => {
 setLoading(true);
 api.getAllDoctors().then(data => { setDoctors(data); setLoading(false); }).catch(() => setLoading(false));
 };

 useEffect(() => { load(); }, []);

 const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

 const updateStatus = async (id, status) => {
 await api.updateDoctorStatus(id, status);
 notify(`Doctor ${status === 'approved' ? 'approved' : status === 'suspended' ? 'suspended' : 'updated'}`);
 load();
 };

 const handleDelete = async (id) => {
 try {
 await api.deleteDoctor(id);
 setDelConfirm(null);
 notify('Doctor removed from the platform');
 load();
 } catch (err) {
 notify('Error: ' + err.message);
 }
 };

 const toggleActive = async (userId) => {
 await api.toggleUserActive(userId);
 load();
 };

 const pending = doctors.filter(d => d.status === 'pending');
 const filtered = doctors.filter(d => {
 const ms = !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.specialty_name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase());
 const mf = filter === 'all' || d.status === filter;
 return ms && mf;
 });

 const counts = { all: doctors.length, approved: 0, pending: 0, suspended: 0 };
 doctors.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });

 return (
 <div className="fade" style={{ padding: 32 }}>
 {showAdd && <AddDoctorPanel onClose={() => setShowAdd(false)} onSuccess={(msg) => { notify(msg); load(); }} />}
 {viewCreds && <CredentialModal doctor={viewCreds} onClose={() => setViewCreds(null)} />}

 {delConfirm && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDelConfirm(null)}>
 <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 380, boxShadow: '0 16px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
 <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
 <h3 style={{ fontWeight: 800, color: C.dark, textAlign: 'center', marginBottom: 8 }}>Remove Doctor?</h3>
 <p style={{ color: C.gray, textAlign: 'center', fontSize: 14, marginBottom: 24 }}>This will permanently remove <strong>{delConfirm.full_name}</strong> and all their data. This cannot be undone.</p>
 <div style={{ display: 'flex', gap: 10 }}>
 <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
 <button onClick={() => handleDelete(delConfirm.id)} style={{ flex: 1, padding: '12px', background: C.red, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Remove</button>
 </div>
 </div>
 </div>
 )}

 {toast && (
 <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', padding: '14px 22px', borderRadius: 12, zIndex: 999, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', animation: 'fadeIn .3s ease' }}>
 ✓ {toast}
 </div>
 )}

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
 <div>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Doctors</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>{doctors.length} total · {counts.pending} pending review</p>
 </div>
 <button onClick={() => setShowAdd(true)} style={{ padding: '11px 22px', background: C.primary, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
 + Add Doctor
 </button>
 </div>

 {/* Pending alerts */}
 {pending.length > 0 && (
 <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
 <div style={{ fontSize: 24 }}></div>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 700, color: '#854d0e', fontSize: 15 }}>{pending.length} doctor application{pending.length > 1 ? 's' : ''} waiting for review</div>
 <div style={{ color: '#92400e', fontSize: 13, marginTop: 2 }}>Review credentials and approve or reject each application below.</div>
 </div>
 <button onClick={() => setFilter('pending')} style={{ padding: '8px 16px', background: '#854d0e', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
 View pending →
 </button>
 </div>
 )}

 {/* Filters */}
 <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or specialty..." style={{ flex: '1 1 220px', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 <div style={{ display: 'flex', gap: 6 }}>
 {Object.entries(counts).map(([f, count]) => (
 <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${filter === f ? C.primary : '#e2e8f0'}`, background: filter === f ? '#eff6ff' : '#f8fafc', color: filter === f ? C.primary : C.gray, fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
 {f} ({count})
 </button>
 ))}
 </div>
 </div>

 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading doctors...</div>
 ) : filtered.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>
 <div style={{ fontSize: 40, marginBottom: 12 }}></div>
 <p style={{ fontWeight: 600, marginBottom: 6 }}>No doctors here</p>
 <p style={{ fontSize: 14 }}>Add your first doctor using the button above.</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
 {filtered.map(d => {
 const sc = SC[d.status] || SC.pending;
 return (
 <div key={d.id} style={{ background: '#fff', borderRadius: 14, padding: '18px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${d.status === 'pending' ? C.orange : d.status === 'approved' ? C.green : C.red}` }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
 <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}></div>
 <div style={{ flex: 1, minWidth: 180 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
 <span style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{d.full_name}</span>
 <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.c, textTransform: 'capitalize' }}>{d.status}</span>
 </div>
 <div style={{ color: C.gray, fontSize: 13 }}>{d.email}</div>
 <div style={{ color: C.gray, fontSize: 12, marginTop: 2 }}>
 {d.specialty_icon} {d.specialty_name || 'No specialty'} · {d.license_number ? `License: ${d.license_number}` : 'No license on file'} · {d.experience_years || 0}y exp
 </div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
 {/* Active toggle */}
 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
 <span style={{ fontSize: 12, color: C.gray }}>Active</span>
 <div style={{ width: 40, height: 22, borderRadius: 20, background: d.is_active ? C.green : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'background .2s' }} onClick={() => toggleActive(d.user_id)}>
 <div style={{ position: 'absolute', top: 2, left: d.is_active ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
 </div>
 </div>

 <button onClick={() => setViewCreds(d)} style={{ padding: '7px 14px', background: '#f1f5f9', color: C.dark, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
 Credentials
 </button>

 {d.status === 'pending' && (
 <>
 <button onClick={() => updateStatus(d.id, 'approved')} style={{ padding: '7px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>✓ Approve</button>
 <button onClick={() => updateStatus(d.id, 'suspended')} style={{ padding: '7px 14px', background: '#fee2e2', color: C.red, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>✗ Reject</button>
 </>
 )}
 {d.status === 'approved' && (
 <button onClick={() => updateStatus(d.id, 'suspended')} style={{ padding: '7px 14px', background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Suspend</button>
 )}
 {d.status === 'suspended' && (
 <button onClick={() => updateStatus(d.id, 'approved')} style={{ padding: '7px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Reinstate</button>
 )}

 <button onClick={() => setDelConfirm(d)} style={{ padding: '7px 14px', background: '#fee2e2', color: C.red, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Remove</button>
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
