import path from 'node:path';
import { pathToFileURL } from 'node:url';

const nitroServerPath = path.resolve('.output/server/index.mjs');
await import(pathToFileURL(nitroServerPath).href);
