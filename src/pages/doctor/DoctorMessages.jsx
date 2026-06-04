import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api.js';
import { MessageSquare, User } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b' };

export default function DoctorMessages({ user, targetPatient, onClearTarget }) {
 const [conversations, setConversations] = useState([]);
 const [patients, setPatients] = useState([]);
 const [selected, setSelected] = useState(null);
 const [messages, setMessages] = useState([]);
 const [text, setText] = useState('');
 const [loading, setLoading] = useState(true);
 const [showLinkModal, setShowLinkModal] = useState(false);
 const [meetingLink, setMeetingLink] = useState('');
 const [linkError, setLinkError] = useState('');
 const msgEnd = useRef(null);
 
 useEffect(() => {
 if (user.profileId) {
 api.getDoctorAppointments(user.profileId).then(data => {
 const unique = {};
 data.forEach(a => { if (!unique[a.patient_id]) unique[a.patient_id] = { id: a.patient_id, full_name: a.patient_name, avatar: a.patient_avatar }; });
 setPatients(Object.values(unique));
 }).catch(console.error);
 }
 }, [user]);
 
 const startConv = async (patient) => {
 if (!user.profileId) return alert('Doctor profile not found');
 const conv = await api.startConversation({ doctorId: user.profileId, patientId: patient.id });
 const updated = await api.getConversations(user.id, 'doctor');
 setConversations(updated);
 setSelected({ ...conv, other_name: patient.full_name || patient.name, other_avatar: patient.avatar });
 };
 
 useEffect(() => {
 if (targetPatient) {
 startConv(targetPatient);
 onClearTarget?.();
 }
 }, [targetPatient]);

 useEffect(() => {
 let active = true;
 if (user.id) {
 const fetchConvs = async () => {
 try { const data = await api.getConversations(user.id, 'doctor'); if (active) { setConversations(data); setLoading(false); } } catch(e) { if(active) setLoading(false); }
 if (active) setTimeout(fetchConvs, 8000);
 };
 fetchConvs();
 return () => { active = false; };
 }
 }, [user]);
 
 useEffect(() => {
 let active = true;
 if (selected) {
 const fetchMsgs = async () => {
 try { const newMsgs = await api.getMessages(selected.id); if (active) setMessages(prev => prev.length === newMsgs.length ? prev : newMsgs); } catch (e) { console.error(e); }
 if (active) setTimeout(fetchMsgs, 4000);
 };
 fetchMsgs();
 return () => { active = false; };
 }
 }, [selected]);

 useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

 const send = async (e) => {
 e.preventDefault();
 if (!text.trim() || !selected) return;
 const msg = text; setText('');
 await api.sendMessage(selected.id, { senderId: user.id, content: msg });
 const msgs = await api.getMessages(selected.id);
 setMessages(msgs);
 const updated = await api.getConversations(user.id, 'doctor');
 setConversations(updated);
 };

 const handleSendMeetingLink = async (e) => {
 e.preventDefault();
 if (!meetingLink || !meetingLink.trim()) return setLinkError('Link is required');
 
 const validDomains = ['zoom.us', 'meet.google.com', 'teams.microsoft.com', 'webex.com', 'skype.com'];
 const isValid = validDomains.some(domain => meetingLink.toLowerCase().includes(domain));
 
 if (!isValid) {
 return setLinkError('Please enter a valid Zoom, Google Meet, Teams, Webex, or Skype link.');
 }
 if (!meetingLink.startsWith('http')) {
 return setLinkError('Link must start with http:// or https://');
 }

 setLinkError('');
 const msg = `[VIDEO_MEETING]${meetingLink.trim()}`;
 await api.sendMessage(selected.id, { senderId: user.id, content: msg });
 const msgs = await api.getMessages(selected.id);
 setMessages(msgs);
 const updated = await api.getConversations(user.id, 'doctor');
 setConversations(updated);
 setShowLinkModal(false);
 setMeetingLink('');
 };

 return (
 <div className="fade" style={{ padding: 32 }}>
 {showLinkModal && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowLinkModal(false)}>
 <div className="fade" style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
 <h2 style={{ fontWeight: 800, color: C.dark, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
 Video Consultation
 </h2>
 <button onClick={() => setShowLinkModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>
 <p style={{ color: C.gray, fontSize: 14, marginBottom: 20 }}>Paste your meeting link below to share it with the patient. Supported platforms: Zoom, Google Meet, Teams, Webex, Skype.</p>
 <form onSubmit={handleSendMeetingLink}>
 {linkError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca' }}>{linkError}</div>}
 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Meeting Link URL *</label>
 <input autoFocus placeholder="https://zoom.us/j/123456789" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', marginBottom: 24 }} />
 <div style={{ display: 'flex', gap: 12 }}>
 <button type="button" onClick={() => setShowLinkModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, color: C.dark }}>Cancel</button>
 <button type="submit" style={{ flex: 1, padding: '12px', background: C.primary, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Send Link</button>
 </div>
 </form>
 </div>
 </div>
 )}
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Messages</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Chat with your patients</p>
 </div>
 <div className={`msg-container ${selected ? 'has-selected' : ''}`} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
 <div className="msg-sidebar" style={{ borderRight: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
 <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>Patient Chats</div>
 <div style={{ flex: 1, overflowY: 'auto' }}>
 {conversations.length === 0 && !loading && (
 <div style={{ padding: 16, color: C.gray, fontSize: 13, textAlign: 'center' }}>No conversations yet</div>
 )}
 {conversations.map(c => (
 <div key={c.id} onClick={() => setSelected(c)} style={{ padding: '14px 16px', cursor: 'pointer', background: selected?.id === c.id ? '#eff6ff' : 'transparent', borderLeft: `3px solid ${selected?.id === c.id ? C.primary : 'transparent'}`, borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
 <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0, overflow: 'hidden' }}>
 {c.other_avatar ? <img src={c.other_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="contact" /> : <User size={18} />}
 </div>
 <div style={{ overflow: 'hidden' }}>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{c.other_name}</div>
 {c.last_message && <div style={{ color: C.gray, fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</div>}
 </div>
 </div>
 ))}
 </div>
  
  <div style={{ padding: 12, borderTop: '1px solid #f1f5f9' }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', marginBottom: 8 }}>Start New Chat</div>
  <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
  {patients.slice(0, 6).map(p => (
  <button key={p.id} onClick={() => startConv(p)} style={{ padding: '7px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12, textAlign: 'left', color: C.dark, display: 'flex', alignItems: 'center', gap: 8 }}>
  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {p.avatar ? <img src={p.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p" /> : <User size={14} color="#64748b" />}
  </div>
  {p.full_name}
  </button>
  ))}
  </div>
  </div>
  </div>

  {/* Messages */}
  {selected ? (
 <div className="msg-chat-area" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
 <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
 <button className="mobile-back-btn" onClick={() => setSelected(null)}>←</button>
 <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, overflow: 'hidden' }}>
 {selected.other_avatar ? <img src={selected.other_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="contact" /> : <User size={18} />}
 </div>
 <div style={{ fontWeight: 700, color: C.dark }}>{selected.other_name}</div>
 </div>
 <button onClick={() => setShowLinkModal(true)} style={{ padding: '8px 14px', background: '#eff6ff', color: C.primary, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
 Video Call
 </button>
 </div>
 <div style={{ flex: 1, overflowY: 'auto', padding: 'min(5vw, 20px)', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
 {messages.length === 0 && <div style={{ textAlign: 'center', color: C.gray, padding: '40px 0', fontSize: 14 }}>Start the conversation...</div>}
 {messages.map(m => {
 const mine = m.sender_id === user.id;
 return (
 <div key={m.id} style={{ display: 'flex', gap: 8, justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
 {!mine && (
 <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0, overflow: 'hidden' }}>
 {selected.other_avatar ? <img src={selected.other_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="patient" /> : <User size={14} />}
 </div>
 )}
 <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: mine ? C.primary : '#f1f5f9', color: mine ? '#fff' : C.dark, fontSize: 14, lineHeight: 1.5 }}>
 {m.content.startsWith('[VIDEO_MEETING]') ? (
 <div>
 <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
 Video Consultation
 </div>
 <a href={m.content.replace('[VIDEO_MEETING]', '')} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 16px', background: mine ? '#fff' : C.primary, color: mine ? C.primary : '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Join Meeting</a>
 </div>
 ) : (
 m.content
 )}
 <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
 </div>
 </div>
 );
 })}
 <div ref={msgEnd} />
 </div>
 <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
 <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 <button type="submit" style={{ padding: '12px 20px', background: C.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Send</button>
 </form>
 </div>
 ) : (
 <div className="msg-chat-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.gray, padding: 32, height: '100%' }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><MessageSquare color="#cbd5e1" size={56} strokeWidth={1.5} /></div>
 <p style={{ fontSize: 17, fontWeight: 600 }}>Select a patient chat</p>
 </div>
 )}
 </div>
 </div>
 );
}
