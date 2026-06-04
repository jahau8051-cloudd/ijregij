import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({ connectionString: DATABASE_URL });

async function migrate() {
  await client.connect();
  console.log('Connected to Neon PostgreSQL');

  // Create tables
  console.log('Creating tables...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'patient',
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS specialties (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '',
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date_of_birth TEXT,
      blood_type TEXT,
      height_cm INTEGER,
      weight_kg REAL,
      allergies TEXT,
      chronic_conditions TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER REFERENCES doctors(id),
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL DEFAULT '09:00',
      status TEXT DEFAULT 'pending',
      type TEXT DEFAULT 'in-person',
      reason TEXT,
      notes TEXT,
      fee REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER REFERENCES appointments(id),
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'card',
      card_last4 TEXT,
      status TEXT DEFAULT 'completed',
      transaction_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER REFERENCES appointments(id),
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER REFERENCES doctors(id),
      medications TEXT DEFAULT '[]',
      diagnosis TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER REFERENCES doctors(id),
      last_message TEXT,
      last_message_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(patient_id, doctor_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id),
      sender_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id),
      doctor_id INTEGER REFERENCES doctors(id),
      appointment_id INTEGER REFERENCES appointments(id),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(appointment_id)
    );
  `);
  console.log('Tables created.');

  // Seed specialties
  const specCheck = await client.query('SELECT COUNT(*) as count FROM specialties');
  if (parseInt(specCheck.rows[0].count) === 0) {
    console.log('Seeding specialties...');
    await client.query(`
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

  // Seed admin
  const adminCheck = await client.query("SELECT id FROM users WHERE email='admin@medidash.com'");
  if (adminCheck.rows.length === 0) {
    console.log('Creating admin...');
    const encoded = Buffer.from('admin123').toString('base64');
    await client.query("INSERT INTO users (email, password, role, full_name) VALUES ($1, $2, 'admin', $3)", ['admin@medidash.com', encoded, 'Platform Admin']);
  }

  // Seed Egyptian doctors
  const docCheck = await client.query("SELECT COUNT(*) as count FROM doctors");
  if (parseInt(docCheck.rows[0].count) === 0) {
    console.log('Seeding Egyptian doctors...');
    const password = Buffer.from('password123').toString('base64');

    const doctors = [
      { full_name: 'Dr. Mohamed Hassan', email: 'hassan@cardiodokki.eg', specialty_id: 1, bio: 'Senior Consultant Cardiologist with 15 years experience in interventional cardiology and valvular heart disease. Fellow of the European Society of Cardiology (ESC).', fee: 450, clinic: 'Health Square Clinic, Dokki', address: '15 Mossadak St, Dokki, Giza' },
      { full_name: 'Dr. Amira El-Sayed', email: 'amira.peds@alex.eg', specialty_id: 5, bio: 'Dedicated pediatrician specializing in neonatal care and developmental childhood milestones. MD from Cairo University Faculty of Medicine.', fee: 300, clinic: 'Alex Children Center, Smouha', address: '45 Victor Emmanuel St, Smouha, Alexandria' },
      { full_name: 'Dr. Ahmed Khalil', email: 'a.khalil.ortho@maadi.eg', specialty_id: 4, bio: 'Orthopedic Surgeon focused on sports medicine and joint replacement surgery. Trained at the American Hospital in Cairo.', fee: 550, clinic: 'Maadi Ortho Hub, Degla', address: 'Road 233, Maadi, Cairo' },
      { full_name: 'Dr. Sarah Ibrahim', email: 's.ibrahim.derm@nasr.eg', specialty_id: 3, bio: 'Specialist in clinical and cosmetic dermatology. Expert in non-surgical facial rejuvenation and skin condition treatments.', fee: 400, clinic: 'Radiance Skin Center, Nasr City', address: 'Abbas El-Akkad St, Nasr City, Cairo' },
      { full_name: 'Dr. Omar Farouk', email: 'farouk.neuro@zamalek.eg', specialty_id: 2, bio: 'Award-winning Neurologist specializing in neurodegenerative diseases and stroke management. Author of several clinical research papers on epilepsy.', fee: 600, clinic: 'Elite Neurology Suite, Zamalek', address: 'Shagaret El-Dorr St, Zamalek, Cairo' },
      { full_name: 'Dr. Nadia Osman', email: 'n.osman.psych@heliopolis.eg', specialty_id: 6, bio: 'Psychiatrist and Behavioral Therapist focusing on anxiety and depressive disorders in adults and teens.', fee: 450, clinic: 'Peace Center, Heliopolis', address: 'El-Nozha St, Heliopolis, Cairo' },
      { full_name: 'Dr. Tarek Hegazi', email: 'thegazi.gpt@sheraton.eg', specialty_id: 8, bio: 'General Practitioner with a focus on family wellness and preventative medicine. Over 20 years of family practice.', fee: 250, clinic: 'Sheraton Medical Center', address: 'Sheraton Bldgs, Cairo' },
      { full_name: 'Dr. Mona Wagdy', email: 'm.wagdy.eye@mohandessin.eg', specialty_id: 7, bio: 'Ophthalmologist specializing in LASIK and cataract surgery. Member of the Egyptian Society of Ophthalmology.', fee: 500, clinic: 'ClearView Clinic, Mohandessin', address: 'Gameat El-Dowal El-Arabeya, Giza' },
      { full_name: 'Dr. Khaled Seif', email: 'seif.dent@sporting.eg', specialty_id: 9, bio: 'Dental Surgeon specializing in cosmetic dentistry and implantology. Passionate about painless dental treatments.', fee: 350, clinic: 'Smile Alexandria, Sporting', address: 'Port Said St, Sporting, Alexandria' },
      { full_name: 'Dr. Yasmin Refaat', email: 'y.refaat.gyn@newcairo.eg', specialty_id: 10, bio: 'OB/GYN Consultant with extensive experience in high-risk pregnancies and reproductive health.', fee: 450, clinic: 'New Cairo Wellness Hub', address: 'North 90th St, New Cairo' }
    ];

    for (const doc of doctors) {
      const uRes = await client.query('INSERT INTO users (email, password, role, full_name, is_active) VALUES ($1, $2, $3, $4, 1) RETURNING id', [doc.email, password, 'doctor', doc.full_name]);
      const userId = uRes.rows[0].id;
      await client.query("INSERT INTO doctors (user_id, specialty_id, bio, consultation_fee, clinic_name, clinic_address, status, experience_years, available_days) VALUES ($1, $2, $3, $4, $5, $6, 'approved', 10, 'Sat,Sun,Mon,Tue,Wed')", [userId, doc.specialty_id, doc.bio, doc.fee, doc.clinic, doc.address]);
    }

    // Seed patients
    console.log('Seeding patients...');
    const patients = [
      { full_name: 'Ahmed Fawzy', email: 'ahmed.patient@gmail.com' },
      { full_name: 'Layla Mansour', email: 'layla.patient@outlook.com' },
      { full_name: 'Youssef Soliman', email: 'youssef@yahoo.com' }
    ];
    for (const pat of patients) {
      const uRes = await client.query('INSERT INTO users (email, password, role, full_name, is_active) VALUES ($1, $2, $3, $4, 1) RETURNING id', [pat.email, password, 'patient', pat.full_name]);
      await client.query("INSERT INTO patients (user_id, blood_type, date_of_birth) VALUES ($1, 'A+', '1990-01-01')", [uRes.rows[0].id]);
    }
  }

  console.log('Migration complete!');
  const counts = await client.query('SELECT (SELECT COUNT(*) FROM users) as users, (SELECT COUNT(*) FROM doctors) as doctors, (SELECT COUNT(*) FROM patients) as patients, (SELECT COUNT(*) FROM specialties) as specialties');
  console.log('Database stats:', counts.rows[0]);

  await client.end();
}

migrate().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
