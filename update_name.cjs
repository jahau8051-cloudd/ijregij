const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_Ep9bl7LGeKXV@ep-muddy-rain-amqflkaq.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require', ssl: {rejectUnauthorized: false} });

pool.query("SELECT id, full_name, email FROM users WHERE full_name ILIKE '%owef%'").then(r => {
  console.log(r.rows);
  if (r.rows.length > 0) {
    pool.query("UPDATE users SET full_name = 'Dr. Loay Elsayed' WHERE id = $1", [r.rows[0].id]).then(() => {
      console.log('Updated');
      process.exit(0);
    });
  } else {
    console.log('Not found');
    process.exit(0);
  }
}).catch(console.error);
