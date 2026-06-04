async function req(method, path, body) {
  const isCapacitor = typeof window !== 'undefined' && window?.Capacitor?.isNative;
  const BASE = isCapacitor || import.meta.env.PROD ? 'https://la-phi.vercel.app/api' : '/api';
  
  const opts = { method, headers: { 'Content-Type': 'application/json' }, cache: 'no-store' };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + path + (path.includes('?') ? '&' : '?') + `_t=${Date.now()}`, opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // Auth
  signup: (d) => req('POST', '/auth/signup', d),
  signin: (d) => req('POST', '/auth/signin', d),
  updatePassword: (id, d) => req('PUT', `/users/${id}/password`, d),
  updateAvatar: (id, avatarURL) => req('PUT', `/users/${id}/avatar`, { avatar: avatarURL }),
  sendChatMessage: (messages) => req('POST', '/chat', { messages }),

  // Specialties
  getSpecialties: () => req('GET', '/specialties'),

  // Doctors
  getDoctors: (params = {}) => req('GET', '/doctors?' + new URLSearchParams(params)),
  getAllDoctors: () => req('GET', '/doctors/all'),
  getDoctor: (id) => req('GET', `/doctors/${id}`),
  updateDoctor: (id, d) => req('PUT', `/doctors/${id}`, d),
  updateDoctorStatus: (id, status) => req('PUT', `/doctors/${id}/status`, { status }),
  deleteDoctor: (id) => req('DELETE', `/doctors/${id}`),
  getDoctorSlots: (id, date) => req('GET', `/doctors/${id}/slots?date=${date}`),
  getDoctorAppointments: (id) => req('GET', `/doctors/${id}/appointments`),
  getDoctorEarnings: (id) => req('GET', `/doctors/${id}/earnings`),

  // Patients
  getPatient: (id) => req('GET', `/patients/${id}`),
  updatePatient: (id, d) => req('PUT', `/patients/${id}`, d),
  getPatientAppointments: (id) => req('GET', `/patients/${id}/appointments`),
  getPatientPrescriptions: (id) => req('GET', `/patients/${id}/prescriptions`),
  getPatientPayments: (id) => req('GET', `/patients/${id}/payments`),
  getAllPatients: () => req('GET', '/patients/all'),

  // Appointments
  bookAppointment: (d) => req('POST', '/appointments', d),
  updateAppointmentStatus: (id, status, notes) => req('PUT', `/appointments/${id}/status`, { status, notes }),
  getAllAppointments: () => req('GET', '/appointments/all'),

  // Payments
  processPayment: (d) => req('POST', '/payments', d),
  getAllPayments: () => req('GET', '/payments'),

  // Prescriptions
  createPrescription: (d) => req('POST', '/prescriptions', d),

  // Messages
  getConversations: (userId, role) => req('GET', `/conversations?userId=${userId}&role=${role}`),
  startConversation: (d) => req('POST', '/conversations', d),
  getMessages: (convId) => req('GET', `/conversations/${convId}/messages`),
  sendMessage: (convId, d) => req('POST', `/conversations/${convId}/messages`, d),

  // Reviews
  submitReview: (d) => req('POST', '/reviews', d),

  // Admin
  getAdminStats: () => {
    const d = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return req('GET', `/admin/stats?date=${d}`);
  },
  toggleUserActive: (id) => req('PUT', `/admin/users/${id}/toggle`, {}),
  createAdminDoctor: (d) => req('POST', '/admin/doctors', d),
};
