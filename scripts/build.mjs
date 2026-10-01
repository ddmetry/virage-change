import {cp,mkdir,readFile,writeFile,rm,readdir,stat} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),src=path.join(root,'src'),out=path.join(root,'public');
const base=(process.env.BASE_PATH||'').trim().replace(/\/+$/,'');

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});

for(const dir of ['css','js','assets']) {
  await cp(path.join(src,dir),path.join(out,dir),{recursive:true});
}

const partials={
  HEADER:await readFile(path.join(src,'partials/header.html'),'utf8'),
  FOOTER:await readFile(path.join(src,'partials/footer.html'),'utf8'),
  BG:await readFile(path.join(src,'partials/bg.html'),'utf8')
};

function rewriteHtml(html){
  if(!base) return html;
  return html
    .replace(/\b(href|src|action)="\/(?!\/)/g,(_,attr)=>`${attr}="${base}/`)
    .replace(/\b(href|src|action)='\/(?!\/)/g,(_,attr)=>`${attr}='${base}/`);
}

function rewriteCss(css){
  if(!base) return css;
  return css
    .replace(/url\((['"]?)\/(?!\/)/g,(_,q)=>`url(${q}${base}/`);
}

async function walkPages(dir){
  for(const name of await readdir(dir)){
    const p=path.join(dir,name),s=await stat(p);
    if(s.isDirectory()){
      await walkPages(p);
      continue;
    }
    if(!name.endsWith('.html')) continue;

    const rel=path.relative(path.join(src,'pages'),p);
    const dest=path.join(out,rel);
    await mkdir(path.dirname(dest),{recursive:true});

    let html=await readFile(p,'utf8');
    for(const[k,v]of Object.entries(partials)) html=html.replaceAll(`{{${k}}}`,v);

    html=html.replaceAll(/ style="--i:(\d+)"/g,(_,n)=>` class-temp-i="${n}"`);
    html=html.replaceAll(/ class="([^"]*)" class-temp-i="(\d+)"/g,(_,c,n)=>` class="${c} anim-i-${n}"`);

    await writeFile(dest,html);
  }
}

async function rewriteOutput(dir){
  for(const name of await readdir(dir)){
    const p=path.join(dir,name),s=await stat(p);
    if(s.isDirectory()){
      await rewriteOutput(p);
      continue;
    }

    if(name.endsWith('.css')){
      const css=await readFile(p,'utf8');
      await writeFile(p,rewriteCss(css));
    } else if(name.endsWith('.html')){
      const html=await readFile(p,'utf8');
      await writeFile(p,rewriteHtml(html));
    } else if(name.endsWith('.js')){
      const js=await readFile(p,'utf8');
      await writeFile(p,js.replaceAll('__BASE_PATH__',base));
    }
  }
}

await walkPages(path.join(src,'pages'));
await cp(path.join(src,'admin'),path.join(out,'admin'),{recursive:true});
await rewriteOutput(out);
await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Built public/${base ? ` for base path ${base}` : ''}`);
