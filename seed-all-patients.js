import pg from 'pg';
const { Client } = pg;
const DATABASE_URL = 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
const client = new Client({ connectionString: DATABASE_URL });

async function seed() {
  await client.connect();
  console.log('Connected. Seeding data for ALL patients...');

  const patients = (await client.query("SELECT p.id, p.user_id, u.full_name FROM patients p JOIN users u ON p.user_id=u.id ORDER BY p.id")).rows;
  const doctors = (await client.query("SELECT d.id, d.user_id, u.full_name, d.consultation_fee FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.status='approved' ORDER BY d.id")).rows;

  console.log(`Found ${patients.length} patients, ${doctors.length} doctors`);

  // Check which patients already have appointments
  for (const p of patients) {
    const count = (await client.query('SELECT COUNT(*) as c FROM appointments WHERE patient_id=$1', [p.id])).rows[0].c;
    if (parseInt(count) > 0) {
      console.log(`  ✓ Patient ${p.id} (${p.full_name}) already has ${count} appointments - skipping`);
      continue;
    }

    console.log(`  → Seeding data for patient ${p.id} (${p.full_name})...`);

    // Pick 3-4 random doctors for each patient
    const shuffled = [...doctors].sort(() => Math.random() - 0.5);
    const selectedDocs = shuffled.slice(0, Math.min(4, doctors.length));

    const statuses = ['confirmed', 'pending', 'completed', 'completed'];
    const types = ['in-person', 'video', 'in-person', 'video'];
    const reasons = [
      'Regular health checkup and consultation',
      'Follow-up appointment for ongoing treatment',
      'New symptoms evaluation and diagnosis',
      'Prescription renewal and medical review'
    ];

    const apptIds = [];

    for (let i = 0; i < selectedDocs.length; i++) {
      const d = selectedDocs[i];
      const fee = d.consultation_fee || 300;
      // Completed appointments in the past, upcoming ones in the future
      const isPast = statuses[i] === 'completed';
      const baseDate = new Date();
      if (isPast) {
        baseDate.setDate(baseDate.getDate() - (10 + i * 5));
      } else {
        baseDate.setDate(baseDate.getDate() + (3 + i * 2));
      }
      const dateStr = baseDate.toISOString().split('T')[0];
      const time = `${9 + i}:${i % 2 === 0 ? '00' : '30'}`;

      const r = await client.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, type, reason, fee) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [p.id, d.id, dateStr, time, statuses[i], types[i], reasons[i], fee]
      );
      apptIds.push({ id: r.rows[0].id, status: statuses[i], fee, doctorId: d.id, patientId: p.id });
      console.log(`    Appt: ${d.full_name} (${dateStr} ${statuses[i]})`);
    }

    // Payments for confirmed and completed appointments
    for (const a of apptIds) {
      if (a.status === 'confirmed' || a.status === 'completed') {
        const txId = 'TXN' + Date.now() + Math.floor(Math.random() * 9999);
        await client.query(
          "INSERT INTO payments (appointment_id, patient_id, doctor_id, amount, payment_method, card_last4, transaction_id, status) VALUES ($1,$2,$3,$4,'card','4532',$5,'completed')",
          [a.id, a.patientId, a.doctorId, a.fee, txId]
        );
      }
    }

    // Prescriptions for completed appointments
    const completed = apptIds.filter(a => a.status === 'completed');
    const rxTemplates = [
      { meds: [{ name: 'Panadol Extra', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' }, { name: 'Vitamin C', dosage: '1000mg', frequency: 'Once daily', duration: '14 days' }], diagnosis: 'Mild flu symptoms and fatigue', notes: 'Rest well and stay hydrated.' },
      { meds: [{ name: 'Augmentin', dosage: '625mg', frequency: 'Twice daily', duration: '7 days' }, { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '5 days' }], diagnosis: 'Upper respiratory infection', notes: 'Complete the full antibiotic course.' },
    ];

    for (let i = 0; i < completed.length && i < rxTemplates.length; i++) {
      const a = completed[i];
      const rx = rxTemplates[i];
      await client.query(
        'INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, medications, diagnosis, notes) VALUES ($1,$2,$3,$4,$5,$6)',
        [a.id, a.patientId, a.doctorId, JSON.stringify(rx.meds), rx.diagnosis, rx.notes]
      );
    }

    // Conversation with first doctor
    const firstDoc = selectedDocs[0];
    const pUserId = (await client.query('SELECT user_id FROM patients WHERE id=$1', [p.id])).rows[0]?.user_id;
    const dUserId = (await client.query('SELECT user_id FROM doctors WHERE id=$1', [firstDoc.id])).rows[0]?.user_id;
    
    if (pUserId && dUserId) {
      const existing = await client.query('SELECT id FROM conversations WHERE patient_id=$1 AND doctor_id=$2', [p.id, firstDoc.id]);
      if (existing.rows.length === 0) {
        const convR = await client.query(
          'INSERT INTO conversations (patient_id, doctor_id, last_message, last_message_at) VALUES ($1,$2,$3,NOW()) RETURNING id',
          [p.id, firstDoc.id, 'Thank you, Doctor. I will follow your advice.']
        );
        const convId = convR.rows[0].id;
        await client.query('INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1,$2,$3)', [convId, pUserId, 'Hello Doctor, I have a question about my treatment.']);
        await client.query('INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1,$2,$3)', [convId, dUserId, 'Hello! Please go ahead and ask.']);
        await client.query('INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1,$2,$3)', [convId, pUserId, 'Thank you, Doctor. I will follow your advice.']);
      }
    }
  }

  console.log('\n✅ All patients now have data!');
  const counts = await client.query(`SELECT
    (SELECT COUNT(*) FROM appointments) as appointments,
    (SELECT COUNT(*) FROM payments) as payments,
    (SELECT COUNT(*) FROM prescriptions) as prescriptions,
    (SELECT COUNT(*) FROM conversations) as conversations,
    (SELECT COUNT(*) FROM messages) as messages`);
  console.log('Total counts:', counts.rows[0]);

  await client.end();
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
