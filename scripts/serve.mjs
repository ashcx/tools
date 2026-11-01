import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = '/tools';
const DEFAULT_PORT = 4173;
const DEFAULT_ROOT = fileURLToPath(new URL('../public', import.meta.url));

const CONTENT_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.png', 'image/png'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
]);

function contentTypeFor(filePath) {
  return CONTENT_TYPES.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

function sendFile(response, filePath, status, method) {
  response.writeHead(status, {
    'content-type': contentTypeFor(filePath),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  if (method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(filePath);
  stream.on('error', () => response.destroy());
  stream.pipe(response);
}

function redirect(response, location) {
  response.writeHead(301, { location, 'cache-control': 'no-store' });
  response.end();
}

async function sendNotFound(root, response, method) {
  const page = join(root, '404.html');
  try {
    await stat(page);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Page not found\n');
    return;
  }
  sendFile(response, page, 404, method);
}

function createHandler(root) {
  return async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed\n');
      return;
    }

    let url;
    try {
      url = new URL(request.url, 'http://localhost');
    } catch {
      await sendNotFound(root, response, request.method);
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      await sendNotFound(root, response, request.method);
      return;
    }

    const outsideMount = pathname !== BASE && !pathname.startsWith(BASE + '/');
    if (outsideMount || pathname.includes('\0')) {
      await sendNotFound(root, response, request.method);
      return;
    }

    if (pathname === BASE) {
      redirect(response, BASE + '/' + url.search);
      return;
    }

    const suffix = pathname.slice(BASE.length);
    const target = resolve(join(root, suffix));
    if (target !== root && !target.startsWith(root + sep)) {
      await sendNotFound(root, response, request.method);
      return;
    }

    let info;
    try {
      info = await stat(target);
    } catch {
      await sendNotFound(root, response, request.method);
      return;
    }

    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) {
        redirect(response, pathname + '/' + url.search);
        return;
      }
      const index = join(target, 'index.html');
      try {
        const indexInfo = await stat(index);
        if (!indexInfo.isFile()) throw new Error('not a file');
      } catch {
        await sendNotFound(root, response, request.method);
        return;
      }
      sendFile(response, index, 200, request.method);
      return;
    }

    if (!info.isFile()) {
      await sendNotFound(root, response, request.method);
      return;
    }

    sendFile(response, target, 200, request.method);
  };
}

export async function startServer({ root = DEFAULT_ROOT, port = 0, host = '127.0.0.1' } = {}) {
  const documentRoot = resolve(root);
  const info = await stat(documentRoot);
  if (!info.isDirectory()) {
    throw new Error(`artifact root is not a directory: ${documentRoot}`);
  }

  const server = createServer(createHandler(documentRoot));
  await new Promise((ready, failed) => {
    const onError = (error) => failed(error);
    server.once('error', onError);
    server.listen(port, host, () => {
      server.off('error', onError);
      ready();
    });
  });

  const address = server.address();
  const boundPort = typeof address === 'object' && address ? address.port : port;

  const close = () =>
    new Promise((done, failed) => {
      server.close((error) => (error ? failed(error) : done()));
      server.closeIdleConnections?.();
    });

  return { server, url: `http://${host}:${boundPort}`, port: boundPort, close };
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const { url, close } = await startServer({ port });
  console.log(`Serving ${DEFAULT_ROOT} at ${url}${BASE}/`);

  const stop = (signal) => {
    console.log(`\n${signal} received, stopping the server.`);
    close().then(
      () => process.exit(0),
      (error) => {
        console.error(error);
        process.exit(1);
      },
    );
  };

  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
}
