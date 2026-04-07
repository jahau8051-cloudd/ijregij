import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { Calendar, Lock } from 'lucide-react';

const C = { primary: '#3b82f6', dark: '#0f172a', gray: '#64748b', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };

const STATUS_COLORS = {
 pending: { bg: '#fef9c3', color: '#854d0e' },
 confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
 completed: { bg: '#d1fae5', color: '#065f46' },
 cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

function BookModal({ doctor, user, onClose, onBooked }) {
 const [slots, setSlots] = useState([]);
 const [selectedDate, setSelectedDate] = useState('');
 const [selectedTime, setSelectedTime] = useState('');
 const [type, setType] = useState('in-person');
 const [reason, setReason] = useState('');
 const [step, setStep] = useState(1); // 1=book, 2=pay
 const [paying, setPaying] = useState(false);
 const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });
 const [error, setError] = useState('');
 const [appointmentId, setAppointmentId] = useState(null);

 const today = new Date().toISOString().split('T')[0];

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
 if (!card.number || !card.holder || !card.expiry || !card.cvv) return setError('Fill all payment fields');
 if (card.number.replace(/\s/g, '').length < 16) return setError('Invalid card number');
 setError(''); setPaying(true);
 try {
 await new Promise(r => setTimeout(r, 1800)); // simulate processing
 await api.processPayment({
 appointmentId, patientId: user.profileId,
 amount: doctor.consultation_fee,
 cardNumber: card.number.replace(/\s/g, ''),
 cardHolder: card.holder,
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
 <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{step === 1 ? 'Book Appointment' : 'Secure Payment'}</h2>
 <p style={{ color: C.gray, fontSize: 13, marginTop: 2 }}>{step === 1 ? `with ${doctor.full_name}` : `Consultation fee: $${doctor.consultation_fee}`}</p>
 </div>
 <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 18, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>

 <div style={{ padding: 28 }}>
 {/* Steps indicator */}
 <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
 {['Select Slot', 'Pay & Confirm'].map((s, i) => (
 <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step > i ? C.primary : '#e2e8f0', transition: 'background .3s' }} />
 ))}
 </div>

 {error && <div style={{ background: '#fef2f2', color: C.red, padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, border: '1px solid #fecaca' }}>{error}</div>}

 {step === 1 && (
 <>
 <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 12 }}>
 <div style={{ fontSize: 28 }}>{doctor.specialty_icon || ''}</div>
 <div>
 <div style={{ fontWeight: 700, color: C.dark }}>{doctor.full_name}</div>
 <div style={{ color: C.primary, fontSize: 13 }}>{doctor.specialty_name} · ${doctor.consultation_fee}/visit</div>
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
 <span style={{ color: C.primary }}>${doctor.consultation_fee}</span>
 </div>
 </div>

 {/* Card Form */}
 <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: 16 }}>Payment Details</h3>
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
 Pay ${doctor.consultation_fee}
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
 <div className="fade" style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420 }}>
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

export default function MyAppointments({ user, initialBooking, onClearBooking }) {
 const [appointments, setAppointments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState('upcoming');
 const [bookingDoc, setBookingDoc] = useState(initialBooking);
 const [reviewAppt, setReviewAppt] = useState(null);
 const [success, setSuccess] = useState('');

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

 useEffect(() => { load(); }, [user]);

 const cancel = async (id) => {
 if (!window.confirm('Cancel this appointment?')) return;
 await api.updateAppointmentStatus(id, 'cancelled');
 load();
 };

 const onBooked = () => {
 setBookingDoc(null);
 onClearBooking?.();
 setSuccess('🎉 Appointment booked & payment confirmed!');
 setTimeout(() => setSuccess(''), 4000);
 load();
 setTab('upcoming');
 };

 const now = new Date();
 const upcoming = appointments.filter(a => a.status !== 'cancelled' && new Date(a.appointment_date) >= now);
 const past = appointments.filter(a => a.status === 'completed' || new Date(a.appointment_date) < now);
 const cancelled = appointments.filter(a => a.status === 'cancelled');
 const tabs = [{ id: 'upcoming', label: `Upcoming (${upcoming.length})` }, { id: 'past', label: `Past (${past.length})` }, { id: 'cancelled', label: `Cancelled (${cancelled.length})` }];
 const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

 return (
 <div className="fade" style={{ padding: 32 }}>
 {bookingDoc && (
 <BookModal doctor={bookingDoc} user={user} onClose={() => { setBookingDoc(null); onClearBooking?.(); }} onBooked={onBooked} />
 )}
 {reviewAppt && (
 <ReviewModal appointment={reviewAppt} user={user} onClose={() => setReviewAppt(null)} onSubmit={() => { setReviewAppt(null); load(); setSuccess('Review submitted!'); setTimeout(() => setSuccess(''), 3000); }} />
 )}

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
 <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 20, alignItems: 'center' }}>
 <div style={{ width: 56, height: 56, borderRadius: 14, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
 {a.specialty_icon || ''}
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
 <span style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>${a.fee || a.consultation_fee}</span>
 {a.status === 'confirmed' && (
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
