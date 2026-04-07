-- =============================================
-- MediDash Healthcare Platform
-- SQL Server Database Script
-- =============================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MediDashDB')
BEGIN
    CREATE DATABASE MediDashDB;
END
GO

USE MediDashDB;
GO

-- =============================================
-- DROP existing tables (in dependency order)
-- =============================================
IF OBJECT_ID('messages', 'U') IS NOT NULL DROP TABLE messages;
IF OBJECT_ID('conversations', 'U') IS NOT NULL DROP TABLE conversations;
IF OBJECT_ID('reviews', 'U') IS NOT NULL DROP TABLE reviews;
IF OBJECT_ID('prescriptions', 'U') IS NOT NULL DROP TABLE prescriptions;
IF OBJECT_ID('payments', 'U') IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('appointments', 'U') IS NOT NULL DROP TABLE appointments;
IF OBJECT_ID('doctors', 'U') IS NOT NULL DROP TABLE doctors;
IF OBJECT_ID('patients', 'U') IS NOT NULL DROP TABLE patients;
IF OBJECT_ID('specialties', 'U') IS NOT NULL DROP TABLE specialties;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    email           NVARCHAR(255) NOT NULL UNIQUE,
    password        NVARCHAR(255) NOT NULL,
    role            NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    full_name       NVARCHAR(255) NOT NULL,
    phone           NVARCHAR(20) NULL,
    avatar          NVARCHAR(MAX) NULL,
    is_active       BIT DEFAULT 1,
    created_at      DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 2. SPECIALTIES TABLE
-- =============================================
CREATE TABLE specialties (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(100) NOT NULL UNIQUE,
    icon            NVARCHAR(10) NULL,
    description     NVARCHAR(500) NULL
);
GO

