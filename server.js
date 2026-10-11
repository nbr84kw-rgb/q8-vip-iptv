import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const nitroServerPath = path.resolve('.output/server/index.mjs');

if (fs.existsSync(nitroServerPath)) {
  console.log('[Server] Launching TanStack Start / Nitro server...');
  await import(pathToFileURL(nitroServerPath).href);
} else {
  console.log('[Server] Nitro server not found, launching fallback...');
  const fallbackPath = path.resolve('server.legacy.js');
  await import(pathToFileURL(fallbackPath).href);
}
