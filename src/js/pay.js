const basePath='__BASE_PATH__';
const params=new URLSearchParams(location.search);
const allowed=new Set(['RUB','USDT','BTC','ETH']);
const id=params.get('id')||'VC-DEMO';
const from=allowed.has(params.get('from'))?params.get('from'):'RUB';
const to=allowed.has(params.get('to'))?params.get('to'):'USDT';
const amount=Number(params.get('amount'))||100000;
const out=Number(params.get('out'))||1055;
const networkTo=params.get('networkTo')||'TRC20';
const decimals={RUB:2,USDT:2,BTC:8,ETH:6};
const icons={RUB:'/assets/icons/rub.svg',USDT:'/assets/icons/usdt.svg',BTC:'/assets/icons/btc.svg',ETH:'/assets/icons/eth.svg'};
function fmt(v,t){return Number(v).toLocaleString('ru-RU',{minimumFractionDigits:t==='RUB'||t==='USDT'?2:0,maximumFractionDigits:decimals[t]})}
function setText(sel,value){document.querySelectorAll(sel).forEach(el=>el.textContent=value)}
setText('[data-order-id]',id);
setText('[data-pay-amount]',`${fmt(amount,from)} ${from}`);
setText('[data-receive-amount]',`${fmt(out,to)} ${to}`);
setText('[data-receive-network]',networkTo);
const receiveIcon=document.querySelector('[data-receive-icon]');
if(receiveIcon){receiveIcon.src=`${basePath}${icons[to]}`;receiveIcon.alt=''}
const payRef=document.querySelector('#pay-ref');
if(payRef){
  payRef.textContent=from==='RUB'?'+7 900 000-00-00 · DEMO BANK':`DEMO-${from}-ADDRESS-NOT-FOR-PAYMENT`;
}
const payHint=document.querySelector('[data-pay-hint]');
if(payHint) payHint.textContent=from==='RUB'?'Демо-реквизиты. Не переводите реальные деньги.':'Демо-адрес. Не отправляйте на него реальные средства.';
const paid=document.querySelector('[data-paid]');
paid?.addEventListener('click',()=>{
  paid.disabled=true;
  paid.textContent='Отправлено на проверку';
  const status=document.querySelector('[data-status]');
  status?.classList.add('info');
  status?.querySelector('span')?.replaceChildren('Проверка оплаты');
  const steps=[...document.querySelectorAll('.progress-step')];
  steps[0]?.classList.remove('current');steps[0]?.classList.add('done');steps[1]?.classList.add('current');
  window.showToast?.('Статус заявки обновлён');
});
