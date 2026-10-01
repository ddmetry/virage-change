const amountIn=document.querySelector('[data-amount-in]');
const amountOut=document.querySelector('[data-amount-out]');
const fromTicker=document.querySelector('[data-from-ticker]');
const toTicker=document.querySelector('[data-to-ticker]');
const fromIcon=document.querySelector('[data-from-icon]');
const toIcon=document.querySelector('[data-to-icon]');
const rateText=document.querySelector('[data-rate]');
const continueLink=document.querySelector('[data-exchange-continue]');
const modal=document.querySelector('[data-currency-modal]');
const search=document.querySelector('[data-currency-search]');
const currencyOptions=[...document.querySelectorAll('[data-currency]')];
const modeButtons=[...document.querySelectorAll('[data-seg] button')];
const basePath='__BASE_PATH__';

const currencies={
  RUB:{icon:'/assets/icons/rub.svg',price:0.01055,decimals:2,min:5000,defaultAmount:100000,name:'Российский рубль'},
  USDT:{icon:'/assets/icons/usdt.svg',price:1,decimals:2,min:10,defaultAmount:1000,name:'Tether'},
  BTC:{icon:'/assets/icons/btc.svg',price:64220,decimals:8,min:0.0001,defaultAmount:0.01,name:'Bitcoin'},
  ETH:{icon:'/assets/icons/eth.svg',price:2600,decimals:6,min:0.001,defaultAmount:0.25,name:'Ethereum'}
};

const state={from:'RUB',to:'USDT',mode:'fiat',activeSide:'from'};

function rate(){return currencies[state.from].price/currencies[state.to].price}
function parseAmount(value){return Number(String(value).replace(/\s/g,'').replace(',','.'))||0}
function fmt(value,ticker){
  const max=currencies[ticker].decimals;
  return Number(value).toLocaleString('ru-RU',{minimumFractionDigits:ticker==='USDT'||ticker==='RUB'?2:0,maximumFractionDigits:max});
}
function raw(value,ticker){return Number(value).toFixed(currencies[ticker].decimals).replace(/0+$/,'').replace(/\.$/,'')}
function iconPath(ticker){return `${basePath}${currencies[ticker].icon}`}

function updateOptionVisibility(){
  currencyOptions.forEach(btn=>{
    const code=btn.dataset.currency;
    btn.hidden=state.mode==='crypto'&&code==='RUB';
    btn.classList.toggle('is-selected',code===state[state.activeSide]);
  });
}

function render(){
  fromTicker.textContent=state.from;
  toTicker.textContent=state.to;
  fromIcon.src=iconPath(state.from);
  toIcon.src=iconPath(state.to);
  fromIcon.alt='';
  toIcon.alt='';
  const n=parseAmount(amountIn.value);
  const result=n*rate();
  amountOut.value=fmt(result,state.to);
  rateText.textContent=`1 ${state.from} = ${fmt(rate(),state.to)} ${state.to}`;
  const helper=document.querySelector('[data-from-helper]');
  if(helper) helper.textContent=`Минимум ${fmt(currencies[state.from].min,state.from)} ${state.from}`;
  if(continueLink){
    const params=new URLSearchParams({from:state.from,to:state.to,amount:raw(n,state.from),out:raw(result,state.to),mode:state.mode});
    continueLink.href=`${basePath}/order/?${params.toString()}`;
  }
  updateOptionVisibility();
}

function ensureMode(){
  if(state.mode==='crypto'){
    if(state.from==='RUB') state.from='BTC';
    if(state.to==='RUB'||state.to===state.from) state.to=state.from==='USDT'?'BTC':'USDT';
  }else{
    const fromRub=state.from==='RUB',toRub=state.to==='RUB';
    if(!fromRub&&!toRub) state.to='RUB';
    if(fromRub&&toRub) state.to='USDT';
  }
}

function selectCurrency(side,code){
  if(!currencies[code]) return;
  if(state.mode==='crypto'&&code==='RUB') return;
  const other=side==='from'?'to':'from';
  const previous=state[side];
  const oldFrom=state.from;
  if(code===state[other]) state[other]=previous;
  state[side]=code;
  ensureMode();
  if(state.from!==oldFrom) amountIn.value=String(currencies[state.from].defaultAmount);
  render();
  modal?.close();
}

amountIn?.addEventListener('input',render);

document.querySelector('[data-swap]')?.addEventListener('click',()=>{
  [state.from,state.to]=[state.to,state.from];
  const incoming=parseAmount(amountIn.value);
  const outgoing=parseAmount(amountOut.value);
  amountIn.value=raw(outgoing,state.from);
  amountOut.value=fmt(incoming,state.to);
  render();
});

modeButtons.forEach((button,index)=>button.addEventListener('click',()=>{
  state.mode=index===0?'fiat':'crypto';
  const oldFrom=state.from;
  modeButtons.forEach(x=>x.classList.remove('is-active'));
  button.classList.add('is-active');
  document.querySelector('[data-seg]')?.style.setProperty('--seg-x',index?'100%':'0%');
  ensureMode();
  if(state.from!==oldFrom) amountIn.value=String(currencies[state.from].defaultAmount);
  render();
}));

document.querySelectorAll('[data-open-currency]').forEach(button=>button.addEventListener('click',()=>{
  state.activeSide=button.dataset.side==='to'?'to':'from';
  if(search){search.value='';currencyOptions.forEach(x=>x.classList.remove('is-filtered-out'))}
  updateOptionVisibility();
  modal?.showModal();
  requestAnimationFrame(()=>search?.focus());
}));

currencyOptions.forEach(button=>button.addEventListener('click',()=>selectCurrency(state.activeSide,button.dataset.currency)));

search?.addEventListener('input',()=>{
  const q=search.value.trim().toLowerCase();
  currencyOptions.forEach(button=>{
    const hay=`${button.dataset.currency} ${button.textContent}`.toLowerCase();
    button.classList.toggle('is-filtered-out',q&&!hay.includes(q));
  });
});

document.querySelector('[data-close-modal]')?.addEventListener('click',()=>modal?.close());
modal?.addEventListener('click',event=>{if(event.target===modal) modal.close()});

render();
