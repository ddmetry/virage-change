import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';

const out=path.join(process.cwd(),'public');
const base=(process.env.BASE_PATH||'').replace(/\/+$/,'');
const required=[
  'index.html',
  'rates/index.html',
  'faq/index.html',
  'order/index.html',
  'pay/index.html',
  'blog/index.html',
  'contacts/index.html',
  'css/app.css',
  'js/app.js',
  'js/order.js'
];

const errors=[];

for(const rel of required){
  try{await stat(path.join(out,rel));}
  catch{errors.push(`Missing: ${rel}`);}
}

async function walk(dir){
  for(const name of await readdir(dir)){
    const file=path.join(dir,name);
    const s=await stat(file);
    if(s.isDirectory()){await walk(file);continue;}
    const rel=path.relative(out,file).replaceAll('\\','/');
    if(name.endsWith('.html')){
      const text=await readFile(file,'utf8');
      const abs=[...text.matchAll(/\b(?:href|src|action)=["']\/(?!\/)([^"']*)/g)].map(m=>m[1]);
      for(const value of abs){
        if(base && !(`/${value}`).startsWith(`${base}/`) && `/${value}`!==base){
          errors.push(`${rel}: unscoped absolute URL /${value}`);
        }
      }
    }
    if(name.endsWith('.css')){
      const text=await readFile(file,'utf8');
      const abs=[...text.matchAll(/url\((?:['"]?)\/(?!\/)([^)'"]*)/g)].map(m=>m[1]);
      for(const value of abs){
        if(base && !(`/${value}`).startsWith(`${base}/`)){
          errors.push(`${rel}: unscoped CSS URL /${value}`);
        }
      }
    }
    if(name.endsWith('.js')){
      const text=await readFile(file,'utf8');
      if(text.includes('__BASE_PATH__')) errors.push(`${rel}: unresolved __BASE_PATH__`);
    }
  }
}

await walk(out);

if(errors.length){
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Static Pages build validated for ${base||'/'}`);
