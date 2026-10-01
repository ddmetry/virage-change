import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const out = path.join(process.cwd(), 'src/assets/fonts');
await mkdir(out, { recursive: true });
const files = [
  ['Onest.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/onest/Onest%5Bwght%5D.ttf'],
  ['Unbounded.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/unbounded/Unbounded%5Bwght%5D.ttf'],
  ['IBMPlexMono-Regular.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf'],
  ['IBMPlexMono-Bold.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Bold.ttf']
];
for (const [name,url] of files) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Virage-Change-font-fetcher' } });
  if (!r.ok) throw new Error(`${name}: ${r.status} ${r.statusText}`);
  await writeFile(path.join(out,name), Buffer.from(await r.arrayBuffer()));
  console.log(`saved ${name}`);
}
