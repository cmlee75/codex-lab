// Copy the browser build of SQLite WASM into vendor/ so the site needs no
// CDN and no bundler: GitHub Pages serves index.mjs + sqlite3.wasm as-is.
import { copyFileSync, mkdirSync } from 'node:fs';

const SRC = 'node_modules/@sqlite.org/sqlite-wasm/dist';
mkdirSync('vendor/sqlite-wasm', { recursive: true });
for (const f of ['index.mjs', 'sqlite3.wasm']) {
  copyFileSync(`${SRC}/${f}`, `vendor/sqlite-wasm/${f}`);
}
console.log('Vendored SQLite WASM into vendor/sqlite-wasm/');
