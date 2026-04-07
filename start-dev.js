import { spawn } from 'child_process';

const server = spawn('node', ['server.js'], { stdio: 'inherit' });
server.on('error', err => console.error('Server error:', err.message));

setTimeout(() => {
  const vite = spawn('npx', ['vite'], { stdio: 'inherit' });
  vite.on('error', err => console.error('Vite error:', err.message));

  const cleanup = () => { server.kill('SIGTERM'); vite.kill('SIGTERM'); process.exit(0); };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 2000);
