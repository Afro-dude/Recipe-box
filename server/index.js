import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { handler, send } from './http.js';
try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/generate') return handler(req, res);
  if (path === '/api/status') return send(res, 200, { configured: Boolean(process.env.GROQ_API_KEY) });
  vite.middlewares(req, res);
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log(`Recipe Box: http://127.0.0.1:${process.env.PORT || 5173}`));
async function close() { await vite.close(); server.close(() => process.exit()); }
process.on('SIGINT', close);
process.on('SIGTERM', close);
