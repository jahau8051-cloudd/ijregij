import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { User, Users, MessageSquare } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981' };

export default function DoctorPatients({ user, onMessage }) {
 const [patients, setPatients] = useState([]);
 const [appointments, setAppointments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [selected, setSelected] = useState(null);
 const [loadingPatientInfo, setLoadingPatientInfo] = useState(false);

 const handleSelect = async (p) => {
   if (selected?.id === p.id) {
     setSelected(null);
     return;
   }
   setSelected(p);
   setLoadingPatientInfo(true);
   
   // Auto-scroll to top on mobile so the user sees the panel!
   if (window.innerWidth <= 768) {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   try {
     const pData = await api.getPatient(p.id);
     setSelected({ ...p, ...pData });
   } catch (e) {
     console.error(e);
   } finally {
     setLoadingPatientInfo(false);
   }
 };

 useEffect(() => {
 if (!user.profileId) return setLoading(false);
 api.getDoctorAppointments(user.profileId).then(data => {
 setAppointments(data);
 // Get unique patients
 const unique = {};
 data.forEach(a => { if (!unique[a.patient_id]) unique[a.patient_id] = { id: a.patient_id, name: a.patient_name, phone: a.patient_phone, avatar: a.patient_avatar, appointments: [], lastVisit: a.appointment_date }; unique[a.patient_id].appointments.push(a); });
 setPatients(Object.values(unique));
 setLoading(false);
 }).catch(() => setLoading(false));
 }, [user]);

 const filtered = patients.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>My Patients</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>{patients.length} unique patients</p>
 </div>

 <div style={{ marginBottom: 20 }}>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search patients by name..." style={{ width: 320, padding: '11px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 </div>

 <div className="doc-patients-grid" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
 {loading ? (
 <div style={{ textAlign: 'center', padding: 40, color: C.gray }}>Loading...</div>
 ) : filtered.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Users color="#cbd5e1" size={56} strokeWidth={1.5} /></div>
 <p>No patients found</p>
 </div>
 ) : filtered.map(p => (
 <div key={p.id} onClick={() => handleSelect(p)}
 style={{ background: '#fff', borderRadius: 14, padding: 'min(5vw, 20px)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: `2px solid ${selected?.id === p.id ? C.primary : 'transparent'}`, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
 <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0, overflow: 'hidden' }}>
 {p.avatar ? <img src={p.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="patient" /> : <User size={22} />}
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{p.name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{p.phone || 'No phone'}</div>
 </div>
 <div style={{ textAlign: 'right' }}>
 <div style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{p.appointments.length} visits</div>
 <div style={{ color: C.gray, fontSize: 12 }}>Last: {new Date(p.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
 </div>
 </div>
 ))}
 </div>

 {selected && (
 <div className="slide" style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', height: 'fit-content', position: 'sticky', top: 0 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
 <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Patient History</h2>
 <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', fontSize: 16 }}>×</button>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '16px', background: '#f8fafc', borderRadius: 12, flexWrap: 'wrap' }}>
 <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, overflow: 'hidden', flexShrink: 0 }}>
 {selected.avatar ? <img src={selected.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="patient" /> : <User size={22} />}
 </div>
 <div>
 <div style={{ fontWeight: 700, fontSize: 17, color: C.dark }}>{selected.name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{selected.phone}</div>
 </div>
 <button onClick={() => onMessage?.(selected)} style={{ marginLeft: 'auto', padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
 <MessageSquare size={14} /> Message
 </button>
 </div>

 {loadingPatientInfo ? (
   <div style={{ textAlign: 'center', padding: 20, color: C.gray }}>Loading patient data...</div>
 ) : (
   <>
      <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
       {/* Personal Info */}
       <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
         <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Personal Info</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Date of Birth</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString() : 'Not set'}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Email</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.email || 'N/A'}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Emerg. Contact</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.emergency_contact_name || 'Not set'}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Emerg. Phone</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.emergency_contact_phone || 'Not set'}</span>
           </div>
         </div>
       </div>

       {/* Medical Info */}
       <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 12, border: '1px solid #bbf7d0' }}>
         <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Medical Profile</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Blood Type</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.blood_type || 'Unknown'}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Height & Weight</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.height_cm ? `${selected.height_cm}cm` : '--'} / {selected.weight_kg ? `${selected.weight_kg}kg` : '--'}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Allergies</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.allergies || 'None reported'}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
             <span style={{ color: C.gray }}>Chronic Cond.</span>
             <span style={{ fontWeight: 600, color: C.dark }}>{selected.chronic_conditions || 'None reported'}</span>
           </div>
         </div>
       </div>
     </div>

     <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Appointment History</h3>
     <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
       {selected.appointments.map(a => (
         <div key={a.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, borderLeft: `3px solid ${a.status === 'completed' ? C.green : a.status === 'confirmed' ? C.primary : '#e2e8f0'}` }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
             <span style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
             <span style={{ fontSize: 12, color: C.gray }}>${a.fee}</span>
           </div>
           <div style={{ fontSize: 12, color: C.gray }}>{a.type} · {a.status}</div>
           {a.reason && <div style={{ fontSize: 12, color: C.dark, marginTop: 4 }}>"{a.reason}"</div>}
         </div>
       ))}
     </div>
   </>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
