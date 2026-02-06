import createServer from '@tomphttp/bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bare = createServer('/bare/');
const serve = new nodeStatic.Server(path.join(__dirname, 'main'));

// Handler for Vercel serverless functions
export default function handler(req, res) {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    serve.serve(req, res, function (err) {
      if (err && err.status === 404) {
        // Try serving 404.html
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 - Not Found');
      }
    });
  }
}

// For local development: start a standalone server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const port = process.env.PORT || 8080;
  const server = http.createServer();

  server.on('request', (req, res) => {
    handler(req, res);
  });

  server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req, socket, head)) {
      bare.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  server.listen({ port });
  console.log(`Listening on http://localhost:${port}`);
}
