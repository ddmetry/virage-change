import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Classes{constructor(){this.set=new Set()}add(...v){v.forEach(x=>this.set.add(x))}remove(...v){v.forEach(x=>this.set.delete(x))}toggle(v,force){if(force===undefined)force=!this.set.has(v);force?this.set.add(v):this.set.delete(v);return force}contains(v){return this.set.has(v)}}
class Element{constructor(dataset={}){this.dataset=dataset;this.listeners={};this.classList=new Classes();this.style={setProperty:(k,v)=>this.style[k]=v};this.value='';this.textContent='';this.src='';this.href='';this.hidden=false;this.children=[];this.attrs={};this.valid=true}addEventListener(t,f){(this.listeners[t]??=[]).push(f)}emit(t,event={}){for(const f of this.listeners[t]??[])f({target:this,currentTarget:this,preventDefault(){},...event})}click(){this.emit('click')}setAttribute(k,v){this.attrs[k]=String(v);if(k==='src')this.src=String(v)}getAttribute(k){return k==='src'?this.src:this.attrs[k]??null}removeAttribute(k){delete this.attrs[k]}showModal(){this.open=true}close(){this.open=false}focus(){this.focused=true}replaceChildren(...x){if(x.length===1&&typeof x[0]==='string')this.textContent=x[0];this.children=x}add(x){this.children.push(x)}matches(){return false}checkValidity(){return this.valid}}
function runScript(path,context){vm.createContext(context);const code=fs.readFileSync(path,'utf8').replaceAll('__BASE_PATH__','/virage-change');vm.runInContext(code,context)}

test('static exchange: currency selection, mode, swap, continue URL',()=>{
  const amountIn=new Element(),amountOut=new Element(),fromTicker=new Element(),toTicker=new Element(),fromIcon=new Element(),toIcon=new Element(),rateText=new Element(),continueLink=new Element(),modal=new Element(),search=new Element(),swap=new Element(),helper=new Element(),segWrap=new Element();
  amountIn.value='100000';
  const fromBtn=new Element({side:'from'}),toBtn=new Element({side:'to'}),closeBtn=new Element();
  const mode0=new Element(),mode1=new Element();
  const names={RUB:'RUB Российский рубль',USDT:'USDT Tether',BTC:'BTC Bitcoin',ETH:'ETH Ethereum'};
  const options=Object.keys(names).map(code=>{const e=new Element({currency:code});e.textContent=names[code];return e});
  const one={'[data-amount-in]':amountIn,'[data-amount-out]':amountOut,'[data-from-ticker]':fromTicker,'[data-to-ticker]':toTicker,'[data-from-icon]':fromIcon,'[data-to-icon]':toIcon,'[data-rate]':rateText,'[data-exchange-continue]':continueLink,'[data-currency-modal]':modal,'[data-currency-search]':search,'[data-swap]':swap,'[data-close-modal]':closeBtn,'[data-from-helper]':helper,'[data-seg]':segWrap};
  const document={querySelector:s=>one[s]??null,querySelectorAll:s=>s==='[data-currency]'?options:s==='[data-seg] button'?[mode0,mode1]:s==='[data-open-currency]'?[fromBtn,toBtn]:[]};
  runScript('src/js/exchange.js',{document,requestAnimationFrame:f=>f(),URLSearchParams,Number,String,Math,console});
  assert.equal(fromTicker.textContent,'RUB');assert.equal(toTicker.textContent,'USDT');assert.match(continueLink.href,/from=RUB/);
  fromBtn.click();options.find(x=>x.dataset.currency==='BTC').click();assert.equal(fromTicker.textContent,'BTC');assert.equal(toTicker.textContent,'RUB');assert.equal(amountIn.value,'0.01');
  mode1.click();assert.equal(fromTicker.textContent,'BTC');assert.equal(toTicker.textContent,'USDT');
  toBtn.click();options.find(x=>x.dataset.currency==='ETH').click();assert.equal(toTicker.textContent,'ETH');
  swap.click();assert.equal(fromTicker.textContent,'ETH');assert.equal(toTicker.textContent,'BTC');assert.match(continueLink.href,/mode=crypto/);
});

test('static order: selected direction reaches payment URL',()=>{
  class OptionMock{constructor(text,value){this.text=text;this.value=value}}
  const form=new Element(),fromIcon=new Element(),toIcon=new Element(),fromAmount=new Element(),toAmount=new Element(),rate=new Element(),networkFrom=new Element(),networkTo=new Element(),addressLabel=new Element(),address=new Element(),email=new Element(),checkbox=new Element();
  const required=[networkFrom,networkTo,address,email,checkbox];required.forEach(x=>x.valid=true);form.querySelectorAll=s=>s==='[required]'?required:[];
  const map={'[data-order-form]':form,'[data-order-from-icon]':fromIcon,'[data-order-to-icon]':toIcon,'[data-order-from-amount]':fromAmount,'[data-order-to-amount]':toAmount,'[data-order-rate]':rate,'[data-network-from]':networkFrom,'[data-network-to]':networkTo,'[data-address-label]':addressLabel,'[data-address-input]':address};
  const document={querySelector:s=>map[s]??null};let href='';const location={search:'?from=BTC&to=USDT&amount=0.01&out=642.2&mode=crypto',set href(v){href=v},get href(){return href}};
  const context={document,location,URLSearchParams,Option:OptionMock,Number,String,Math,crypto:{randomUUID:()=> 'uuid'},window:{showToast(){}},console};context.globalThis=context;
  runScript('src/js/order.js',context);networkFrom.value='BTC';networkTo.value='TRC20';address.value='demo';email.value='demo@example.com';form.emit('submit');
  assert.match(href,/\/pay\/\?/);assert.match(href,/from=BTC/);assert.match(href,/to=USDT/);assert.match(href,/networkTo=TRC20/);
});

test('static pay: summary is populated and paid status changes',()=>{
  const ids=[new Element(),new Element()],payAmount=new Element(),receiveAmount=new Element(),receiveNetwork=new Element(),receiveIcon=new Element(),payRef=new Element(),payHint=new Element(),paid=new Element(),status=new Element(),statusText=new Element();status.querySelector=()=>statusText;const steps=[new Element(),new Element(),new Element(),new Element()];
  const map={'[data-pay-amount]':payAmount,'[data-receive-amount]':receiveAmount,'[data-receive-network]':receiveNetwork,'[data-receive-icon]':receiveIcon,'#pay-ref':payRef,'[data-pay-hint]':payHint,'[data-paid]':paid,'[data-status]':status};
  const document={querySelector:s=>map[s]??null,querySelectorAll:s=>s==='[data-order-id]'?ids:s==='.progress-step'?steps:map[s]?[map[s]]:[]};
  runScript('src/js/pay.js',{document,location:{search:'?id=VC-1&from=BTC&to=USDT&amount=0.01&out=642.2&networkTo=TRC20'},URLSearchParams,Number,String,window:{showToast(){}},console});
  assert.match(payAmount.textContent,/BTC/);assert.match(receiveAmount.textContent,/USDT/);assert.equal(receiveNetwork.textContent,'TRC20');assert.match(payRef.textContent,/DEMO-BTC/);paid.click();assert.equal(paid.disabled,true);assert.equal(statusText.textContent,'Проверка оплаты');
});
