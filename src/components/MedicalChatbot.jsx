import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../utils/api.js';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', lightBg: '#f8fafc' };

export default function MedicalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "أهلاً بيك 🌟 أنا مساعدك الطبي على MediDash. موجود علشان أسهّل عليك أي حاجة—سواء أسئلة عن الأعراض، الأدوية، أو استخدام الموقع. قولّي بس محتاج إيه وأنا معاك خطوة بخطوة\n\n\n-\n\nHello there 🌟 I’m your medical assistant on MediDash. I’m here to make things easier for you—whether you have questions about symptoms, medications, or how to use the platform. Just tell me what you need, and I’ll guide you step by step." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send the entire conversation history (excluding the very first greeting if preferred, but usually fine to send)
      const data = await api.sendChatMessage(newMessages.map(m => ({ role: m.role, content: m.content })));
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: err.message || "Sorry, I'm having trouble connecting to the medical database right now. Please try again later.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="bot-fab"
          onClick={() => setIsOpen(true)}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={30} strokeWidth={2.5} />
            <Sparkles size={16} strokeWidth={3} color="#fcd34d" style={{ position: 'absolute', top: -6, right: -10, animation: 'pulse 2s infinite' }} />
            <style>{`@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }`}</style>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bot-window">
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.primary})`, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>MediDash AI</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}></span> Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '85%', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.role === 'user' ? C.primary : '#e2e8f0', color: m.role === 'user' ? '#fff' : C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                     {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div style={{ background: m.isError ? '#fee2e2' : m.role === 'user' ? C.primary : '#fff', color: m.isError ? '#b91c1c' : m.role === 'user' ? '#fff' : C.dark, padding: '12px 16px', borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', fontSize: 14, lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: m.role === 'user' ? 'none' : '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} />
                </div>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '20px 20px 20px 4px', border: '1px solid #e2e8f0', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="dot-bounce" style={{width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both'}} />
                  <span className="dot-bounce" style={{width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s'}} />
                  <span className="dot-bounce" style={{width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s'}} />
                  <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0) } 40% { transform: scale(1) } }`}</style>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: 16 }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about symptoms, health..."
                disabled={isLoading}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, outline: 'none', transition: 'border 0.2s' }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{ width: 44, height: 44, borderRadius: '50%', background: input.trim() && !isLoading ? C.primary : '#e2e8f0', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isLoading ? 'pointer' : 'default', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <Send size={18} style={{ marginLeft: 2 }} />
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
              AI can make mistakes. Consult a verified doctor.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
