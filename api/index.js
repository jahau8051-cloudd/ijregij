import pg from 'pg';
const { Pool } = pg;

import express from 'express';

const app = express();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============ AUTH ============
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName, role, phone, licenseNumber, specialtyId, experienceYears, idDocument } = req.body;
  if (!email || !password || !fullName || !role) return res.status(400).json({ message: 'All fields required' });
  try {
    const hashedPwd = Buffer.from(password).toString('base64');
    const userRes = await pool.query(
      'INSERT INTO users (email, password, role, full_name, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, role, full_name',
      [email, hashedPwd, role, fullName, phone || null]
    );
    const user = userRes.rows[0];

    if (role === 'doctor') {
      await pool.query(
        "INSERT INTO doctors (user_id, license_number, specialty_id, experience_years, id_document, status) VALUES ($1,$2,$3,$4,$5,'pending')",
        [user.id, licenseNumber || null, specialtyId || null, experienceYears || 0, idDocument || null]
      );
      return res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, doctorStatus: 'pending' } });
    } else if (role === 'patient') {
      await pool.query('INSERT INTO patients (user_id) VALUES ($1)', [user.id]);
      const p = await pool.query('SELECT id FROM patients WHERE user_id=$1', [user.id]);
      return res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, profileId: p.rows[0]?.id } });
    }
    res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name } });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) return res.status(400).json({ message: 'This email is already registered' });
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPwd = Buffer.from(password).toString('base64');
    const r = await pool.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email, hashedPwd]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ message: 'Wrong email or password' });
    if (!user.is_active) return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });

    let profileId = null;
    let doctorStatus = null;

    if (user.role === 'doctor') {
      const d = await pool.query('SELECT id, status FROM doctors WHERE user_id=$1', [user.id]);
      profileId = d.rows[0]?.id;
      doctorStatus = d.rows[0]?.status;
      if (doctorStatus === 'pending') {
        return res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, doctorStatus: 'pending' } });
      }
      if (doctorStatus === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended by the admin.' });
      }
    } else if (user.role === 'patient') {
      const p = await pool.query('SELECT id FROM patients WHERE user_id=$1', [user.id]);
      profileId = p.rows[0]?.id;
    }

    res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, profileId, doctorStatus } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ SPECIALTIES ============
app.get('/api/specialties', async (req, res) => {
  const r = await pool.query('SELECT * FROM specialties ORDER BY name');
  res.json(r.rows);
});

