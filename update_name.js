import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require' });
await c.connect();
try {
  const r = await c.query("SELECT id, full_name, email FROM users WHERE full_name ILIKE '%owef%' OR email ILIKE '%owef%'");
  console.log('Found:', r.rows);
  if (r.rows.length > 0) {
    await c.query("UPDATE users SET full_name = 'Dr. Loay Elsayed' WHERE id = $1", [r.rows[0].id]);
    console.log('Successfully updated to Dr. Loay Elsayed');
  }
} catch (e) {
  console.error(e);
}
await c.end();
