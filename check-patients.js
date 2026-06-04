import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require' });
await c.connect();
const r = await c.query(`SELECT p.id as patient_id, u.id as user_id, u.email, u.full_name,
  (SELECT COUNT(*) FROM appointments WHERE patient_id=p.id) as appts
  FROM patients p JOIN users u ON p.user_id=u.id ORDER BY p.id`);
console.table(r.rows);
await c.end();
