import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const db = new Database(path.join(__dirname, 'medidash.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
 res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
 if (req.method === 'OPTIONS') return res.sendStatus(200);
 next();
});

function initDB() {
 try {
 db.exec(`
 CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT UNIQUE NOT NULL,
 password TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'patient',
 full_name TEXT NOT NULL,
 phone TEXT,
 avatar TEXT,
 is_active INTEGER DEFAULT 1,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS specialties (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 icon TEXT DEFAULT '',
 description TEXT
 );

 CREATE TABLE IF NOT EXISTS doctors (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 specialty_id INTEGER REFERENCES specialties(id),
 bio TEXT,
 experience_years INTEGER DEFAULT 0,
 consultation_fee REAL DEFAULT 50.00,
 clinic_name TEXT,
 clinic_address TEXT,
 available_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',
 available_from TEXT DEFAULT '09:00',
 available_to TEXT DEFAULT '17:00',
 rating REAL DEFAULT 0,
 total_reviews INTEGER DEFAULT 0,
 status TEXT DEFAULT 'pending',
 license_number TEXT,
 education TEXT,
 id_document TEXT,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS patients (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 date_of_birth TEXT,
 blood_type TEXT,
 height_cm INTEGER,
 weight_kg REAL,
 allergies TEXT,
 chronic_conditions TEXT,
 emergency_contact_name TEXT,
 emergency_contact_phone TEXT,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS appointments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_id INTEGER REFERENCES patients(id),
 doctor_id INTEGER REFERENCES doctors(id),
 appointment_date TEXT NOT NULL,
 appointment_time TEXT NOT NULL DEFAULT '09:00',
 status TEXT DEFAULT 'pending',
 type TEXT DEFAULT 'in-person',
 reason TEXT,
 notes TEXT,
 fee REAL DEFAULT 0,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS payments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 appointment_id INTEGER REFERENCES appointments(id),
 patient_id INTEGER REFERENCES patients(id),
 doctor_id INTEGER,
 amount REAL NOT NULL,
 payment_method TEXT DEFAULT 'card',
 card_last4 TEXT,
 status TEXT DEFAULT 'completed',
 transaction_id TEXT,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS prescriptions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 appointment_id INTEGER REFERENCES appointments(id),
 patient_id INTEGER REFERENCES patients(id),
 doctor_id INTEGER REFERENCES doctors(id),
 medications TEXT DEFAULT '[]',
 diagnosis TEXT,
 notes TEXT,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS conversations (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_id INTEGER REFERENCES patients(id),
 doctor_id INTEGER REFERENCES doctors(id),
 last_message TEXT,
 last_message_at TEXT DEFAULT (datetime('now')),
 created_at TEXT DEFAULT (datetime('now')),
 UNIQUE(patient_id, doctor_id)
 );

 CREATE TABLE IF NOT EXISTS messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 conversation_id INTEGER REFERENCES conversations(id),
 sender_id INTEGER REFERENCES users(id),
 content TEXT NOT NULL,
 is_read INTEGER DEFAULT 0,
 created_at TEXT DEFAULT (datetime('now'))
 );

 CREATE TABLE IF NOT EXISTS reviews (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_id INTEGER REFERENCES patients(id),
 doctor_id INTEGER REFERENCES doctors(id),
 appointment_id INTEGER REFERENCES appointments(id),
 rating INTEGER CHECK (rating >= 1 AND rating <= 5),
 comment TEXT,
 created_at TEXT DEFAULT (datetime('now')),
 UNIQUE(appointment_id)
 );
 `);

 // Seed specialties
 const specCount = db.prepare('SELECT COUNT(*) as count FROM specialties').get();
 if (specCount.count === 0) {
 db.exec(`
 INSERT INTO specialties (name, icon, description) VALUES
 ('Cardiology','C','Heart and cardiovascular system'),
 ('Neurology','N','Brain and nervous system'),
 ('Dermatology','D','Skin, hair, and nail care'),
 ('Orthopedics','O','Bones and joints'),
 ('Pediatrics','P','Children health'),
 ('Psychiatry','S','Mental health'),
 ('Ophthalmology','E','Eye care'),
 ('General Practice','','General health and wellness'),
 ('Dentistry','T','Oral health'),
 ('Gynecology','Rx','Women health')
 `);
 }

 // Create admin user
 const adminCheck = db.prepare("SELECT id FROM users WHERE email='admin@medidash.com'").get();
 if (!adminCheck) {
 const encoded = Buffer.from('admin123').toString('base64');
 db.prepare(
 "INSERT INTO users (email, password, role, full_name) VALUES (?,?,'admin',?)"
 ).run('admin@medidash.com', encoded, 'Platform Admin');
 }

 console.log('Database ready');
 } catch (err) {
 console.error('DB init error:', err.message);
 }
}

