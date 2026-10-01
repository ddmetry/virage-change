import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';

const out=path.join(process.cwd(),'public');
const base=(process.env.BASE_PATH||'').replace(/\/+$/,'');
const required=['index.html','rates/index.html','faq/index.html','order/index.html','pay/index.html','blog/index.html','contacts/index.html','css/app.css','js/app.js','js/exchange.js','js/order.js','js/pay.js'];
const errors=[];
for(const rel of required){try{await stat(path.join(out,rel))}catch{errors.push(`Missing: ${rel}`)}}

function resolveInternal(url){
  if(!url||url.startsWith('#')||/^(?:https?:|mailto:|tel:|data:)/.test(url))return null;
  let clean=url.split('#')[0].split('?')[0];
  if(!clean)return null;
  if(base){
    if(clean===base||clean===`${base}/`)clean='/';
    else if(clean.startsWith(`${base}/`))clean=clean.slice(base.length);
    else if(clean.startsWith('/')){errors.push(`Unscoped absolute URL: ${url}`);return null}
  }
  clean=clean.replace(/^\//,'');
  if(!clean)return 'index.html';
  if(clean.endsWith('/'))return `${clean}index.html`;
  return clean;
}

async function walk(dir){
  for(const name of await readdir(dir)){
    const file=path.join(dir,name),s=await stat(file);
    if(s.isDirectory()){await walk(file);continue}
    const rel=path.relative(out,file).replaceAll('\\','/');
    const text=await readFile(file,'utf8');
    if(name.endsWith('.html')){
      const h1=(text.match(/<h1\b/gi)||[]).length;
      if(!rel.startsWith('admin/')&&h1!==1)errors.push(`${rel}: expected one h1, found ${h1}`);
      const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      for(const id of new Set(ids))if(ids.filter(x=>x===id).length>1)errors.push(`${rel}: duplicate id ${id}`);
      for(const tag of text.match(/<[a-z][^>]*>/gi)||[]){
        if((tag.match(/\bclass="/g)||[]).length>1)errors.push(`${rel}: duplicate class attribute`);
        if(/\sstyle=/.test(tag))errors.push(`${rel}: inline style is not allowed`);
        if(/\son[a-z]+=/i.test(tag))errors.push(`${rel}: inline event handler is not allowed`);
      }
      for(const m of text.matchAll(/<img\b([^>]*)>/gi))for(const attr of ['src','alt','width','height'])if(!new RegExp(`\\b${attr}=`).test(m[1]))errors.push(`${rel}: image missing ${attr}`);
      for(const m of text.matchAll(/\b(?:href|src|action)=["']([^"']+)["']/g)){
        const target=resolveInternal(m[1]);if(!target)continue;
        try{await stat(path.join(out,target))}catch{errors.push(`${rel}: broken internal reference ${m[1]} -> ${target}`)}
      }
    }
    if(name.endsWith('.css')){
      for(const m of text.matchAll(/url\((?:['"]?)(\/[^)'"\s]*)/g)){
        const target=resolveInternal(m[1]);if(!target)continue;
        try{await stat(path.join(out,target))}catch{errors.push(`${rel}: broken CSS asset ${m[1]} -> ${target}`)}
      }
    }
    if(name.endsWith('.js')&&text.includes('__BASE_PATH__'))errors.push(`${rel}: unresolved __BASE_PATH__`);
  }
}
await walk(out);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Static Pages build validated: routes, assets, markup and base path are valid for ${base||'/'}`);
