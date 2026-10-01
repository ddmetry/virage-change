import {cp,mkdir,readFile,writeFile,rm,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),src=path.join(root,'src'),out=path.join(root,'public');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const dir of ['css','js','assets']) await cp(path.join(src,dir),path.join(out,dir),{recursive:true});
const partials={HEADER:await readFile(path.join(src,'partials/header.html'),'utf8'),FOOTER:await readFile(path.join(src,'partials/footer.html'),'utf8'),BG:await readFile(path.join(src,'partials/bg.html'),'utf8')};
async function walk(dir){for(const name of await readdir(dir)){const p=path.join(dir,name),s=await stat(p);if(s.isDirectory())await walk(p);else if(name.endsWith('.html')){const rel=path.relative(path.join(src,'pages'),p);const dest=path.join(out,rel);await mkdir(path.dirname(dest),{recursive:true});let html=await readFile(p,'utf8');for(const[k,v]of Object.entries(partials))html=html.replaceAll(`{{${k}}}`,v);html=html.replaceAll(/ style="--i:(\d+)"/g,(_,n)=>` class-temp-i="${n}"`);html=html.replaceAll(/ class="([^"]*)" class-temp-i="(\d+)"/g,(_,c,n)=>` class="${c} anim-i-${n}"`);await writeFile(dest,html)}}}
await walk(path.join(src,'pages'));
await cp(path.join(src,'admin'),path.join(out,'admin'),{recursive:true});
console.log('Built public/');
