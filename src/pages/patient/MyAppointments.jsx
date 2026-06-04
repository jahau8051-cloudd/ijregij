import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { Calendar, Lock, CreditCard, Smartphone, Zap } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };

const STATUS_COLORS = {
 pending: { bg: '#fef9c3', color: '#854d0e' },
 confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
 completed: { bg: '#d1fae5', color: '#065f46' },
 cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

function BookModal({ doctor, user, onClose, onBooked, initialAppointment }) {
 const [slots, setSlots] = useState([]);
 const [selectedDate, setSelectedDate] = useState(initialAppointment ? initialAppointment.appointment_date : '');
 const [selectedTime, setSelectedTime] = useState(initialAppointment ? initialAppointment.appointment_time : '');
 const [type, setType] = useState(initialAppointment ? initialAppointment.type : 'in-person');
 const [reason, setReason] = useState(initialAppointment ? initialAppointment.reason : '');
 const [step, setStep] = useState(initialAppointment ? 2 : 1); // 1=book, 2=pay
 const [paying, setPaying] = useState(false);
 const [payMethod, setPayMethod] = useState('card');
 const [walletPhone, setWalletPhone] = useState('');
 const [instapayId, setInstapayId] = useState('');
 const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });
 const [error, setError] = useState('');
 const [appointmentId, setAppointmentId] = useState(initialAppointment ? initialAppointment.id : null);

 const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

 useEffect(() => {
 if (selectedDate) {
 api.getDoctorSlots(doctor.id, selectedDate).then(setSlots).catch(console.error);
 }
 }, [selectedDate, doctor.id]);

 const bookSlot = async () => {
 if (!selectedDate || !selectedTime) return setError('Please select date and time');
 setError('');
 try {
 const appt = await api.bookAppointment({
 patientId: user.profileId, doctorId: doctor.id,
 date: selectedDate, time: selectedTime,
 type, reason, fee: doctor.consultation_fee
 });
 setAppointmentId(appt.id);
 setStep(2);
 } catch (e) { setError(e.message); }
 };

 const processPayment = async () => {
 if (payMethod === 'card') {
   if (!card.number || !card.holder || !card.expiry || !card.cvv) return setError('Fill all payment fields');
   if (card.number.replace(/\s/g, '').length < 16) return setError('Invalid card number');
 } else if (payMethod === 'wallet') {
   if (!walletPhone || walletPhone.length < 11) return setError('Please enter a valid 11-digit mobile number');
 } else {
   if (!instapayId || !instapayId.includes('@')) return setError('Please enter a valid InstaPay Address (IPA) containing @');
 }
 setError(''); setPaying(true);
 try {
 await new Promise(r => setTimeout(r, 1800)); // simulate processing
 await api.processPayment({
 appointmentId, patientId: user.profileId,
 amount: doctor.consultation_fee,
 cardNumber: payMethod === 'card' ? card.number.replace(/\s/g, '') : (payMethod === 'wallet' ? walletPhone : instapayId),
 cardHolder: payMethod === 'card' ? card.holder : (payMethod === 'wallet' ? 'Mobile Wallet User' : 'InstaPay User'),
 });
 onBooked();
 } catch (e) { setError(e.message); setPaying(false); }
 };

 const formatCard = (val) => {
 const v = val.replace(/\D/g, '').slice(0, 16);
 return v.replace(/(.{4})/g, '$1 ').trim();
 };

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
 <div className="fade" style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
 {/* Header */}
 <div style={{ padding: 'min(5vw, 24px) min(6vw, 28px)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{step === 1 ? 'Book Appointment' : 'Secure Payment'}</h2>
 <p style={{ color: C.gray, fontSize: 13, marginTop: 2 }}>{step === 1 ? `with ${doctor.full_name}` : `Consultation fee: EGP ${doctor.consultation_fee}`}</p>
 </div>
 <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>

 <div style={{ padding: 'min(6vw, 28px)' }}>
 {/* Steps indicator */}
 <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
 {['Select Slot', 'Pay & Confirm'].map((s, i) => (
 <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step > i ? C.primary : '#e2e8f0', transition: 'background .3s' }} />
 ))}
 </div>

 {error && <div style={{ background: '#fef2f2', color: C.red, padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, border: '1px solid #fecaca' }}>{error}</div>}

 {step === 1 && (
 <>
 <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
 <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
 {doctor.avatar ? <img src={doctor.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="doctor"/> : (doctor.specialty_icon || '')}
 </div>
 <div>
 <div style={{ fontWeight: 700, color: C.dark }}>{doctor.full_name}</div>
 <div style={{ color: C.primary, fontSize: 13 }}>{doctor.specialty_name} · EGP {doctor.consultation_fee}/visit</div>
 </div>
 </div>

 <div style={{ marginBottom: 16 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Appointment Date</label>
 <input type="date" min={today} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
 style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
 </div>

 {selectedDate && (
 <div style={{ marginBottom: 16 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Available Time Slots</label>
 {slots.length === 0 ? (
 <p style={{ color: C.gray, fontSize: 13, padding: '12px', background: '#f8fafc', borderRadius: 8 }}>No slots available on this date</p>
 ) : (
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
 {slots.map(sl => (
 <button key={sl.time} disabled={!sl.available} onClick={() => setSelectedTime(sl.time)}
 style={{ padding: '8px 14px', borderRadius: 8, border: `2px solid ${selectedTime === sl.time ? C.primary : '#e2e8f0'}`, background: !sl.available ? '#f8fafc' : selectedTime === sl.time ? C.primary : '#fff', color: !sl.available ? '#cbd5e1' : selectedTime === sl.time ? '#fff' : C.dark, fontSize: 13, fontWeight: 600, cursor: sl.available ? 'pointer' : 'not-allowed', textDecoration: !sl.available ? 'line-through' : 'none' }}>
 {sl.time}
 </button>
 ))}
 </div>
 )}
 </div>
 )}

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
 {['in-person', 'video'].map(t => (
 <button key={t} onClick={() => setType(t)} style={{ padding: '12px', borderRadius: 10, border: `2px solid ${type === t ? C.primary : '#e2e8f0'}`, background: type === t ? '#eff6ff' : '#f8fafc', color: type === t ? C.primary : C.gray, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
 {t === 'in-person' ? ' In-Person' : ' Video Call'}
 </button>
 ))}
 </div>

 <div style={{ marginBottom: 24 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Reason for Visit (optional)</label>
 <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your symptoms or reason for consultation..." rows={3}
 style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'none' }} />
 </div>

 <button onClick={bookSlot} style={{ width: '100%', padding: '14px', background: C.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
 Continue to Payment →
 </button>
 </>
 )}

 {step === 2 && (
 <>
 {/* Order Summary */}
 <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 24 }}>
 <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: 12 }}>Booking Summary</h3>
 {[
 { l: 'Doctor', v: doctor.full_name },
 { l: 'Specialty', v: doctor.specialty_name },
 { l: 'Date', v: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
 { l: 'Time', v: selectedTime },
 { l: 'Type', v: type === 'in-person' ? ' In-Person' : ' Video Call' },
 ].map(row => (
 <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dbeafe', fontSize: 14 }}>
 <span style={{ color: C.gray }}>{row.l}</span>
 <span style={{ fontWeight: 600, color: C.dark }}>{row.v}</span>
 </div>
 ))}
 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: 18, fontWeight: 800 }}>
 <span style={{ color: C.dark }}>Total</span>
 <span style={{ color: C.primary }}>EGP {doctor.consultation_fee}</span>
 </div>
 </div>

 {/* Payment Selection */}
 <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: 16 }}>Payment Method</h3>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
   <button onClick={() => setPayMethod('card')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, border: `1.5px solid ${payMethod === 'card' ? C.primary : '#e2e8f0'}`, background: payMethod === 'card' ? '#eff6ff' : '#f8fafc', color: payMethod === 'card' ? C.primary : C.gray, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
     <CreditCard size={24} />
     <span style={{ fontSize: 13 }}>Card</span>
   </button>
   <button onClick={() => setPayMethod('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, border: `1.5px solid ${payMethod === 'wallet' ? C.green : '#e2e8f0'}`, background: payMethod === 'wallet' ? '#f0fdf4' : '#f8fafc', color: payMethod === 'wallet' ? C.green : C.gray, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
     <Smartphone size={24} />
     <span style={{ fontSize: 13 }}>Wallet</span>
   </button>
   <button onClick={() => setPayMethod('instapay')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, border: `1.5px solid ${payMethod === 'instapay' ? '#8b5cf6' : '#e2e8f0'}`, background: payMethod === 'instapay' ? '#f5f3ff' : '#f8fafc', color: payMethod === 'instapay' ? '#8b5cf6' : C.gray, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
     <Zap size={24} />
     <span style={{ fontSize: 13 }}>InstaPay</span>
   </button>
 </div>

 {payMethod === 'card' && (
   <div className="fade">
     <div style={{ marginBottom: 14 }}>
     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Card Number</label>
     <input value={card.number} onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))} placeholder="1234 5678 9012 3456" maxLength={19}
     style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', letterSpacing: '1px', fontFamily: 'monospace' }} />
     </div>
     <div style={{ marginBottom: 14 }}>
     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Cardholder Name</label>
     <input value={card.holder} onChange={e => setCard(c => ({ ...c, holder: e.target.value }))} placeholder="Ahmed Khalil"
     style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' }} />
     </div>
     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
     <div>
     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Expiry Date</label>
     <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY" maxLength={5}
     style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' }} />
     </div>
     <div>
     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>CVV</label>
     <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} placeholder="123" maxLength={4} type="password"
     style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' }} />
     </div>
     </div>
   </div>
 )}
 
 {payMethod === 'wallet' && (
   <div className="fade" style={{ marginBottom: 24 }}>
     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Mobile Wallet Number</label>
     <div style={{ display: 'flex', gap: 12 }}>
       <select style={{ padding: '12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#fff', color: C.dark, fontWeight: 600 }}>
         <option>Vodafone Cash</option>
         <option>Orange Cash</option>
         <option>Etisalat Cash</option>
         <option>WE Pay</option>
       </select>
       <input value={walletPhone} onChange={e => setWalletPhone(e.target.value.replace(/\D/g, ''))} placeholder="010 1234 5678" maxLength={11}
       style={{ flex: 1, width: '100%', minWidth: 0, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', letterSpacing: '1px', fontFamily: 'monospace' }} />
     </div>
     <p style={{ fontSize: 12, color: C.gray, marginTop: 10, lineHeight: 1.4 }}>You will receive an instant Push Notification on your phone to strictly confirm your EGP deduction.</p>
   </div>
 )}

 {payMethod === 'instapay' && (
   <div className="fade" style={{ marginBottom: 24 }}>
     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>InstaPay Address (IPA)</label>
     <input value={instapayId} onChange={e => setInstapayId(e.target.value)} placeholder="ahmed@instapay" 
     style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none', letterSpacing: '0.5px' }} />
     <p style={{ fontSize: 12, color: C.gray, marginTop: 10, lineHeight: 1.4 }}>A payment request will be sent to your InstaPay app instantly. Please approve it to confirm.</p>
   </div>
 )}

 <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 12, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
 <span style={{ display: 'flex' }}><Lock size={18} color="#065f46" /></span>
 <span style={{ color: '#065f46', fontSize: 13 }}>Your payment is encrypted and secure. We do not store your card details.</span>
 </div>

 {paying ? (
 <div style={{ textAlign: 'center', padding: '20px 0' }}>
 <div style={{ width: 48, height: 48, border: `3px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
 <p style={{ color: C.dark, fontWeight: 600 }}>Processing payment...</p>
 </div>
 ) : (
 <div style={{ display: 'flex', gap: 12 }}>
 <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: C.dark, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
 <button onClick={processPayment} style={{ flex: 2, padding: '14px', background: C.green, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
 Pay EGP {doctor.consultation_fee}
 </button>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 </div>
 );
}

function ReviewModal({ appointment, user, onClose, onSubmit }) {
 const [rating, setRating] = useState(5);
 const [comment, setComment] = useState('');
 const [loading, setLoading] = useState(false);

 const submit = async () => {
 setLoading(true);
 try {
 await api.submitReview({ patientId: user.profileId, doctorId: appointment.doctor_id, appointmentId: appointment.id, rating, comment });
 onSubmit();
 } catch (e) { alert(e.message); }
 finally { setLoading(false); }
 };

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
 <div className="fade" style={{ background: '#fff', borderRadius: 20, padding: 'min(6vw, 32px)', width: '100%', maxWidth: 420 }}>
 <h2 style={{ fontWeight: 800, color: C.dark, marginBottom: 8 }}>Leave a Review</h2>
 <p style={{ color: C.gray, fontSize: 14, marginBottom: 24 }}>How was your consultation with {appointment.doctor_name}?</p>
 <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
 {[1,2,3,4,5].map(n => (
 <button key={n} onClick={() => setRating(n)} style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', filter: n <= rating ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</button>
 ))}
 </div>
 <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)..." rows={3}
 style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'none', marginBottom: 20 }} />
 <div style={{ display: 'flex', gap: 12 }}>
 <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f1f5f9', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
 <button onClick={submit} disabled={loading} style={{ flex: 2, padding: '12px', background: C.primary, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
 {loading ? 'Submitting...' : 'Submit Review'}
 </button>
 </div>
 </div>
 </div>
 );
}

function VideoCallModal({ appointment, activeLink, loading, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
    <div className="fade" style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
    <h2 style={{ fontWeight: 800, color: C.dark, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
    Video Consultation
    </h2>
    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
    {loading ? (
      <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray }}>Checking for active link...</div>
    ) : activeLink ? (
    <>
    <p style={{ color: C.gray, fontSize: 14, marginBottom: 20 }}>{appointment.doctor_name} has provided a meeting link for your consultation.</p>
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
    <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: '13px', background: '#f1f5f9', color: C.dark, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Close</button>
    </>
    )}
    </div>
    </div>
  );
}

 export default function MyAppointments({ user, onNav, initialBooking, onClearBooking, isProfileComplete, onMessage }) {
 const [appointments, setAppointments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState('upcoming');
 const [bookingDoc, setBookingDoc] = useState(initialBooking);
 const [reviewAppt, setReviewAppt] = useState(null);
 const [payingAppt, setPayingAppt] = useState(null);
 const [success, setSuccess] = useState('');
 const [videoCallAppt, setVideoCallAppt] = useState(null);
 const [activeLink, setActiveLink] = useState(null);
 const [loadingLink, setLoadingLink] = useState(false);

 useEffect(() => {
 if (initialBooking) { setBookingDoc(initialBooking); }
 }, [initialBooking]);

 const load = async () => {
 if (!user.profileId) return setLoading(false);
 try {
 const data = await api.getPatientAppointments(user.profileId);
 setAppointments(data);
 } catch (e) { console.error(e); }
 finally { setLoading(false); }
 };

 useEffect(() => {
   load();
   let interval = setInterval(load, 3000);
   return () => clearInterval(interval);
 }, [user]);

 const cancel = async (id) => {
 if (!window.confirm('Cancel this appointment?')) return;
 await api.updateAppointmentStatus(id, 'cancelled');
 load();
 };

 const handleVideoCall = async (appt) => {
   setVideoCallAppt(appt);
   setLoadingLink(true);
   try {
     const conv = await api.startConversation({ patientId: user.profileId, doctorId: appt.doctor_id });
     const msgs = await api.getMessages(conv.id);
     const linkMsg = [...msgs].reverse().find(m => m.content?.startsWith('[VIDEO_MEETING]'));
     setActiveLink(linkMsg ? linkMsg.content.replace('[VIDEO_MEETING]', '') : null);
   } catch (e) {
     console.error(e);
   } finally {
     setLoadingLink(false);
   }
 };

 const onBooked = () => {
 setBookingDoc(null);
 onClearBooking?.();
 setSuccess('🎉 Appointment booked & payment confirmed!');
 setTimeout(() => setSuccess(''), 4000);
 load();
 setTab('upcoming');
 };

 const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
 const upcoming = appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.appointment_date?.substring(0, 10) >= todayStr).reverse();
 const completed = appointments.filter(a => a.status === 'completed');
 const past = appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.appointment_date?.substring(0, 10) < todayStr);
 const cancelled = appointments.filter(a => a.status === 'cancelled');
 const tabs = [
   { id: 'upcoming', label: `Upcoming (${upcoming.length})` }, 
   { id: 'completed', label: `Completed (${completed.length})` }, 
   { id: 'past', label: `Past (${past.length})` }, 
   { id: 'cancelled', label: `Cancelled (${cancelled.length})` }
 ];
 const shown = tab === 'upcoming' ? upcoming : tab === 'completed' ? completed : tab === 'past' ? past : cancelled;

 return (
 <div className="fade" style={{ padding: 32 }}>
 {videoCallAppt && (
   <VideoCallModal appointment={videoCallAppt} activeLink={activeLink} loading={loadingLink} onClose={() => setVideoCallAppt(null)} />
 )}
 {bookingDoc && (
 <BookModal doctor={bookingDoc} user={user} onClose={() => { setBookingDoc(null); onClearBooking?.(); }} onBooked={onBooked} />
 )}
 {reviewAppt && (
 <ReviewModal appointment={reviewAppt} user={user} onClose={() => setReviewAppt(null)} onSubmit={() => { setReviewAppt(null); load(); setSuccess('Review submitted!'); setTimeout(() => setSuccess(''), 3000); }} />
 )}
 {payingAppt && <BookModal doctor={{ id: payingAppt.doctor_id, avatar: payingAppt.doctor_avatar, specialty_icon: payingAppt.specialty_icon, full_name: payingAppt.doctor_name, specialty_name: payingAppt.specialty, consultation_fee: payingAppt.fee || payingAppt.consultation_fee }} user={user} onClose={() => setPayingAppt(null)} onBooked={() => { setPayingAppt(null); onBooked(); }} initialAppointment={payingAppt} />}

 <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>My Appointments</h1>
 <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Track and manage your consultations</p>
 </div>
 </div>

 {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 600, fontSize: 15 }}>{success}</div>}

 {/* Tabs */}
 <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
 {tabs.map(t => (
 <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === t.id ? C.primary : 'transparent', color: tab === t.id ? '#fff' : C.gray, transition: 'all .15s' }}>{t.label}</button>
 ))}
 </div>

 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>Loading...</div>
 ) : shown.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray }}>
 <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Calendar color="#cbd5e1" size={56} strokeWidth={1.5} /></div>
 <p style={{ fontSize: 17 }}>No {tab} appointments</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 {shown.map(a => {
 const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
 return (
 <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: 'min(5vw, 24px)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
 <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, overflow: 'hidden' }}>
 {a.doctor_avatar ? <img src={a.doctor_avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="doctor" /> : (a.specialty_icon || '')}
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
 <span style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{a.doctor_name}</span>
 <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>{a.status}</span>
 {a.is_paid && <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#d1fae5', color: '#065f46' }}>Paid</span>}
 </div>
 <div style={{ color: C.gray, fontSize: 14 }}>{a.specialty} · {a.clinic_name}</div>
 <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>
 {new Date(a.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {a.appointment_time?.slice(0,5)} · {a.type === 'video' ? ' Video' : ' In-Person'}
 </div>
 {a.reason && <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>{a.reason}</div>}
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
 <span style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>EGP {a.fee || a.consultation_fee}</span>
 {tab === 'upcoming' && (
   <button onClick={() => onMessage({ doctor_id: a.doctor_id })} style={{ padding: '8px 16px', background: `${C.primary}15`, color: C.primary, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Message</button>
 )}
 {tab === 'upcoming' && (
   <button onClick={() => handleVideoCall(a)} style={{ padding: '8px 16px', background: '#eff6ff', color: C.primary, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
    Video Call
   </button>
 )}
 {a.status === 'pending' && !a.is_paid && tab === 'upcoming' && (
 <button onClick={() => setPayingAppt(a)} style={{ padding: '8px 16px', background: C.green, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Pay to Confirm</button>
 )}
 {(a.status === 'confirmed' || a.status === 'pending') && tab === 'upcoming' && (
 <button onClick={() => cancel(a.id)} style={{ padding: '8px 16px', background: '#fef2f2', color: C.red, border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Cancel</button>
 )}
 {a.status === 'completed' && !a.has_review && (
 <button onClick={() => setReviewAppt(a)} style={{ padding: '8px 16px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Review</button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
