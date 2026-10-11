import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const nitroServerPath = path.resolve('.output/server/index.mjs');

if (fs.existsSync(nitroServerPath)) {
  console.log('[Server] Launching TanStack Start / Nitro production server...');
  await import(pathToFileURL(nitroServerPath).href);
} else {
  console.error('[Server] Fatal: .output/server/index.mjs not found!');
  process.exit(1);
}

export default function () {}
