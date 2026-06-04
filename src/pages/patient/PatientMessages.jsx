import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api.js';
import { MessageSquare, User } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b' };

export default function PatientMessages({ user, initialTarget, onClearTarget }) {
 const [conversations, setConversations] = useState([]);
 const [selected, setSelected] = useState(null);
 const [messages, setMessages] = useState([]);
 const [text, setText] = useState('');
 const [loading, setLoading] = useState(true);
 const [doctors, setDoctors] = useState([]);
 const [showLinkModal, setShowLinkModal] = useState(false);
 const msgEnd = useRef(null);

 useEffect(() => {
  let active = true;
  const fetchData = async () => {
    try {
      const [allDocs, appts] = await Promise.all([
        api.getDoctors(),
        user.profileId ? api.getPatientAppointments(user.profileId) : Promise.resolve([])
      ]);
      const bookedDocIds = new Set(appts.map(a => a.doctor_id));
      if (active) setDoctors(allDocs.filter(d => bookedDocIds.has(d.id)));
    } catch (e) { console.error(e); }
  };
  fetchData();

  if (user.id) {
  const fetchConvs = async () => {
  try { const data = await api.getConversations(user.id, 'patient'); if (active) { setConversations(data); setLoading(false); } } catch(e) { if(active) setLoading(false); }
  if (active) setTimeout(fetchConvs, 8000);
  };
  fetchConvs();
  return () => { active = false; };
  }
 }, [user]);

 useEffect(() => {
    if (initialTarget && doctors.length > 0 && !loading) {
      // Find the doctor from the target
      const doc = doctors.find(d => d.id === initialTarget.doctor_id);
      if (doc) {
        startConv(doc);
        onClearTarget?.();
      }
    }
  }, [initialTarget, doctors, loading]);

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

 const startConv = async (doctor) => {
 if (!user.profileId) return alert('Patient profile not found');
 const conv = await api.startConversation({ patientId: user.profileId, doctorId: doctor.id });
 const updated = await api.getConversations(user.id, 'patient');
 setConversations(updated);
 setSelected({ ...conv, other_name: doctor.full_name, other_avatar: doctor.avatar });
 };

 const send = async (e) => {
 e.preventDefault();
 if (!text.trim() || !selected) return;
 const msg = text; setText('');
 await api.sendMessage(selected.id, { senderId: user.id, content: msg });
 const msgs = await api.getMessages(selected.id);
 setMessages(msgs);
 const updated = await api.getConversations(user.id, 'patient');
 setConversations(updated);
 };

 return (
 <div className="fade" style={{ padding: 32 }}>
 {showLinkModal && (() => {
 const activeLinkMsg = [...messages].reverse().find(m => m.content?.startsWith('[VIDEO_MEETING]'));
 const activeLink = activeLinkMsg ? activeLinkMsg.content.replace('[VIDEO_MEETING]', '') : null;
 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowLinkModal(false)}>
 <div className="fade" style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
 <h2 style={{ fontWeight: 800, color: C.dark, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
 Video Consultation
 </h2>
 <button onClick={() => setShowLinkModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>
 {activeLink ? (
 <>
 <p style={{ color: C.gray, fontSize: 14, marginBottom: 20 }}>{selected?.other_name} has provided a meeting link for your consultation.</p>
 <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1.5px solid #e2e8f0', marginBottom: 24, wordBreak: 'break-all', fontSize: 14, color: C.dark }}>
 {activeLink}
 </div>
 <a href={activeLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '13px', background: C.primary, color: '#fff', borderRadius: 10, textDecoration: 'none', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
 Join Meeting Now
 </a>
 </>
 ) : (
 <>
 <div style={{ background: '#fef2f2', padding: 16, borderRadius: 10, border: '1px solid #fecaca', display: 'flex', gap: 12, alignItems: 'center' }}>
 <div style={{ fontSize: 24 }}>⏳</div>
 <div>
 <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 14 }}>No link provided yet</div>
 <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 4 }}>The doctor has not started the video consultation. Please wait for them to share the link in the chat.</div>
 </div>
 </div>
 <button onClick={() => setShowLinkModal(false)} style={{ marginTop: 20, width: '100%', padding: '13px', background: '#f1f5f9', color: C.dark, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Close</button>
 </>
 )}
 </div>
 </div>
 );
 })()}
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Messages</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Chat with your doctors</p>
 </div>

 <div className={`msg-container ${selected ? 'has-selected' : ''}`} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
 {/* Sidebar */}
 <div className="msg-sidebar" style={{ borderRight: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
 <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>Conversations</div>
 <div style={{ flex: 1, overflowY: 'auto' }}>
 {conversations.length === 0 && !loading && (
 <div style={{ padding: 16, color: C.gray, fontSize: 13, textAlign: 'center' }}>No conversations yet.<br />Start one below!</div>
 )}
 {conversations.map(c => (
 <div key={c.id} onClick={() => setSelected(c)} style={{ padding: '14px 16px', cursor: 'pointer', background: selected?.id === c.id ? '#eff6ff' : 'transparent', borderLeft: `3px solid ${selected?.id === c.id ? C.primary : 'transparent'}`, borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
 <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0, overflow: 'hidden' }}>
 {c.other_avatar ? <img src={c.other_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="contact" /> : <User size={18} />}
 </div>
 <div style={{ overflow: 'hidden' }}>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{c.other_name}</div>
 {c.specialty && <div style={{ color: C.primary, fontSize: 12 }}>{c.specialty}</div>}
 {c.last_message && <div style={{ color: C.gray, fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</div>}
 </div>
 </div>
 ))}
 </div>
 <div style={{ padding: 12, borderTop: '1px solid #f1f5f9' }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', marginBottom: 8 }}>Start New Chat</div>
 <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
 {doctors.map(d => (
 <button key={d.id} onClick={() => startConv(d)} style={{ padding: '7px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12, textAlign: 'left', color: C.dark }}>
 {d.specialty_icon || ''} {d.full_name}
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
 <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, fontSize: 18, overflow: 'hidden' }}>
 {selected.other_avatar ? <img src={selected.other_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="contact" /> : <User size={20} />}
 </div>
 <div>
 <div style={{ fontWeight: 700, color: C.dark }}>{selected.other_name}</div>
 <div style={{ color: C.gray, fontSize: 13 }}>{selected.specialty}</div>
 </div>
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
 {selected.other_avatar ? <img src={selected.other_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="doctor" /> : <User size={14} />}
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
 <p style={{ fontSize: 17, fontWeight: 600 }}>Select a conversation</p>
 <p style={{ fontSize: 14 }}>or start a new one</p>
 </div>
 )}
 </div>
 </div>
 );
}
