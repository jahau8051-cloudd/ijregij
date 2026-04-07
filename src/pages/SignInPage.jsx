import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { LogIn } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', error: '#ef4444' };

export default function SignInPage({ onSuccess, onNav }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [err, setErr] = useState('');
 const [loading, setLoading] = useState(false);

 const submit = async (e) => {
 e.preventDefault();
 setErr('');
 setLoading(true);
 try {
 const data = await api.signin({ email, password });
 onSuccess(data.user);
 } catch (e) {
 setErr(e.message);
 } finally {
 setLoading(false);
 }
 };

 const inp = { width: '100%', padding: '13px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', background: '#f8fafc', transition: 'border .2s' };

 return (
 <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, #0f172a 0%, #1e3a6e 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
 <div className="fade" style={{ background: '#fff', borderRadius: 20, padding: 44, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>
 <div style={{ textAlign: 'center', marginBottom: 36 }}>
 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><LogIn color={C.primary} size={48} strokeWidth={1.5} /></div>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Welcome back</h1>
 <p style={{ color: C.gray, fontSize: 15 }}>Sign in to your MediDash account</p>
 </div>

 <form onSubmit={submit}>
 {err && (
 <div style={{ background: '#fef2f2', color: C.error, padding: '12px 16px', borderRadius: 10, marginBottom: 18, fontSize: 14, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8 }}>
 {err}
 </div>
 )}
 <div style={{ marginBottom: 16 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Email</label>
 <input style={inp} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
 </div>
 <div style={{ marginBottom: 28 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
 <label style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Password</label>
 </div>
 <input style={inp} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
 </div>
 <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : C.primary, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'default' : 'pointer', transition: 'all .2s' }}>
 {loading ? 'Signing in...' : 'Sign in →'}
 </button>
 </form>

 <p style={{ textAlign: 'center', marginTop: 24, color: C.gray, fontSize: 14 }}>
 Don't have an account?{' '}
 <span style={{ color: C.primary, fontWeight: 600, cursor: 'pointer' }} onClick={() => onNav('signup')}>Register here</span>
 <span style={{ margin: '0 10px', color: '#e2e8f0' }}>|</span>
 <span style={{ color: C.primary, fontWeight: 600, cursor: 'pointer' }} onClick={() => onNav('landing')}>← Home</span>
 </p>
 </div>
 </div>
 );
}
