import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import http from 'node:http';import {once} from 'node:events';import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'ignore'});const child=spawn(process.execPath,['server/main.js'],{env:{...process.env,PORT:'3188',HOST:'127.0.0.1'},stdio:'ignore'});await new Promise(r=>setTimeout(r,180));
async function req(path,{method='GET',body,headers={}}={}){return new Promise((resolve,reject)=>{const q=http.request({host:'127.0.0.1',port:3188,path,method,headers},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,body:d}))});q.on('error',reject);if(body)q.write(body);q.end()})}
process.on('exit',()=>child.kill());
test('1 health',async()=>{const r=await req('/api/health');assert.equal(r.status,200);assert.equal(JSON.parse(r.body).ok,true)});
test('2 rates',async()=>{const r=await req('/api/rates');assert.equal(r.status,200);assert.ok(JSON.parse(r.body).rates.RUB_USDT)});
test('3 quote exact integer math',async()=>{const r=await req('/api/quote',{method:'POST',body:JSON.stringify({amount_minor:'100000'}),headers:{'content-type':'application/json'}});assert.equal(JSON.parse(r.body).result_minor,'1055')});
test('4 JSON content type required',async()=>{const r=await req('/api/quote',{method:'POST',body:'{}'});assert.equal(r.status,415)});
test('5 order validation',async()=>{const r=await req('/api/orders',{method:'POST',body:JSON.stringify({}),headers:{'content-type':'application/json'}});assert.equal(r.status,400)});
test('6 order lifecycle starts awaiting_payment',async()=>{const r=await req('/api/orders',{method:'POST',body:JSON.stringify({email:'a@b.co',address:'demo'}),headers:{'content-type':'application/json'}});const j=JSON.parse(r.body);assert.equal(r.status,201);assert.equal(j.status,'awaiting_payment');assert.ok(j.token)});
test('7 traversal blocked',async()=>{const r=await req('/..%2F..%2Fetc%2Fpasswd');assert.equal(r.status,404)});
test('8 security headers + sitemap-like pages',async()=>{const r=await req('/');assert.equal(r.status,200);assert.match(r.headers['content-security-policy'],/default-src 'self'/);for(const p of ['/order/','/pay/','/rates/','/faq/','/admin/']){const x=await req(p);assert.equal(x.status,200)}});
test.after(()=>child.kill());
