import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api.js';
import { MessageSquare, User } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b' };

export default function DoctorMessages({ user }) {
 const [conversations, setConversations] = useState([]);
 const [selected, setSelected] = useState(null);
 const [messages, setMessages] = useState([]);
 const [text, setText] = useState('');
 const [loading, setLoading] = useState(true);
 const msgEnd = useRef(null);

 useEffect(() => {
 if (user.id) {
 api.getConversations(user.id, 'doctor').then(data => { setConversations(data); setLoading(false); }).catch(() => setLoading(false));
 }
 }, [user]);

 useEffect(() => {
 if (selected) api.getMessages(selected.id).then(setMessages).catch(console.error);
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

 return (
 <div className="fade" style={{ padding: 32 }}>
 <div style={{ marginBottom: 24 }}>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>Messages</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Chat with your patients</p>
 </div>
 <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 520 }}>
 <div style={{ borderRight: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
 <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>Patient Chats</div>
 <div style={{ flex: 1, overflowY: 'auto' }}>
 {conversations.length === 0 && !loading && (
 <div style={{ padding: 16, color: C.gray, fontSize: 13, textAlign: 'center' }}>No conversations yet</div>
 )}
 {conversations.map(c => (
 <div key={c.id} onClick={() => setSelected(c)} style={{ padding: '14px 16px', cursor: 'pointer', background: selected?.id === c.id ? '#eff6ff' : 'transparent', borderLeft: `3px solid ${selected?.id === c.id ? C.primary : 'transparent'}`, borderBottom: '1px solid #f8fafc' }}>
 <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{c.other_name}</div>
 {c.last_message && <div style={{ color: C.gray, fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</div>}
 </div>
 ))}
 </div>
 </div>

 {selected ? (
 <div style={{ display: 'flex', flexDirection: 'column' }}>
 <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
 <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}><User size={18} /></div>
 <div style={{ fontWeight: 700, color: C.dark }}>{selected.other_name}</div>
 </div>
 <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300 }}>
 {messages.length === 0 && <div style={{ textAlign: 'center', color: C.gray, padding: '40px 0', fontSize: 14 }}>Start the conversation...</div>}
 {messages.map(m => {
 const mine = m.sender_id === user.id;
 return (
 <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
 <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: mine ? C.primary : '#f1f5f9', color: mine ? '#fff' : C.dark, fontSize: 14, lineHeight: 1.5 }}>
 {m.content}
 <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
 </div>
 </div>
 );
 })}
 <div ref={msgEnd} />
 </div>
 <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
 <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 <button type="submit" style={{ padding: '12px 20px', background: C.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Send</button>
 </form>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><MessageSquare color="#cbd5e1" size={56} strokeWidth={1.5} /></div>
 <p style={{ fontSize: 17, fontWeight: 600 }}>Select a patient to chat</p>
 </div>
 )}
 </div>
 </div>
 );
}
