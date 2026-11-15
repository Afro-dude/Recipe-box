import { generateRecipe, ApiError } from './generate.js';
export function send(res, status, body) {
  if (res.destroyed) return;
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
export async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST to generate a recipe.' });
  const controller = new AbortController();
  res.on('close', () => { if (!res.writableEnded) controller.abort(); });
  try {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) throw new ApiError(403, 'Cross-origin requests are not allowed.');
    let body = req.body;
    if (!body) {
      let input = '';
      for await (const chunk of req) {
        input += chunk;
        if (Buffer.byteLength(input) > 64000) throw new ApiError(413, 'The request is too large.');
      }
      try { body = JSON.parse(input); } catch { throw new ApiError(400, 'Send a valid JSON request.'); }
    }
    if (Buffer.byteLength(JSON.stringify(body)) > 64000) throw new ApiError(413, 'The request is too large.');
    send(res, 200, { recipe: await generateRecipe(body, { signal: controller.signal }) });
  } catch (error) { send(res, error.status || 500, { error: error.status ? error.message : 'Something went wrong. Please retry.' }); }
}