// ============ AUTH ============
app.post('/api/auth/signup', (req, res) => {
 const { email, password, fullName, role, phone, licenseNumber, specialtyId, experienceYears, idDocument } = req.body;
 if (!email || !password || !fullName || !role) return res.status(400).json({ message: 'All fields required' });
 try {
 const hashedPwd = Buffer.from(password).toString('base64');
 const userRes = db.prepare(
 'INSERT INTO users (email, password, role, full_name, phone) VALUES (?,?,?,?,?)'
 ).run(email, hashedPwd, role, fullName, phone || null);
 const userId = userRes.lastInsertRowid;
 const user = db.prepare('SELECT id, email, role, full_name FROM users WHERE id=?').get(userId);

 if (role === 'doctor') {
 db.prepare(
 "INSERT INTO doctors (user_id, license_number, specialty_id, experience_years, id_document, status) VALUES (?,?,?,?,?,'pending')"
 ).run(userId, licenseNumber || null, specialtyId || null, experienceYears || 0, idDocument || null);
 return res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, doctorStatus: 'pending' } });
 } else if (role === 'patient') {
 db.prepare('INSERT INTO patients (user_id) VALUES (?)').run(userId);
 const p = db.prepare('SELECT id FROM patients WHERE user_id=?').get(userId);
 return res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, profileId: p?.id } });
 }
 res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name } });
 } catch (err) {
 if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ message: 'This email is already registered' });
 res.status(500).json({ message: err.message });
 }
});

app.post('/api/auth/signin', (req, res) => {
 const { email, password } = req.body;
 try {
 const hashedPwd = Buffer.from(password).toString('base64');
 const user = db.prepare('SELECT * FROM users WHERE email=? AND password=?').get(email, hashedPwd);
 if (!user) return res.status(401).json({ message: 'Wrong email or password' });
 if (!user.is_active) return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });

 let profileId = null;
 let doctorStatus = null;

 if (user.role === 'doctor') {
 const d = db.prepare('SELECT id, status FROM doctors WHERE user_id=?').get(user.id);
 profileId = d?.id;
 doctorStatus = d?.status;
 if (doctorStatus === 'pending') {
 return res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, doctorStatus: 'pending' } });
 }
 if (doctorStatus === 'suspended') {
 return res.status(403).json({ message: 'Your account has been suspended by the admin.' });
 }
 } else if (user.role === 'patient') {
 const p = db.prepare('SELECT id FROM patients WHERE user_id=?').get(user.id);
 profileId = p?.id;
 }

 res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, profileId, doctorStatus } });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ SPECIALTIES ============
app.get('/api/specialties', (req, res) => {
 const result = db.prepare('SELECT * FROM specialties ORDER BY name').all();
 res.json(result);
});

