import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
const client = new Client({ connectionString: DATABASE_URL });

async function seed() {
  await client.connect();
  console.log('Connected. Seeding appointments & payments...');

  // Get patient and doctor IDs
  const patients = (await client.query("SELECT p.id, u.full_name FROM patients p JOIN users u ON p.user_id=u.id ORDER BY p.id")).rows;
  const doctors = (await client.query("SELECT d.id, u.full_name, d.consultation_fee FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.status='approved' ORDER BY d.id")).rows;

  console.log(`Found ${patients.length} patients, ${doctors.length} doctors`);

  if (patients.length === 0 || doctors.length === 0) {
    console.log('No patients or doctors found. Run migrate first.');
    await client.end();
    return;
  }

  // Clear existing appointments/payments/prescriptions/reviews
  await client.query('DELETE FROM messages');
  await client.query('DELETE FROM conversations');
  await client.query('DELETE FROM reviews');
  await client.query('DELETE FROM prescriptions');
  await client.query('DELETE FROM payments');
  await client.query('DELETE FROM appointments');
  console.log('Cleared old data.');

  // Seed appointments: mix of completed, confirmed, pending
  const appointmentData = [
    // Patient 1 appointments
    { pid: 0, did: 0, date: '2026-04-12', time: '10:00', status: 'confirmed', type: 'in-person', reason: 'Annual cardiac checkup and ECG' },
    { pid: 0, did: 2, date: '2026-04-14', time: '11:00', status: 'pending', type: 'video', reason: 'Follow-up on knee pain after physical therapy' },
    { pid: 0, did: 5, date: '2026-03-20', time: '15:00', status: 'completed', type: 'video', reason: 'Anxiety management follow-up' },
    { pid: 0, did: 6, date: '2026-03-15', time: '09:30', status: 'completed', type: 'in-person', reason: 'General wellness checkup' },
    // Patient 2 appointments
    { pid: 1, did: 1, date: '2026-04-13', time: '09:30', status: 'confirmed', type: 'in-person', reason: 'Child vaccination schedule consultation' },
    { pid: 1, did: 3, date: '2026-04-15', time: '14:00', status: 'pending', type: 'in-person', reason: 'Persistent skin rash on forearms' },
    { pid: 1, did: 7, date: '2026-03-22', time: '11:30', status: 'completed', type: 'in-person', reason: 'Eye examination and vision test' },
    // Patient 3 appointments
    { pid: 2, did: 4, date: '2026-04-16', time: '10:30', status: 'confirmed', type: 'video', reason: 'Recurring headaches and dizziness' },
    { pid: 2, did: 8, date: '2026-03-25', time: '13:00', status: 'completed', type: 'in-person', reason: 'Dental cleaning and cavity check' },
    { pid: 2, did: 9, date: '2026-03-28', time: '10:00', status: 'cancelled', type: 'in-person', reason: 'Routine gynecology consultation' },
  ];

  const appointmentIds = [];
  for (const a of appointmentData) {
    const p = patients[a.pid];
    const d = doctors[a.did];
    if (!p || !d) continue;
    const fee = d.consultation_fee || 300;
    const r = await client.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, type, reason, fee) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [p.id, d.id, a.date, a.time, a.status, a.type, a.reason, fee]
    );
    appointmentIds.push({ id: r.rows[0].id, ...a, fee, patientId: p.id, doctorId: d.id });
    console.log(`  Appointment: ${p.full_name} → ${d.full_name} (${a.date} ${a.status})`);
  }

  // Seed payments for confirmed and completed appointments
  for (const a of appointmentIds) {
    if (a.status === 'confirmed' || a.status === 'completed') {
      const txId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
      await client.query(
        "INSERT INTO payments (appointment_id, patient_id, doctor_id, amount, payment_method, card_last4, transaction_id, status) VALUES ($1,$2,$3,$4,'card','4532',$5,'completed')",
        [a.id, a.patientId, a.doctorId, a.fee, txId]
      );
      console.log(`  Payment: $${a.fee} for appointment ${a.id}`);
    }
  }

  // Seed prescriptions for completed appointments
  const completedAppts = appointmentIds.filter(a => a.status === 'completed');
  const rxData = [
    { meds: [{ name: 'Lexapro (Escitalopram)', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Xanax (Alprazolam)', dosage: '0.25mg', frequency: 'As needed', duration: '14 days' }], diagnosis: 'Generalized Anxiety Disorder (GAD)', notes: 'Continue cognitive behavioral therapy sessions. Reduce caffeine intake.' },
    { meds: [{ name: 'Panadol Extra', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' }, { name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', duration: '30 days' }], diagnosis: 'Mild vitamin D deficiency, general fatigue', notes: 'Increase sun exposure and maintain balanced diet.' },
    { meds: [{ name: 'Refresh Tears Eye Drops', dosage: '1 drop', frequency: '4 times daily', duration: '14 days' }], diagnosis: 'Mild dry eye syndrome', notes: 'Reduce screen time. Use humidifier at home.' },
    { meds: [{ name: 'Augmentin', dosage: '625mg', frequency: 'Twice daily', duration: '7 days' }, { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '5 days' }], diagnosis: 'Dental abscess - lower left molar', notes: 'Cavity filled. Root canal may be needed if infection recurs.' },
  ];

  for (let i = 0; i < completedAppts.length && i < rxData.length; i++) {
    const a = completedAppts[i];
    const rx = rxData[i];
    await client.query(
      'INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, medications, diagnosis, notes) VALUES ($1,$2,$3,$4,$5,$6)',
      [a.id, a.patientId, a.doctorId, JSON.stringify(rx.meds), rx.diagnosis, rx.notes]
    );
    console.log(`  Prescription: ${rx.diagnosis}`);
  }

  // Seed conversations and messages
  const convos = [
    { pid: 0, did: 0, msgs: [
      { sender: 'patient', text: 'Hello Doctor, I wanted to confirm my appointment for Saturday.' },
      { sender: 'doctor', text: 'Yes, your appointment is confirmed at 10 AM. Please bring your previous ECG results.' },
      { sender: 'patient', text: 'Thank you doctor, I will bring my previous ECG results.' },
    ]},
    { pid: 1, did: 1, msgs: [
      { sender: 'patient', text: 'Good morning Doctor, my child has had a mild fever. Should I still come for the vaccination?' },
      { sender: 'doctor', text: 'Good morning. If the fever is below 38.5, it should be fine. Give Calpol and monitor.' },
    ]},
    { pid: 2, did: 4, msgs: [
      { sender: 'patient', text: 'Doctor, I started the new medication you prescribed. How long until I see results?' },
      { sender: 'doctor', text: 'It usually takes 1-2 weeks for the full effect. Please keep a headache diary.' },
      { sender: 'patient', text: 'The headaches have reduced since starting the medication.' },
    ]},
  ];

  for (const c of convos) {
    const p = patients[c.pid];
    const d = doctors[c.did];
    if (!p || !d) continue;
    const pUser = (await client.query('SELECT user_id FROM patients WHERE id=$1', [p.id])).rows[0];
    const dUser = (await client.query('SELECT user_id FROM doctors WHERE id=$1', [d.id])).rows[0];
    const lastMsg = c.msgs[c.msgs.length - 1].text;
    const convR = await client.query(
      'INSERT INTO conversations (patient_id, doctor_id, last_message, last_message_at) VALUES ($1,$2,$3,NOW()) RETURNING id',
      [p.id, d.id, lastMsg]
    );
    const convId = convR.rows[0].id;
    for (const m of c.msgs) {
      const senderId = m.sender === 'patient' ? pUser.user_id : dUser.user_id;
      await client.query('INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1,$2,$3)', [convId, senderId, m.text]);
    }
    console.log(`  Conversation: ${p.full_name} ↔ ${d.full_name} (${c.msgs.length} messages)`);
  }

  // Seed reviews for completed appointments
  const reviewData = [
    { rating: 5, comment: 'Excellent doctor! Very thorough and professional. Highly recommended!' },
    { rating: 4, comment: 'Great experience. The video call was smooth and she made me feel comfortable.' },
    { rating: 5, comment: 'Very gentle and explained the condition clearly. Well-equipped clinic.' },
    { rating: 4, comment: 'Good work. The procedure was painless. Only a short wait.' },
  ];

  for (let i = 0; i < completedAppts.length && i < reviewData.length; i++) {
    const a = completedAppts[i];
    const rv = reviewData[i];
    await client.query(
      'INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES ($1,$2,$3,$4,$5)',
      [a.patientId, a.doctorId, a.id, rv.rating, rv.comment]
    );
    // Update doctor rating
    const stats = await client.query('SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE doctor_id=$1', [a.doctorId]);
    await client.query('UPDATE doctors SET rating=$1, total_reviews=$2 WHERE id=$3',
      [Math.round(parseFloat(stats.rows[0].avg_rating) * 10) / 10, parseInt(stats.rows[0].total), a.doctorId]);
    console.log(`  Review: ${rv.rating}★ for doctor ${a.doctorId}`);
  }

  console.log('\n✅ Seeding complete!');
  const counts = await client.query(`SELECT
    (SELECT COUNT(*) FROM appointments) as appointments,
    (SELECT COUNT(*) FROM payments) as payments,
    (SELECT COUNT(*) FROM prescriptions) as prescriptions,
    (SELECT COUNT(*) FROM conversations) as conversations,
    (SELECT COUNT(*) FROM messages) as messages,
    (SELECT COUNT(*) FROM reviews) as reviews`);
  console.log('Database counts:', counts.rows[0]);

  await client.end();
}

seed().catch(err => { console.error('Seeding failed:', err.message); process.exit(1); });