// ============ DOCTORS ============
app.get('/api/doctors', async (req, res) => {
  const { search, specialty, minRating, maxFee } = req.query;
  try {
    let query = `SELECT d.*, u.full_name, u.email, u.phone, u.avatar, s.name as specialty_name, s.icon as specialty_icon
      FROM doctors d JOIN users u ON d.user_id = u.id LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE u.is_active = 1 AND d.status = 'approved'`;
    const params = [];
    let idx = 1;
    if (search) {
      query += ` AND (u.full_name ILIKE $${idx} OR d.bio ILIKE $${idx} OR s.name ILIKE $${idx} OR d.clinic_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (specialty && specialty !== 'all') {
      query += ` AND s.name = $${idx}`;
      params.push(specialty);
      idx++;
    }
    if (minRating) {
      query += ` AND d.rating >= $${idx}`;
      params.push(parseFloat(minRating));
      idx++;
    }
    if (maxFee) {
      query += ` AND d.consultation_fee <= $${idx}`;
      params.push(parseFloat(maxFee));
      idx++;
    }
    query += ' ORDER BY d.rating DESC';
    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/doctors/all', async (req, res) => {
  try {
    const r = await pool.query(`SELECT d.*, u.full_name, u.email, u.phone, u.is_active, u.id as user_id,
      s.name as specialty_name, s.icon as specialty_icon
      FROM doctors d JOIN users u ON d.user_id = u.id LEFT JOIN specialties s ON d.specialty_id = s.id
      ORDER BY d.created_at DESC`);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const r = await pool.query(`SELECT d.*, u.full_name, u.email, u.phone, u.avatar, s.name as specialty_name, s.icon as specialty_icon
      FROM doctors d JOIN users u ON d.user_id = u.id LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE d.id = $1`, [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ message: 'Doctor not found' });
    const reviews = await pool.query(`SELECT r.*, u.full_name as patient_name
      FROM reviews r JOIN patients p ON r.patient_id = p.id JOIN users u ON p.user_id = u.id
      WHERE r.doctor_id = $1 ORDER BY r.created_at DESC LIMIT 10`, [req.params.id]);
    res.json({ ...r.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ SLOTS — generates available 30-min time intervals for a doctor on a given date
app.get('/api/doctors/:id/slots', async (req, res) => {
  const { date } = req.query;
  try {
    const docR = await pool.query('SELECT available_from, available_to, available_days FROM doctors WHERE id=$1', [req.params.id]);
    const doc = docR.rows[0];
    if (!doc) return res.json([]);

    // Check if doctor works on this day
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayOfWeek = dayNames[new Date(date).getDay()];
    const availDays = (doc.available_days || 'Sat,Sun,Mon,Tue,Wed').split(',').map(d => d.trim());
    if (!availDays.includes(dayOfWeek)) return res.json([]);

    // Get already booked times
    const bookedR = await pool.query(
      "SELECT appointment_time FROM appointments WHERE doctor_id=$1 AND appointment_date=$2 AND status != 'cancelled'",
      [req.params.id, date]
    );
    const bookedTimes = bookedR.rows.map(r => (r.appointment_time || '').slice(0, 5));

    const from = (doc.available_from || '09:00').slice(0, 5);
    const to = (doc.available_to || '17:00').slice(0, 5);
    const slots = [];
    let [h, m] = from.split(':').map(Number);
    const [endH, endM] = to.split(':').map(Number);
    while (h * 60 + m < endH * 60 + endM) {
      const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      slots.push({ time: timeStr, available: !bookedTimes.includes(timeStr) });
      m += 30;
      if (m >= 60) { h++; m -= 60; }
    }
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Doctor's appointments
app.get('/api/doctors/:id/appointments', async (req, res) => {
  try {
    const r = await pool.query(`SELECT a.*, u.full_name as patient_name, u.phone as patient_phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [req.params.id]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Doctor's earnings
app.get('/api/doctors/:id/earnings', async (req, res) => {
  try {
    const nowYM = new Date().toISOString().slice(0, 7); // '2026-04'
    const earnings = await pool.query(`SELECT COUNT(a.id) as total_appointments,
      COUNT(CASE WHEN a.status='completed' THEN 1 END) as completed,
      COALESCE(SUM(CASE WHEN a.status='completed' THEN p.amount ELSE 0 END),0) as total_earned,
      COALESCE(SUM(CASE WHEN a.status='completed' AND SUBSTRING(a.appointment_date,1,7)=$2 THEN p.amount ELSE 0 END),0) as this_month
      FROM appointments a LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.doctor_id = $1`, [req.params.id, nowYM]);
    const monthly = await pool.query(`SELECT SUBSTRING(a.appointment_date,6,2) as month,
      COALESCE(SUM(p.amount),0) as amount, COUNT(a.id) as appointments
      FROM appointments a LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.doctor_id=$1 AND a.status='completed'
      GROUP BY SUBSTRING(a.appointment_date,1,7), SUBSTRING(a.appointment_date,6,2)
      ORDER BY SUBSTRING(a.appointment_date,1,7) DESC LIMIT 6`, [req.params.id]);
    res.json({ ...(earnings.rows[0] || {}), monthly: monthly.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/doctors/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE doctors SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  const { bio, specialtyId, consultationFee, experienceYears, clinicName, clinicAddress, availableDays, availableFrom, availableTo, licenseNumber, education,
    consultation_fee, clinic_name, clinic_address, available_days, available_from, available_to, experience_years } = req.body;
  try {
    await pool.query(`UPDATE doctors SET bio=$1, consultation_fee=$2, clinic_name=$3, clinic_address=$4, available_days=$5, available_from=$6, available_to=$7, education=$8, experience_years=$9, specialty_id=COALESCE($10, specialty_id), license_number=COALESCE($11, license_number) WHERE id=$12`,
      [bio, consultationFee || consultation_fee, clinicName || clinic_name, clinicAddress || clinic_address, availableDays || available_days, availableFrom || available_from, availableTo || available_to, education, experienceYears || experience_years, specialtyId || null, licenseNumber || null, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const docR = await pool.query('SELECT user_id FROM doctors WHERE id=$1', [req.params.id]);
    if (!docR.rows[0]) return res.status(404).json({ message: 'Doctor not found' });
    const userId = docR.rows[0].user_id;
    const doctorId = req.params.id;
    await pool.query(`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE doctor_id=$1) OR sender_id=$2`, [doctorId, userId]);
    await pool.query(`DELETE FROM conversations WHERE doctor_id=$1`, [doctorId]);
    await pool.query(`DELETE FROM reviews WHERE doctor_id=$1`, [doctorId]);
    const appts = await pool.query('SELECT id FROM appointments WHERE doctor_id=$1', [doctorId]);
    for (const a of appts.rows) {
      await pool.query('DELETE FROM payments WHERE appointment_id=$1', [a.id]);
      await pool.query('DELETE FROM prescriptions WHERE appointment_id=$1', [a.id]);
    }
    await pool.query('DELETE FROM appointments WHERE doctor_id=$1', [doctorId]);
    await pool.query('DELETE FROM doctors WHERE id=$1', [doctorId]);
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ PATIENTS ============
app.get('/api/patients', async (req, res) => {
  try {
    const r = await pool.query(`SELECT p.*, u.full_name, u.email, u.phone, u.avatar, u.is_active
      FROM patients p JOIN users u ON p.user_id = u.id ORDER BY u.full_name`);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Alias for admin panel
app.get('/api/patients/all', async (req, res) => {
  try {
    const r = await pool.query(`SELECT p.*, u.full_name, u.email, u.phone, u.avatar, u.is_active
      FROM patients p JOIN users u ON p.user_id = u.id ORDER BY u.full_name`);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const r = await pool.query(`SELECT p.*, u.full_name, u.email, u.phone, u.avatar
      FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id=$1`, [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ message: 'Patient not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Patient's appointments
app.get('/api/patients/:id/appointments', async (req, res) => {
  try {
    const r = await pool.query(`SELECT a.*, u_d.full_name as doctor_name, s.name as specialty,
      s.icon as specialty_icon, d.clinic_name, d.consultation_fee,
      EXISTS(SELECT 1 FROM reviews rv WHERE rv.appointment_id=a.id AND rv.patient_id=a.patient_id) as has_review,
      EXISTS(SELECT 1 FROM payments pay WHERE pay.appointment_id=a.id) as is_paid
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [req.params.id]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Patient's prescriptions
app.get('/api/patients/:id/prescriptions', async (req, res) => {
  try {
    const r = await pool.query(`SELECT pr.*, u_d.full_name as doctor_name, a.appointment_date
      FROM prescriptions pr LEFT JOIN appointments a ON pr.appointment_id = a.id
      LEFT JOIN doctors d ON pr.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      WHERE pr.patient_id = $1 ORDER BY pr.created_at DESC`, [req.params.id]);
    const rows = r.rows.map(rx => ({ ...rx, medications: typeof rx.medications === 'string' ? JSON.parse(rx.medications) : (rx.medications || []) }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Patient's payment history
app.get('/api/patients/:id/payments', async (req, res) => {
  try {
    const r = await pool.query(`SELECT pay.*, u_d.full_name as doctor_name, a.appointment_date, s.name as specialty_name
      FROM payments pay LEFT JOIN appointments a ON pay.appointment_id = a.id
      LEFT JOIN doctors d ON a.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE pay.patient_id = $1 ORDER BY pay.created_at DESC`, [req.params.id]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  const { date_of_birth, blood_type, height_cm, weight_kg, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, full_name, phone } = req.body;
  try {
    await pool.query(`UPDATE patients SET date_of_birth=$1, blood_type=$2, height_cm=$3, weight_kg=$4, allergies=$5, chronic_conditions=$6, emergency_contact_name=$7, emergency_contact_phone=$8 WHERE id=$9`,
      [date_of_birth, blood_type, height_cm, weight_kg, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, req.params.id]);
    if (full_name || phone) {
      const pat = await pool.query('SELECT user_id FROM patients WHERE id=$1', [req.params.id]);
      if (pat.rows[0]) {
        if (full_name) await pool.query('UPDATE users SET full_name=$1 WHERE id=$2', [full_name, pat.rows[0].user_id]);
        if (phone) await pool.query('UPDATE users SET phone=$1 WHERE id=$2', [phone, pat.rows[0].user_id]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ APPOINTMENTS ============
app.get('/api/appointments', async (req, res) => {
  const { patient_id, doctor_id } = req.query;
  try {
    let query = `SELECT a.*, u_p.full_name as patient_name, u_d.full_name as doctor_name,
      s.name as specialty_name, d.clinic_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (patient_id) { query += ` AND a.patient_id=$${idx}`; params.push(patient_id); idx++; }
    if (doctor_id) { query += ` AND a.doctor_id=$${idx}`; params.push(doctor_id); idx++; }
    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/appointments/all', async (req, res) => {
  try {
    const r = await pool.query(`SELECT a.*, u_p.full_name as patient_name, u_d.full_name as doctor_name, s.name as specialty_name
      FROM appointments a LEFT JOIN patients p ON a.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id ORDER BY a.created_at DESC`);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Book appointment — accepts both camelCase (frontend) and snake_case
app.post('/api/appointments', async (req, res) => {
  const patientId = req.body.patientId || req.body.patient_id;
  const doctorId = req.body.doctorId || req.body.doctor_id;
  const date = req.body.date || req.body.appointment_date;
  const time = req.body.time || req.body.appointment_time || '09:00';
  const type = req.body.type || 'in-person';
  const reason = req.body.reason;
  const fee = req.body.fee || 0;
  try {
    const r = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, reason, fee) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [patientId, doctorId, date, time, type, reason, fee]);
    res.json({ id: r.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  const { status, notes } = req.body;
  try {
    if (notes !== undefined) {
      await pool.query('UPDATE appointments SET status=$1, notes=$2 WHERE id=$3', [status, notes, req.params.id]);
    } else {
      await pool.query('UPDATE appointments SET status=$1 WHERE id=$2', [status, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ PAYMENTS ============
app.get('/api/payments', async (req, res) => {
  const { patient_id, doctor_id } = req.query;
  try {
    let query = `SELECT pay.*, u_p.full_name as patient_name, u_d.full_name as doctor_name, a.appointment_date, s.name as specialty_name
      FROM payments pay LEFT JOIN appointments a ON pay.appointment_id = a.id
      LEFT JOIN patients p ON pay.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (patient_id) { query += ` AND pay.patient_id=$${idx}`; params.push(patient_id); idx++; }
    if (doctor_id) { query += ` AND pay.doctor_id=$${idx}`; params.push(doctor_id); idx++; }
    query += ' ORDER BY pay.created_at DESC';
    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/payments/all', async (req, res) => {
  try {
    const r = await pool.query(`SELECT pay.*, u_p.full_name as patient_name, u_d.full_name as doctor_name, a.appointment_date, s.name as specialty_name
      FROM payments pay LEFT JOIN appointments a ON pay.appointment_id = a.id
      LEFT JOIN patients p ON pay.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id ORDER BY pay.created_at DESC`);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Process payment — accepts both camelCase and snake_case
app.post('/api/payments', async (req, res) => {
  const appointmentId = req.body.appointmentId || req.body.appointment_id;
  const patientId = req.body.patientId || req.body.patient_id;
  const amount = req.body.amount;
  const cardNumber = req.body.cardNumber || req.body.card_number || '';
  const cardHolder = req.body.cardHolder || req.body.card_holder || '';
  try {
    // Get doctor_id from appointment
    const apptR = await pool.query('SELECT doctor_id FROM appointments WHERE id=$1', [appointmentId]);
    const doctorId = apptR.rows[0]?.doctor_id;
    const txId = 'TXN' + Date.now();
    const last4 = cardNumber.slice(-4) || '****';
    await pool.query(
      'INSERT INTO payments (appointment_id, patient_id, doctor_id, amount, payment_method, card_last4, transaction_id, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [appointmentId, patientId, doctorId, amount, 'card', last4, txId, 'completed']);
    // Mark appointment as confirmed
    await pool.query("UPDATE appointments SET status='confirmed' WHERE id=$1", [appointmentId]);
    res.json({ transactionId: txId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ PRESCRIPTIONS ============
app.get('/api/prescriptions', async (req, res) => {
  const { patient_id, doctor_id } = req.query;
  try {
    let query = `SELECT pr.*, u_p.full_name as patient_name, u_d.full_name as doctor_name, a.appointment_date
      FROM prescriptions pr LEFT JOIN appointments a ON pr.appointment_id = a.id
      LEFT JOIN patients p ON pr.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
      LEFT JOIN doctors d ON pr.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (patient_id) { query += ` AND pr.patient_id=$${idx}`; params.push(patient_id); idx++; }
    if (doctor_id) { query += ` AND pr.doctor_id=$${idx}`; params.push(doctor_id); idx++; }
    query += ' ORDER BY pr.created_at DESC';
    const r = await pool.query(query, params);
    const rows = r.rows.map(rx => ({ ...rx, medications: typeof rx.medications === 'string' ? JSON.parse(rx.medications) : (rx.medications || []) }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  const { appointment_id, patient_id, doctor_id, medications, diagnosis, notes,
    appointmentId, patientId, doctorId } = req.body;
  try {
    await pool.query(
      'INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, medications, diagnosis, notes) VALUES ($1,$2,$3,$4,$5,$6)',
      [appointmentId || appointment_id, patientId || patient_id, doctorId || doctor_id, JSON.stringify(medications || []), diagnosis, notes]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ CONVERSATIONS & MESSAGES ============
app.get('/api/conversations', async (req, res) => {
  const { patient_id, doctor_id, userId, role } = req.query;
  try {
    let query, params;
    if (userId && role) {
      // Frontend pattern: getConversations(userId, role)
      if (role === 'patient') {
        query = `SELECT c.*, u_d.full_name as other_name, u_d.full_name as doctor_name, u_p.full_name as patient_name,
          p.user_id as patient_user_id, d.user_id as doctor_user_id
          FROM conversations c
          LEFT JOIN patients p ON c.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
          LEFT JOIN doctors d ON c.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
          WHERE p.user_id = $1 ORDER BY c.last_message_at DESC`;
      } else {
        query = `SELECT c.*, u_p.full_name as other_name, u_d.full_name as doctor_name, u_p.full_name as patient_name,
          p.user_id as patient_user_id, d.user_id as doctor_user_id
          FROM conversations c
          LEFT JOIN patients p ON c.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
          LEFT JOIN doctors d ON c.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id
          WHERE d.user_id = $1 ORDER BY c.last_message_at DESC`;
      }
      params = [userId];
    } else {
      query = `SELECT c.*, u_p.full_name as patient_name, u_d.full_name as doctor_name,
        p.user_id as patient_user_id, d.user_id as doctor_user_id
        FROM conversations c LEFT JOIN patients p ON c.patient_id = p.id LEFT JOIN users u_p ON p.user_id = u_p.id
        LEFT JOIN doctors d ON c.doctor_id = d.id LEFT JOIN users u_d ON d.user_id = u_d.id WHERE 1=1`;
      params = [];
      let idx = 1;
      if (patient_id) { query += ` AND c.patient_id=$${idx}`; params.push(patient_id); idx++; }
      if (doctor_id) { query += ` AND c.doctor_id=$${idx}`; params.push(doctor_id); idx++; }
      query += ' ORDER BY c.last_message_at DESC';
    }
    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/conversations', async (req, res) => {
  const patientId = req.body.patientId || req.body.patient_id;
  const doctorId = req.body.doctorId || req.body.doctor_id;
  try {
    const existing = await pool.query('SELECT * FROM conversations WHERE patient_id=$1 AND doctor_id=$2', [patientId, doctorId]);
    if (existing.rows[0]) return res.json(existing.rows[0]);
    const r = await pool.query('INSERT INTO conversations (patient_id, doctor_id) VALUES ($1,$2) RETURNING *', [patientId, doctorId]);
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Get messages — matches frontend route /conversations/:id/messages
app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const r = await pool.query(`SELECT m.*, u.full_name as sender_name, u.role as sender_role
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1 ORDER BY m.created_at ASC`, [req.params.id]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Send message — matches frontend route /conversations/:id/messages
app.post('/api/conversations/:id/messages', async (req, res) => {
  const senderId = req.body.senderId || req.body.sender_id;
  const content = req.body.content;
  try {
    const r = await pool.query('INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1,$2,$3) RETURNING *', [req.params.id, senderId, content]);
    await pool.query("UPDATE conversations SET last_message=$1, last_message_at=NOW() WHERE id=$2", [content, req.params.id]);
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ REVIEWS ============
app.get('/api/reviews', async (req, res) => {
  const { doctor_id } = req.query;
  try {
    let query = `SELECT r.*, u.full_name as patient_name FROM reviews r
      LEFT JOIN patients p ON r.patient_id = p.id LEFT JOIN users u ON p.user_id = u.id WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (doctor_id) { query += ` AND r.doctor_id=$${idx}`; params.push(doctor_id); idx++; }
    query += ' ORDER BY r.created_at DESC';
    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  const patientId = req.body.patientId || req.body.patient_id;
  const doctorId = req.body.doctorId || req.body.doctor_id;
  const appointmentId = req.body.appointmentId || req.body.appointment_id;
  const { rating, comment } = req.body;
  try {
    await pool.query('INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES ($1,$2,$3,$4,$5)', [patientId, doctorId, appointmentId, rating, comment]);
    const stats = await pool.query('SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE doctor_id=$1', [doctorId]);
    await pool.query('UPDATE doctors SET rating=$1, total_reviews=$2 WHERE id=$3', [Math.round(parseFloat(stats.rows[0].avg_rating) * 10) / 10, parseInt(stats.rows[0].total), doctorId]);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) return res.status(400).json({ message: 'Already reviewed' });
    res.status(500).json({ message: err.message });
  }
});

// ============ ADMIN STATS ============
app.get('/api/admin/stats', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]; // '2026-04-07'
    const r = await pool.query(`SELECT
      (SELECT COUNT(*) FROM doctors WHERE status='approved') as total_doctors,
      (SELECT COUNT(*) FROM patients) as total_patients,
      (SELECT COUNT(*) FROM appointments) as total_appointments,
      (SELECT COALESCE(SUM(amount),0) FROM payments) as total_revenue,
      (SELECT COUNT(*) FROM doctors WHERE status='pending') as pending_doctors,
      (SELECT COUNT(*) FROM appointments WHERE status='pending') as pending_appointments,
      (SELECT COUNT(*) FROM appointments WHERE appointment_date=$1) as today_appointments,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE created_at >= $1::timestamp AND created_at < ($1::timestamp + INTERVAL '1 day')) as today_revenue`, [todayStr]);
    const row = r.rows[0];
    const monthly = await pool.query(`SELECT SUBSTRING(created_at::text,6,2) as month,
      COALESCE(SUM(amount),0) as revenue, COUNT(*) as payments
      FROM payments WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY SUBSTRING(created_at::text,1,7), SUBSTRING(created_at::text,6,2)
      ORDER BY SUBSTRING(created_at::text,1,7)`);
    res.json({
      total_doctors: parseInt(row.total_doctors),
      total_patients: parseInt(row.total_patients),
      total_appointments: parseInt(row.total_appointments),
      total_revenue: parseFloat(row.total_revenue),
      pending_doctors: parseInt(row.pending_doctors),
      pending_appointments: parseInt(row.pending_appointments),
      today_appointments: parseInt(row.today_appointments),
      today_revenue: parseFloat(row.today_revenue),
      monthly: monthly.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ★ Admin create doctor
app.post('/api/admin/doctors', async (req, res) => {
  const { email, password, fullName, phone, specialtyId, bio, consultationFee, clinicName, clinicAddress, experienceYears, availableDays, availableFrom, availableTo } = req.body;
  try {
    const hashedPwd = Buffer.from(password || 'password123').toString('base64');
    const userRes = await pool.query(
      'INSERT INTO users (email, password, role, full_name, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [email, hashedPwd, 'doctor', fullName, phone || null]
    );
    const userId = userRes.rows[0].id;
    await pool.query(
      `INSERT INTO doctors (user_id, specialty_id, bio, consultation_fee, clinic_name, clinic_address, experience_years, available_days, available_from, available_to, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'approved')`,
      [userId, specialtyId, bio, consultationFee || 300, clinicName, clinicAddress, experienceYears || 0, availableDays || 'Sat,Sun,Mon,Tue,Wed', availableFrom || '09:00', availableTo || '17:00']
    );
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
});

// ============ USER MANAGEMENT ============
// ★ Toggle active — matches frontend route /admin/users/:id/toggle
app.put('/api/admin/users/:id/toggle', async (req, res) => {
  try {
    const r = await pool.query('SELECT is_active FROM users WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ message: 'User not found' });
    await pool.query('UPDATE users SET is_active=$1 WHERE id=$2', [r.rows[0].is_active ? 0 : 1, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:id/toggle-active', async (req, res) => {
  try {
    const r = await pool.query('SELECT is_active FROM users WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ message: 'User not found' });
    await pool.query('UPDATE users SET is_active=$1 WHERE id=$2', [r.rows[0].is_active ? 0 : 1, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { full_name, phone, email, avatar } = req.body;
  try {
    if (full_name) await pool.query('UPDATE users SET full_name=$1 WHERE id=$2', [full_name, req.params.id]);
    if (phone) await pool.query('UPDATE users SET phone=$1 WHERE id=$2', [phone, req.params.id]);
    if (email) await pool.query('UPDATE users SET email=$1 WHERE id=$2', [email, req.params.id]);
    if (avatar) await pool.query('UPDATE users SET avatar=$1 WHERE id=$2', [avatar, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) return res.status(400).json({ message: 'Email already in use' });
    res.status(500).json({ message: err.message });
  }
});

export default app;