// ============ DOCTORS ============
app.get('/api/doctors', (req, res) => {
 const { search, specialty, minRating, maxFee } = req.query;
 try {
 let query = `
 SELECT d.*, u.full_name, u.email, u.phone, u.avatar, s.name as specialty_name, s.icon as specialty_icon
 FROM doctors d
 JOIN users u ON d.user_id = u.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 WHERE u.is_active = 1 AND d.status = 'approved'
 `;
 const params = [];
 if (search) {
 const searchParam = `%${search}%`;
 query += ` AND (u.full_name LIKE ? COLLATE NOCASE OR d.bio LIKE ? COLLATE NOCASE OR s.name LIKE ? COLLATE NOCASE OR d.clinic_name LIKE ? COLLATE NOCASE)`;
 params.push(searchParam, searchParam, searchParam, searchParam);
 }
 if (specialty && specialty !== 'all') {
 query += ` AND s.name = ?`;
 params.push(specialty);
 }
 if (minRating) {
 query += ` AND d.rating >= ?`;
 params.push(parseFloat(minRating));
 }
 if (maxFee) {
 query += ` AND d.consultation_fee <= ?`;
 params.push(parseFloat(maxFee));
 }
 query += ' ORDER BY d.rating DESC';
 const result = db.prepare(query).all(...params);
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/doctors/all', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT d.*, u.full_name, u.email, u.phone, u.is_active, u.id as user_id,
 s.name as specialty_name, s.icon as specialty_icon
 FROM doctors d
 JOIN users u ON d.user_id = u.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 ORDER BY d.created_at DESC
 `).all();
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/doctors/:id', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT d.*, u.full_name, u.email, u.phone, u.avatar, s.name as specialty_name, s.icon as specialty_icon
 FROM doctors d JOIN users u ON d.user_id = u.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 WHERE d.id = ?
 `).get(req.params.id);
 if (!result) return res.status(404).json({ message: 'Doctor not found' });
 const reviews = db.prepare(`
 SELECT r.*, u.full_name as patient_name
 FROM reviews r JOIN patients p ON r.patient_id = p.id JOIN users u ON p.user_id = u.id
 WHERE r.doctor_id = ? ORDER BY r.created_at DESC LIMIT 10
 `).all(req.params.id);
 res.json({ ...result, reviews });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.put('/api/doctors/:id', (req, res) => {
 const { bio, specialtyId, consultationFee, experienceYears, clinicName, clinicAddress, availableDays, availableFrom, availableTo, licenseNumber, education } = req.body;
 try {
 db.prepare(`
 UPDATE doctors SET bio=?, specialty_id=?, consultation_fee=?, experience_years=?,
 clinic_name=?, clinic_address=?, available_days=?, available_from=?, available_to=?,
 license_number=?, education=? WHERE id=?
 `).run(bio, specialtyId, consultationFee, experienceYears, clinicName, clinicAddress, availableDays, availableFrom, availableTo, licenseNumber, education, req.params.id);
 res.json({ success: true });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.put('/api/doctors/:id/status', (req, res) => {
 const { status } = req.body;
 try {
 db.prepare('UPDATE doctors SET status=? WHERE id=?').run(status, req.params.id);
 res.json({ success: true });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.delete('/api/doctors/:id', (req, res) => {
 try {
 const docId = req.params.id;
 const doc = db.prepare('SELECT user_id FROM doctors WHERE id=?').get(docId);
 if (!doc) return res.status(404).json({ message: 'Not found' });

  const deleteTx = db.transaction(() => {
 // 1. Remove all messages related to this doctor (sent by them, or in their conversations)
 db.prepare('DELETE FROM messages WHERE sender_id=?').run(doc.user_id);
 db.prepare('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE doctor_id=?)').run(docId);
 
 // 2. Remove conversations
 db.prepare('DELETE FROM conversations WHERE doctor_id=?').run(docId);
 
 // 3. Remove payments, prescriptions, and reviews bound to their appointments
 db.prepare('DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE doctor_id=?)').run(docId);
 db.prepare('DELETE FROM prescriptions WHERE appointment_id IN (SELECT id FROM appointments WHERE doctor_id=?)').run(docId);
 db.prepare('DELETE FROM reviews WHERE appointment_id IN (SELECT id FROM appointments WHERE doctor_id=?)').run(docId);
 
 // 4. Catch any loose prescriptions or reviews bound directly to the doctor
 db.prepare('DELETE FROM prescriptions WHERE doctor_id=?').run(docId);
 db.prepare('DELETE FROM reviews WHERE doctor_id=?').run(docId);
 
 // 5. Remove the appointments themselves
 db.prepare('DELETE FROM appointments WHERE doctor_id=?').run(docId);
 
 // 6. Remove the core Doctor and User records
 db.prepare('DELETE FROM doctors WHERE id=?').run(docId);
 db.prepare('DELETE FROM users WHERE id=?').run(doc.user_id);
 });
 deleteTx();

 res.json({ success: true });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/doctors/:id/appointments', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT a.*, u.full_name as patient_name, u.phone as patient_phone
 FROM appointments a
 JOIN patients p ON a.patient_id = p.id JOIN users u ON p.user_id = u.id
 WHERE a.doctor_id = ?
 ORDER BY a.appointment_date DESC, a.appointment_time DESC
 `).all(req.params.id);
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/doctors/:id/slots', (req, res) => {
 const { date } = req.query;
 try {
 const doc = db.prepare('SELECT available_from, available_to FROM doctors WHERE id=?').get(req.params.id);
 if (!doc) return res.json([]);
 const booked = db.prepare(
 "SELECT appointment_time FROM appointments WHERE doctor_id=? AND appointment_date=? AND status != 'cancelled'"
 ).all(req.params.id, date);
 const bookedTimes = booked.map(r => (r.appointment_time || '').slice(0, 5));
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

app.get('/api/doctors/:id/earnings', (req, res) => {
 try {
 const earnings = db.prepare(`
 SELECT COUNT(a.id) as total_appointments,
 COUNT(CASE WHEN a.status='completed' THEN 1 END) as completed,
 COALESCE(SUM(CASE WHEN a.status='completed' THEN p.amount ELSE 0 END),0) as total_earned,
 COALESCE(SUM(CASE WHEN a.status='completed' AND strftime('%Y-%m',a.appointment_date)=strftime('%Y-%m','now') THEN p.amount ELSE 0 END),0) as this_month
 FROM appointments a LEFT JOIN payments p ON p.appointment_id = a.id
 WHERE a.doctor_id = ?
 `).get(req.params.id);
 const monthly = db.prepare(`
 SELECT strftime('%m %Y',a.appointment_date) as month,
 COALESCE(SUM(p.amount),0) as amount, COUNT(a.id) as appointments
 FROM appointments a LEFT JOIN payments p ON p.appointment_id = a.id
 WHERE a.doctor_id=? AND a.status='completed'
 GROUP BY strftime('%Y-%m',a.appointment_date) ORDER BY strftime('%Y-%m',a.appointment_date) DESC LIMIT 6
 `).all(req.params.id);
 res.json({ ...earnings, monthly });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ PATIENTS ============
app.get('/api/patients/all', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT p.*, u.full_name, u.email, u.phone, u.is_active, u.id as user_id, u.created_at as member_since,
 COUNT(DISTINCT a.id) as total_appointments
 FROM patients p JOIN users u ON p.user_id = u.id
 LEFT JOIN appointments a ON a.patient_id = p.id
 GROUP BY p.id ORDER BY u.created_at DESC
 `).all();
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/patients/:id', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT p.*, u.full_name, u.email, u.phone, u.avatar, u.created_at as member_since
 FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?
 `).get(req.params.id);
 if (!result) return res.status(404).json({ message: 'Not found' });
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.put('/api/patients/:id', (req, res) => {
 const { dateOfBirth, bloodType, heightCm, weightKg, allergies, chronicConditions, emergencyContactName, emergencyContactPhone, phone, fullName } = req.body;
 try {
 const patient = db.prepare('SELECT user_id FROM patients WHERE id=?').get(req.params.id);
 if (patient) {
 db.prepare('UPDATE users SET full_name=?, phone=? WHERE id=?').run(fullName, phone, patient.user_id);
 }
 db.prepare(`
 UPDATE patients SET date_of_birth=?, blood_type=?, height_cm=?, weight_kg=?,
 allergies=?, chronic_conditions=?, emergency_contact_name=?, emergency_contact_phone=?
 WHERE id=?
 `).run(dateOfBirth, bloodType, heightCm, weightKg, allergies, chronicConditions, emergencyContactName, emergencyContactPhone, req.params.id);
 res.json({ success: true });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/patients/:id/appointments', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT a.*, u.full_name as doctor_name, s.name as specialty, d.clinic_name, d.consultation_fee,
 s.icon as specialty_icon,
 (SELECT 1 FROM reviews r WHERE r.appointment_id = a.id LIMIT 1) as has_review,
 (SELECT 1 FROM payments p WHERE p.appointment_id = a.id LIMIT 1) as is_paid
 FROM appointments a
 JOIN doctors d ON a.doctor_id = d.id JOIN users u ON d.user_id = u.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 WHERE a.patient_id = ?
 ORDER BY a.appointment_date DESC, a.appointment_time DESC
 `).all(req.params.id);
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/patients/:id/prescriptions', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT pr.*, u.full_name as doctor_name, s.name as specialty
 FROM prescriptions pr JOIN doctors d ON pr.doctor_id = d.id JOIN users u ON d.user_id = u.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 WHERE pr.patient_id = ? ORDER BY pr.created_at DESC
 `).all(req.params.id);
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/patients/:id/payments', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT pay.*, du.full_name as doctor_name, s.name as specialty,
 a.appointment_date, a.appointment_time, a.type
 FROM payments pay JOIN appointments a ON pay.appointment_id = a.id
 JOIN doctors d ON a.doctor_id = d.id JOIN users du ON d.user_id = du.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 WHERE pay.patient_id = ? ORDER BY pay.created_at DESC
 `).all(req.params.id);
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ APPOINTMENTS ============
app.post('/api/appointments', (req, res) => {
 const { patientId, doctorId, date, time, type, reason, fee } = req.body;
 try {
 const existing = db.prepare(
 "SELECT id FROM appointments WHERE doctor_id=? AND appointment_date=? AND appointment_time=? AND status != 'cancelled'"
 ).get(doctorId, date, time);
 if (existing) return res.status(400).json({ message: 'That time slot is no longer available' });
 const result = db.prepare(
 'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, reason, fee, status) VALUES (?,?,?,?,?,?,?,?)'
 ).run(patientId, doctorId, date, time, type || 'in-person', reason, fee, 'confirmed');
 const inserted = db.prepare('SELECT * FROM appointments WHERE id=?').get(result.lastInsertRowid);
 res.json(inserted);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.put('/api/appointments/:id/status', (req, res) => {
 const { status, notes } = req.body;
 try {
 db.prepare('UPDATE appointments SET status=?, notes=COALESCE(?, notes) WHERE id=?').run(status, notes, req.params.id);
 res.json({ success: true });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/appointments/all', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT a.*, pu.full_name as patient_name, du.full_name as doctor_name, s.name as specialty
 FROM appointments a
 JOIN patients p ON a.patient_id = p.id JOIN users pu ON p.user_id = pu.id
 JOIN doctors d ON a.doctor_id = d.id JOIN users du ON d.user_id = du.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 ORDER BY a.appointment_date DESC, a.appointment_time DESC
 `).all();
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ PAYMENTS ============
app.post('/api/payments', (req, res) => {
 const { appointmentId, patientId, amount, cardNumber, cardHolder } = req.body;
 try {
 const last4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '0000';
 const transactionId = 'TXN' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
 const result = db.prepare(
 'INSERT INTO payments (appointment_id, patient_id, amount, card_last4, transaction_id, status) VALUES (?,?,?,?,?,?)'
 ).run(appointmentId, patientId, amount, last4, transactionId, 'completed');
 const inserted = db.prepare('SELECT * FROM payments WHERE id=?').get(result.lastInsertRowid);
 res.json(inserted);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/payments', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT p.*, pu.full_name as patient_name, du.full_name as doctor_name, s.name as specialty,
 a.appointment_date, a.appointment_time
 FROM payments p
 JOIN appointments a ON p.appointment_id = a.id
 JOIN patients pt ON p.patient_id = pt.id JOIN users pu ON pt.user_id = pu.id
 JOIN doctors d ON a.doctor_id = d.id JOIN users du ON d.user_id = du.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 ORDER BY p.created_at DESC
 `).all();
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ PRESCRIPTIONS ============
app.post('/api/prescriptions', (req, res) => {
 const { appointmentId, patientId, doctorId, medications, diagnosis, notes } = req.body;
 try {
 const result = db.prepare(
 'INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, medications, diagnosis, notes) VALUES (?,?,?,?,?,?)'
 ).run(appointmentId, patientId, doctorId, JSON.stringify(medications), diagnosis, notes);
 db.prepare("UPDATE appointments SET status='completed' WHERE id=?").run(appointmentId);
 const inserted = db.prepare('SELECT * FROM prescriptions WHERE id=?').get(result.lastInsertRowid);
 res.json(inserted);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ MESSAGES ============
app.get('/api/conversations', (req, res) => {
 const { userId, role } = req.query;
 try {
 let result;
 if (role === 'patient') {
 result = db.prepare(`
 SELECT c.*, u.full_name as other_name, s.name as specialty, d.id as doctor_id
 FROM conversations c JOIN doctors d ON c.doctor_id = d.id JOIN users u ON d.user_id = u.id
 LEFT JOIN specialties s ON d.specialty_id = s.id
 JOIN patients p ON c.patient_id = p.id
 WHERE p.user_id = ? ORDER BY c.last_message_at DESC
 `).all(userId);
 } else {
 result = db.prepare(`
 SELECT c.*, u.full_name as other_name
 FROM conversations c JOIN patients p ON c.patient_id = p.id JOIN users u ON p.user_id = u.id
 JOIN doctors d ON c.doctor_id = d.id
 WHERE d.user_id = ? ORDER BY c.last_message_at DESC
 `).all(userId);
 }
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.post('/api/conversations', (req, res) => {
 const { patientId, doctorId } = req.body;
 try {
 const existing = db.prepare('SELECT * FROM conversations WHERE patient_id=? AND doctor_id=?').get(patientId, doctorId);
 if (existing) return res.json(existing);
 const result = db.prepare('INSERT INTO conversations (patient_id, doctor_id) VALUES (?,?)').run(patientId, doctorId);
 const inserted = db.prepare('SELECT * FROM conversations WHERE id=?').get(result.lastInsertRowid);
 res.json(inserted);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.get('/api/conversations/:id/messages', (req, res) => {
 try {
 const result = db.prepare(`
 SELECT m.*, u.full_name as sender_name, u.role as sender_role
 FROM messages m JOIN users u ON m.sender_id = u.id
 WHERE m.conversation_id = ? ORDER BY m.created_at ASC
 `).all(req.params.id);
 res.json(result);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.post('/api/conversations/:id/messages', (req, res) => {
 const { senderId, content } = req.body;
 try {
 const result = db.prepare(
 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?,?,?)'
 ).run(req.params.id, senderId, content);
 db.prepare("UPDATE conversations SET last_message=?, last_message_at=datetime('now') WHERE id=?").run(content, req.params.id);
 const inserted = db.prepare('SELECT * FROM messages WHERE id=?').get(result.lastInsertRowid);
 res.json(inserted);
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// ============ REVIEWS ============
app.post('/api/reviews', (req, res) => {
 const { patientId, doctorId, appointmentId, rating, comment } = req.body;
 try {
 const result = db.prepare(
 'INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES (?,?,?,?,?)'
 ).run(patientId, doctorId, appointmentId, rating, comment);
 const avgResult = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as total FROM reviews WHERE doctor_id=?').get(doctorId);
 db.prepare('UPDATE doctors SET rating=?, total_reviews=? WHERE id=?').run(
 parseFloat(avgResult.avg).toFixed(1), avgResult.total, doctorId
 );
 const inserted = db.prepare('SELECT * FROM reviews WHERE id=?').get(result.lastInsertRowid);
 res.json(inserted);
 } catch (err) {
 if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ message: 'You already reviewed this appointment' });
 res.status(500).json({ message: err.message });
 }
});

// ============ ADMIN ============
app.get('/api/admin/stats', (req, res) => {
 try {
 const stats = db.prepare(`
 SELECT
 (SELECT COUNT(*) FROM users WHERE role='patient') as total_patients,
 (SELECT COUNT(*) FROM users WHERE role='doctor') as total_doctors,
 (SELECT COUNT(*) FROM appointments) as total_appointments,
 (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='completed') as total_revenue,
 (SELECT COUNT(*) FROM appointments WHERE status='pending') as pending_appointments,
 (SELECT COUNT(*) FROM doctors WHERE status='pending') as pending_doctors,
 (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date)=DATE('now')) as today_appointments,
 (SELECT COALESCE(SUM(amount),0) FROM payments WHERE DATE(created_at)=DATE('now')) as today_revenue
 `).get();
 const monthly = db.prepare(`
 SELECT strftime('%m',created_at) as month,
 COALESCE(SUM(amount),0) as revenue, COUNT(*) as payments
 FROM payments WHERE status='completed' AND created_at >= datetime('now', '-6 months')
 GROUP BY strftime('%Y-%m', created_at) ORDER BY strftime('%Y-%m', created_at)
 `).all();
 res.json({ ...stats, monthly });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

app.put('/api/admin/users/:id/toggle', (req, res) => {
 try {
 db.prepare('UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id=?').run(req.params.id);
 res.json({ success: true });
 } catch (err) {
 res.status(500).json({ message: err.message });
 }
});

// Admin creates a doctor directly (pre-approved)
app.post('/api/admin/doctors', (req, res) => {
 const { email, password, fullName, phone, licenseNumber, specialtyId, experienceYears, consultationFee, clinicName, bio } = req.body;
 if (!email || !password || !fullName) return res.status(400).json({ message: 'Name, email and password are required' });
 try {
 const hashedPwd = Buffer.from(password).toString('base64');
 const userRes = db.prepare(
 "INSERT INTO users (email, password, role, full_name, phone) VALUES (?,?,'doctor',?,?)"
 ).run(email, hashedPwd, fullName, phone || null);
 const userId = userRes.lastInsertRowid;
 db.prepare(
 `INSERT INTO doctors (user_id, license_number, specialty_id, experience_years, consultation_fee, clinic_name, bio, status)
 VALUES (?,?,?,?,?,?,?,'approved')`
 ).run(userId, licenseNumber || null, specialtyId || null, experienceYears || 0, consultationFee || 50, clinicName || null, bio || null);
 res.json({ success: true });
 } catch (err) {
 if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ message: 'Email already in use' });
 res.status(500).json({ message: err.message });
 }
});

app.listen(PORT, () => {
 console.log(`MediDash API running on port ${PORT}`);
 initDB();
});
