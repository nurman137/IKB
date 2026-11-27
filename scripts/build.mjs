import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'web'), path.join(dist, 'assets'), { recursive: true, filter: source => path.basename(source) !== 'index.html' });
const data = JSON.parse(await readFile(path.join(root, 'docs/m0/reference_cases.json'), 'utf8'));
await writeFile(path.join(dist, 'assets/cases.json'), JSON.stringify(data));
const template = await readFile(path.join(root, 'web/index.html'), 'utf8');
const routes = ['', 'tentang', ...Array.from({ length: 10 }, (_, i) => {
  const id = String(i + 1).padStart(2, '0');
  return [`modul/${id}`, `modul/${id}/perhitungan/mesin`, `modul/${id}/perhitungan/kapal`];
}).flat()];
for (const route of routes) {
  const dir = path.join(dist, route);
  await mkdir(dir, { recursive: true });
  const prefix = '../'.repeat(route.split('/').filter(Boolean).length);
  await writeFile(path.join(dir, 'index.html'), template.replaceAll('__ASSETS__', `${prefix}assets`));
}
await writeFile(path.join(dist, '404.html'), template.replaceAll('__ASSETS__', 'assets'));
// Route files make direct visits/reloads work on ordinary static hosting; no SPA fallback required.
console.log(`Built ${routes.length} pages and a 404 page in dist/. No external runtime dependencies.`);
