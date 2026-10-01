const basePath='__BASE_PATH__';
const form=document.querySelector('[data-order-form]');
const params=new URLSearchParams(location.search);
const allowed=new Set(['RUB','USDT','BTC','ETH']);
const from=allowed.has(params.get('from'))?params.get('from'):'RUB';
const to=allowed.has(params.get('to'))?params.get('to'):'USDT';
const amount=Number(params.get('amount'))||100000;
const out=Number(params.get('out'))||1055;
const icons={RUB:'/assets/icons/rub.svg',USDT:'/assets/icons/usdt.svg',BTC:'/assets/icons/btc.svg',ETH:'/assets/icons/eth.svg'};
const decimals={RUB:2,USDT:2,BTC:8,ETH:6};
const networks={
  RUB:[['SBP','СБП · до 15 мин · 0 RUB'],['CARD','Банковская карта · до 15 мин · 0 RUB']],
  USDT:[['TRC20','TRC20 · 5–20 мин · 1 USDT'],['ERC20','ERC20 · 5–30 мин · 4 USDT']],
  BTC:[['BTC','Bitcoin · 10–40 мин · сеть BTC']],
  ETH:[['ERC20','Ethereum · 5–30 мин · ERC20'],['ARBITRUM','Arbitrum · 2–10 мин · L2']]
};
function fmt(v,t){return Number(v).toLocaleString('ru-RU',{minimumFractionDigits:t==='RUB'||t==='USDT'?2:0,maximumFractionDigits:decimals[t]})}
function icon(t){return `${basePath}${icons[t]}`}
function setText(sel,value){const el=document.querySelector(sel);if(el)el.textContent=value}
function setIcon(sel,t){const el=document.querySelector(sel);if(el){el.src=icon(t);el.alt=''}}
function fillSelect(select,ticker){
  if(!select)return;
  select.replaceChildren(new Option('Выберите сеть',''));
  for(const [value,label] of networks[ticker]) select.add(new Option(label,value));
}
setIcon('[data-order-from-icon]',from);setIcon('[data-order-to-icon]',to);
setText('[data-order-from-amount]',`${fmt(amount,from)} ${from}`);
setText('[data-order-to-amount]',`${fmt(out,to)} ${to}`);
setText('[data-order-rate]',`1 ${from} = ${fmt(out/amount,to)} ${to} · условия на 15 минут`);
const networkFrom=document.querySelector('[data-network-from]');
const networkTo=document.querySelector('[data-network-to]');
fillSelect(networkFrom,from);fillSelect(networkTo,to);
const addressLabel=document.querySelector('[data-address-label]');
const address=document.querySelector('[data-address-input]');
if(to==='RUB'){
  if(addressLabel)addressLabel.textContent='Реквизиты для получения RUB';
  if(address){address.placeholder='Телефон СБП или номер карты';address.classList.remove('mono')}
}else{
  if(addressLabel)addressLabel.textContent=`Адрес получения ${to}`;
  if(address){address.placeholder=`Введите адрес ${to}`;address.classList.add('mono')}
}
form?.addEventListener('input',e=>{if(e.target.matches('[aria-invalid="true"]'))e.target.removeAttribute('aria-invalid')});
form?.addEventListener('submit',e=>{
  e.preventDefault();
  const required=[...form.querySelectorAll('[required]')];
  const bad=required.find(x=>!x.checkValidity());
  if(bad){bad.setAttribute('aria-invalid','true');bad.focus();window.showToast?.('Проверьте обязательные поля');return}
  const id='VC-'+Date.now().toString().slice(-8);
  const pay=new URLSearchParams({id,from,to,amount:String(amount),out:String(out),networkFrom:networkFrom.value,networkTo:networkTo.value});
  const uuid=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2);
  location.href=`${basePath}/pay/?${pay.toString()}#t=demo-${uuid}`;
});
