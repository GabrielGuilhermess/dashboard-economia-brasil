import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), '..');
const staticDir = path.resolve(rootDir, process.env.STATIC_DIR ?? 'out');
const hostname = process.env.HOSTNAME ?? '0.0.0.0';
const port = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(
      request.url ?? '/',
      `http://${request.headers.host ?? 'localhost'}`,
    );
    const resolvedPath = await resolveFilePath(requestUrl.pathname);

    if (!resolvedPath) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(resolvedPath)] ?? 'application/octet-stream',
    });

    createReadStream(resolvedPath).pipe(response);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
  }
});

server.listen(port, hostname, () => {
  console.log(`Static dashboard available at http://${hostname}:${port}`);
});

async function resolveFilePath(requestPath) {
  const safePath = normalizePath(requestPath);

  if (safePath === null) {
    return null;
  }

  const candidates =
    safePath === ''
      ? ['index.html']
      : [safePath, `${safePath}.html`, path.join(safePath, 'index.html')];

  for (const candidate of candidates) {
    const fullPath = path.resolve(staticDir, candidate);

    if (!isPathInsideStaticDir(fullPath)) {
      return null;
    }

    try {
      const fileStats = await stat(fullPath);

      if (fileStats.isFile()) {
        return fullPath;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function normalizePath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const trimmedPath = decodedPath.replace(/^\/+/, '');
  const normalizedPath = path.normalize(trimmedPath);

  if (normalizedPath === '.' || normalizedPath === path.sep) {
    return '';
  }

  if (normalizedPath.startsWith('..')) {
    return null;
  }

  return normalizedPath;
}

function isPathInsideStaticDir(targetPath) {
  return (
    targetPath === staticDir ||
    targetPath.startsWith(`${staticDir}${path.sep}`)
  );
}