-- =============================================
-- 3. DOCTORS TABLE
-- =============================================
CREATE TABLE doctors (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    user_id             INT NOT NULL FOREIGN KEY REFERENCES users(id),
    specialty_id        INT NULL FOREIGN KEY REFERENCES specialties(id),
    bio                 NVARCHAR(MAX) NULL,
    experience_years    INT DEFAULT 0,
    consultation_fee    DECIMAL(10,2) DEFAULT 0,
    clinic_name         NVARCHAR(255) NULL,
    clinic_address      NVARCHAR(500) NULL,
    available_days      NVARCHAR(100) DEFAULT 'Sat,Sun,Mon,Tue,Wed',
    available_from      NVARCHAR(10) DEFAULT '09:00',
    available_to        NVARCHAR(10) DEFAULT '17:00',
    rating              DECIMAL(3,2) DEFAULT 0,
    total_reviews       INT DEFAULT 0,
    status              NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
    license_number      NVARCHAR(100) NULL,
    education           NVARCHAR(500) NULL,
    id_document         NVARCHAR(MAX) NULL,
    created_at          DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 4. PATIENTS TABLE
-- =============================================
CREATE TABLE patients (
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    user_id                     INT NOT NULL FOREIGN KEY REFERENCES users(id),
    date_of_birth               DATE NULL,
    blood_type                  NVARCHAR(5) NULL,
    height_cm                   DECIMAL(5,1) NULL,
    weight_kg                   DECIMAL(5,1) NULL,
    allergies                   NVARCHAR(MAX) NULL,
    chronic_conditions          NVARCHAR(MAX) NULL,
    emergency_contact_name      NVARCHAR(255) NULL,
    emergency_contact_phone     NVARCHAR(20) NULL,
    created_at                  DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 5. APPOINTMENTS TABLE
-- =============================================
CREATE TABLE appointments (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    patient_id          INT NOT NULL FOREIGN KEY REFERENCES patients(id),
    doctor_id           INT NOT NULL FOREIGN KEY REFERENCES doctors(id),
    appointment_date    DATE NOT NULL,
    appointment_time    NVARCHAR(10) NOT NULL,
    type                NVARCHAR(20) DEFAULT 'in-person' CHECK (type IN ('in-person', 'video')),
    status              NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    reason              NVARCHAR(MAX) NULL,
    notes               NVARCHAR(MAX) NULL,
    fee                 DECIMAL(10,2) DEFAULT 0,
    created_at          DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 6. PAYMENTS TABLE
-- =============================================
CREATE TABLE payments (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    appointment_id      INT NOT NULL FOREIGN KEY REFERENCES appointments(id),
    patient_id          INT NOT NULL FOREIGN KEY REFERENCES patients(id),
    doctor_id           INT NULL FOREIGN KEY REFERENCES doctors(id),
    amount              DECIMAL(10,2) NOT NULL,
    payment_method      NVARCHAR(50) DEFAULT 'card',
    card_last4          NVARCHAR(4) NULL,
    transaction_id      NVARCHAR(100) NULL,
    status              NVARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
    created_at          DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 7. PRESCRIPTIONS TABLE
-- =============================================
CREATE TABLE prescriptions (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    appointment_id      INT NULL FOREIGN KEY REFERENCES appointments(id),
    patient_id          INT NOT NULL FOREIGN KEY REFERENCES patients(id),
    doctor_id           INT NOT NULL FOREIGN KEY REFERENCES doctors(id),
    medications         NVARCHAR(MAX) NULL,       -- JSON string
    diagnosis           NVARCHAR(MAX) NULL,
    notes               NVARCHAR(MAX) NULL,
    created_at          DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 8. CONVERSATIONS TABLE
-- =============================================
CREATE TABLE conversations (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    patient_id          INT NOT NULL FOREIGN KEY REFERENCES patients(id),
    doctor_id           INT NOT NULL FOREIGN KEY REFERENCES doctors(id),
    last_message        NVARCHAR(MAX) NULL,
    last_message_at     DATETIME2 DEFAULT GETDATE(),
    created_at          DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_conversation UNIQUE (patient_id, doctor_id)
);
GO

-- =============================================
-- 9. MESSAGES TABLE
-- =============================================
CREATE TABLE messages (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id     INT NOT NULL FOREIGN KEY REFERENCES conversations(id),
    sender_id           INT NOT NULL FOREIGN KEY REFERENCES users(id),
    content             NVARCHAR(MAX) NOT NULL,
    is_read             BIT DEFAULT 0,
    created_at          DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 10. REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    patient_id          INT NOT NULL FOREIGN KEY REFERENCES patients(id),
    doctor_id           INT NOT NULL FOREIGN KEY REFERENCES doctors(id),
    appointment_id      INT NULL FOREIGN KEY REFERENCES appointments(id),
    rating              INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             NVARCHAR(MAX) NULL,
    created_at          DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_review UNIQUE (patient_id, appointment_id)
);
GO

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IX_doctors_user_id ON doctors(user_id);
CREATE INDEX IX_doctors_specialty_id ON doctors(specialty_id);
CREATE INDEX IX_doctors_status ON doctors(status);
CREATE INDEX IX_patients_user_id ON patients(user_id);
CREATE INDEX IX_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IX_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IX_appointments_date ON appointments(appointment_date);
CREATE INDEX IX_appointments_status ON appointments(status);
CREATE INDEX IX_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IX_payments_patient_id ON payments(patient_id);
CREATE INDEX IX_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IX_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IX_conversations_patient_id ON conversations(patient_id);
CREATE INDEX IX_conversations_doctor_id ON conversations(doctor_id);
CREATE INDEX IX_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IX_reviews_doctor_id ON reviews(doctor_id);
GO

-- =============================================
-- SEED DATA: SPECIALTIES
-- =============================================
INSERT INTO specialties (name, icon, description) VALUES
('Cardiology',        'C',  'Heart and cardiovascular system disorders'),
('Neurology',         'N',  'Brain, spinal cord, and nervous system disorders'),
('Dermatology',       'D',  'Skin, hair, and nail conditions'),
('Orthopedics',       'O',  'Bones, joints, muscles, and skeletal system'),
('Pediatrics',        'P',  'Medical care for infants, children, and adolescents'),
('Psychiatry',        'S',  'Mental health and behavioral disorders'),
('Ophthalmology',     'E',  'Eye diseases and vision care'),
('General Practice',  'G',  'Primary care and general health'),
('Dentistry',         'T',  'Teeth, gums, and oral health'),
('Gynecology',        'Rx', 'Female reproductive health');
GO

-- =============================================
-- SEED DATA: USERS (password = base64 of 'admin123' or 'password123')
-- =============================================
-- Admin
INSERT INTO users (email, password, role, full_name, phone) VALUES
('admin@medidash.com', 'YWRtaW4xMjM=', 'admin', 'System Administrator', '01000000000');

-- Doctor Users
INSERT INTO users (email, password, role, full_name, phone) VALUES
('hassan@cardiodokki.eg',       'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Mohamed Hassan',    '01012345001'),
('amira.peds@alex.eg',          'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Amira El-Sayed',    '01012345002'),
('a.khalil.ortho@maadi.eg',     'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Ahmed Khalil',      '01012345003'),
('s.ibrahim.derm@nasr.eg',      'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Sarah Ibrahim',     '01012345004'),
('farouk.neuro@zamalek.eg',     'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Omar Farouk',       '01012345005'),
('n.osman.psych@heliopolis.eg', 'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Nadia Osman',       '01012345006'),
('thegazi.gpt@sheraton.eg',     'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Tarek Hegazi',      '01012345007'),
('m.wagdy.eye@mohandessin.eg',  'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Mona Wagdy',        '01012345008'),
('seif.dent@sporting.eg',       'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Khaled Seif',       '01012345009'),
('y.refaat.gyn@newcairo.eg',    'cGFzc3dvcmQxMjM=', 'doctor', 'Dr. Yasmin Refaat',     '01012345010');

-- Patient Users
INSERT INTO users (email, password, role, full_name, phone) VALUES
('ahmed.patient@gmail.com',     'cGFzc3dvcmQxMjM=', 'patient', 'Ahmed Mahmoud',        '01112345001'),
('fatma.ali@gmail.com',         'cGFzc3dvcmQxMjM=', 'patient', 'Fatma Ali',             '01112345002'),
('omar.youssef@gmail.com',      'cGFzc3dvcmQxMjM=', 'patient', 'Omar Youssef',          '01112345003');
GO

-- =============================================
-- SEED DATA: DOCTORS (user_id maps to doctor users above)
-- =============================================
INSERT INTO doctors (user_id, specialty_id, bio, experience_years, consultation_fee, clinic_name, clinic_address, available_days, available_from, available_to, rating, total_reviews, status) VALUES
(2,  1,  'Senior Consultant Cardiologist with 15 years experience in interventional cardiology and valvular heart disease. Fellow of the European Society of Cardiology (ESC).',
     15, 450.00, 'Health Square Clinic, Dokki',        '15 Mossadak St, Dokki, Giza',                'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.8, 12, 'approved'),
(3,  5,  'Dedicated pediatrician specializing in neonatal care and developmental childhood milestones. MD from Cairo University Faculty of Medicine.',
     10, 300.00, 'Alex Children Center, Smouha',       '45 Victor Emmanuel St, Smouha, Alexandria',   'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.6, 8,  'approved'),
(4,  4,  'Orthopedic Surgeon focused on sports medicine and joint replacement surgery. Trained at the American Hospital in Cairo.',
     12, 550.00, 'Maadi Ortho Hub, Degla',             'Road 233, Maadi, Cairo',                      'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.9, 15, 'approved'),
(5,  3,  'Specialist in clinical and cosmetic dermatology. Expert in non-surgical facial rejuvenation and skin condition treatments.',
     8,  400.00, 'Radiance Skin Center, Nasr City',    'Abbas El-Akkad St, Nasr City, Cairo',         'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.7, 10, 'approved'),
(6,  2,  'Award-winning Neurologist specializing in neurodegenerative diseases and stroke management. Author of several clinical research papers on epilepsy.',
     18, 600.00, 'Elite Neurology Suite, Zamalek',     'Shagaret El-Dorr St, Zamalek, Cairo',         'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.9, 20, 'approved'),
(7,  6,  'Psychiatrist and Behavioral Therapist focusing on anxiety and depressive disorders in adults and teens.',
     9,  450.00, 'Peace Center, Heliopolis',            'El-Nozha St, Heliopolis, Cairo',              'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.5, 6,  'approved'),
(8,  8,  'General Practitioner with a focus on family wellness and preventative medicine. Over 20 years of family practice.',
     22, 250.00, 'Sheraton Medical Center',             'Sheraton Bldgs, Cairo',                       'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.4, 18, 'approved'),
(9,  7,  'Ophthalmologist specializing in LASIK and cataract surgery. Member of the Egyptian Society of Ophthalmology.',
     14, 500.00, 'ClearView Clinic, Mohandessin',      'Gameat El-Dowal El-Arabeya, Giza',            'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.8, 11, 'approved'),
(10, 9,  'Dental Surgeon specializing in cosmetic dentistry and implantology. Passionate about painless dental treatments.',
     11, 350.00, 'Smile Alexandria, Sporting',          'Port Said St, Sporting, Alexandria',          'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.6, 9,  'approved'),
(11, 10, 'OB/GYN Consultant with extensive experience in high-risk pregnancies and reproductive health.',
     16, 450.00, 'New Cairo Wellness Hub',              'North 90th St, New Cairo',                    'Sat,Sun,Mon,Tue,Wed', '09:00', '17:00', 4.7, 13, 'approved');
GO

-- =============================================
-- SEED DATA: PATIENTS
-- =============================================
INSERT INTO patients (user_id, date_of_birth, blood_type, height_cm, weight_kg, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone) VALUES
(12, '1995-03-15', 'A+',  175.0, 78.0, 'Penicillin',       'None',         'Mahmoud Ahmed',  '01098765001'),
(13, '1988-07-22', 'O+',  162.0, 60.0, 'None',             'Asthma',       'Ali Hassan',     '01098765002'),
(14, '2000-11-08', 'B+',  180.0, 85.0, 'Sulfa drugs',      'Diabetes',     'Youssef Omar',   '01098765003');
GO

-- =============================================
-- SEED DATA: APPOINTMENTS
-- =============================================
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, status, reason, fee) VALUES
(1, 1,  '2026-04-12', '10:00', 'in-person', 'confirmed',  'Annual cardiac checkup and ECG',               450.00),
(1, 3,  '2026-04-13', '11:00', 'video',     'pending',    'Follow-up on knee pain after physical therapy', 550.00),
(2, 2,  '2026-04-12', '09:30', 'in-person', 'confirmed',  'Child vaccination schedule consultation',       300.00),
(2, 4,  '2026-04-14', '14:00', 'in-person', 'pending',    'Persistent skin rash on forearms',              400.00),
(3, 5,  '2026-04-15', '10:30', 'video',     'confirmed',  'Recurring headaches and dizziness',             600.00),
(3, 7,  '2026-04-11', '09:00', 'in-person', 'completed',  'General wellness checkup',                      250.00),
(1, 6,  '2026-03-20', '15:00', 'video',     'completed',  'Anxiety management follow-up',                  450.00),
(2, 8,  '2026-03-22', '11:30', 'in-person', 'completed',  'Eye examination and vision test',               500.00),
(3, 9,  '2026-03-25', '13:00', 'in-person', 'completed',  'Dental cleaning and cavity check',              350.00),
(1, 10, '2026-03-28', '10:00', 'in-person', 'cancelled',  'Routine gynecology consultation',               450.00);
GO

-- =============================================
-- SEED DATA: PAYMENTS
-- =============================================
INSERT INTO payments (appointment_id, patient_id, doctor_id, amount, payment_method, card_last4, transaction_id, status) VALUES
(1,  1, 1,  450.00, 'card', '4532', 'TXN1712001001', 'completed'),
(3,  2, 2,  300.00, 'card', '8891', 'TXN1712001002', 'completed'),
(5,  3, 5,  600.00, 'card', '2210', 'TXN1712001003', 'completed'),
(6,  3, 7,  250.00, 'card', '2210', 'TXN1712001004', 'completed'),
(7,  1, 6,  450.00, 'card', '4532', 'TXN1712001005', 'completed'),
(8,  2, 8,  500.00, 'card', '8891', 'TXN1712001006', 'completed'),
(9,  3, 9,  350.00, 'card', '2210', 'TXN1712001007', 'completed');
GO

-- =============================================
-- SEED DATA: PRESCRIPTIONS
-- =============================================
INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, medications, diagnosis, notes) VALUES
(6,  3, 7,
 '[{"name":"Panadol Extra","dosage":"500mg","frequency":"Twice daily","duration":"5 days"},{"name":"Vitamin D3","dosage":"1000 IU","frequency":"Once daily","duration":"30 days"}]',
 'Mild vitamin D deficiency, general fatigue',
 'Patient advised to increase sun exposure and maintain balanced diet. Follow up in 1 month.'),
(7,  1, 6,
 '[{"name":"Lexapro (Escitalopram)","dosage":"10mg","frequency":"Once daily","duration":"30 days"},{"name":"Xanax (Alprazolam)","dosage":"0.25mg","frequency":"As needed","duration":"14 days"}]',
 'Generalized Anxiety Disorder (GAD)',
 'Continue cognitive behavioral therapy sessions. Reduce caffeine intake. Next appointment in 4 weeks.'),
(8,  2, 8,
 '[{"name":"Refresh Tears Eye Drops","dosage":"1 drop","frequency":"4 times daily","duration":"14 days"}]',
 'Mild dry eye syndrome',
 'Reduce screen time. Use humidifier at home. Return for follow-up if symptoms persist.'),
(9,  3, 9,
 '[{"name":"Augmentin","dosage":"625mg","frequency":"Twice daily","duration":"7 days"},{"name":"Ibuprofen","dosage":"400mg","frequency":"As needed for pain","duration":"5 days"}]',
 'Dental abscess - lower left molar',
 'Cavity filled. Root canal may be needed if infection recurs. Avoid hard foods for 48 hours.');
GO

-- =============================================
-- SEED DATA: CONVERSATIONS
-- =============================================
INSERT INTO conversations (patient_id, doctor_id, last_message, last_message_at) VALUES
(1, 1, 'Thank you doctor, I will bring my previous ECG results.', DATEADD(HOUR, -2, GETDATE())),
(2, 2, 'Is it okay to give the baby Calpol before the appointment?',  DATEADD(HOUR, -5, GETDATE())),
(3, 5, 'The headaches have reduced since starting the medication.',   DATEADD(DAY, -1, GETDATE()));
GO

-- =============================================
-- SEED DATA: MESSAGES
-- =============================================
INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES
-- Conversation 1: Ahmed <-> Dr. Hassan (Cardiology)
(1, 12, 'Hello Dr. Hassan, I wanted to confirm my appointment for Saturday.', 1, DATEADD(HOUR, -4, GETDATE())),
(1, 2,  'Yes Ahmed, your appointment is confirmed at 10 AM. Please bring your previous ECG results if you have them.', 1, DATEADD(HOUR, -3, GETDATE())),
(1, 12, 'Thank you doctor, I will bring my previous ECG results.', 1, DATEADD(HOUR, -2, GETDATE())),

-- Conversation 2: Fatma <-> Dr. Amira (Pediatrics)
(2, 13, 'Good morning Dr. Amira, my child has had a mild fever. Should I still come for the vaccination?', 1, DATEADD(HOUR, -8, GETDATE())),
(2, 3,  'Good morning Fatma. If the fever is below 38.5, it should be fine. Give Calpol and monitor.', 1, DATEADD(HOUR, -7, GETDATE())),
(2, 13, 'Is it okay to give the baby Calpol before the appointment?', 0, DATEADD(HOUR, -5, GETDATE())),

-- Conversation 3: Omar <-> Dr. Farouk (Neurology)
(3, 14, 'Dr. Farouk, I started the new medication you prescribed. How long until I see results?',  1, DATEADD(DAY, -2, GETDATE())),
(3, 6,  'It usually takes 1-2 weeks for the full effect. Please keep a headache diary and note any side effects.', 1, DATEADD(DAY, -2, GETDATE())),
(3, 14, 'The headaches have reduced since starting the medication.', 0, DATEADD(DAY, -1, GETDATE()));
GO

-- =============================================
-- SEED DATA: REVIEWS
-- =============================================
INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES
(3, 7, 6, 5, 'Dr. Hegazi was very thorough and professional. He took his time to explain everything clearly. Highly recommended!'),
(1, 6, 7, 4, 'Dr. Osman is a great psychiatrist. The video call was smooth and she made me feel very comfortable.'),
(2, 8, 8, 5, 'Dr. Wagdy is excellent. Very gentle and explained the eye condition in simple terms. The clinic is well-equipped.'),
(3, 9, 9, 4, 'Good dental work by Dr. Seif. The procedure was painless. Only downside was a 15-minute wait.');
GO

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
PRINT '========================================';
PRINT 'DATABASE CREATION COMPLETE';
PRINT '========================================';

SELECT 'Users'          AS [Table], COUNT(*) AS [Records] FROM users
UNION ALL
SELECT 'Specialties',   COUNT(*) FROM specialties
UNION ALL
SELECT 'Doctors',       COUNT(*) FROM doctors
UNION ALL
SELECT 'Patients',      COUNT(*) FROM patients
UNION ALL
SELECT 'Appointments',  COUNT(*) FROM appointments
UNION ALL
SELECT 'Payments',      COUNT(*) FROM payments
UNION ALL
SELECT 'Prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Messages',      COUNT(*) FROM messages
UNION ALL
SELECT 'Reviews',       COUNT(*) FROM reviews;
GO
