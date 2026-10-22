import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const host = option('--host') || '127.0.0.1';
const port = Number(option('--port') ?? process.env.PORT ?? 5173);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error('Use a valid port, such as --port 5173.');
  process.exit(1);
}
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.pdf': 'application/pdf'
};
const inside = path => {
  const name = relative(root, path);
  return !isAbsolute(name) && name !== '..' && !name.startsWith('..' + sep);
};
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let path = resolve(root, '.' + pathname);
    if (!inside(path)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    let info = await stat(path);
    if (info.isDirectory()) { path = join(path, 'index.html'); info = await stat(path); }
    path = await realpath(path);
    if (!inside(path) || !info.isFile()) {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200, {
      'Content-Type': types[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(path);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    const malformed = error instanceof URIError;
    response.writeHead(malformed ? 400 : 404);
    response.end(malformed ? 'Bad request' : 'Not found');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port ' + port + ' is busy. Run npm run dev -- --port 5174 instead.'
    : error.message);
  process.exit(1);
});
console.log('Starting Design Playground...');
server.listen(port, host, () => {
  const address = server.address();
  const label = host === '127.0.0.1' ? 'localhost' : host;
  console.log('Local: http://' + label + ':' + address.port + '/');
  console.log('Edit dist/ and refresh the browser. Press Ctrl+C to stop.');
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
