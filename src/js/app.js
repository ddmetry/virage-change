const root=document.documentElement;
const stored=localStorage.getItem('virage-theme');
if(stored)root.dataset.theme=stored;
const themeBtn=document.querySelector('[data-theme-toggle]');
themeBtn?.addEventListener('click',()=>{const next=root.dataset.theme==='light'?'dark':'light';root.dataset.theme=next;localStorage.setItem('virage-theme',next)});
const header=document.querySelector('[data-header]');
const updateHeader=()=>header?.classList.toggle('is-scrolled',scrollY>24);updateHeader();addEventListener('scroll',updateHeader,{passive:true});
const menuBtn=document.querySelector('[data-menu-toggle]'),sheet=document.querySelector('[data-mobile-sheet]');
menuBtn?.addEventListener('click',()=>{const open=sheet.hasAttribute('hidden');sheet.toggleAttribute('hidden',!open);menuBtn.setAttribute('aria-expanded',String(open))});
sheet?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{sheet.hidden=true;menuBtn?.setAttribute('aria-expanded','false')}));
const current=document.body.dataset.nav,nav=document.querySelector('.main-nav'),active=nav?.querySelector(`[data-nav="${current}"]`);
if(active){active.classList.add('is-active');const setIndicator=()=>{nav.style.setProperty('--nav-x',`${active.offsetLeft-4}px`);nav.querySelector('.nav-indicator')?.style.setProperty('width',`${active.offsetWidth}px`)};setIndicator();addEventListener('resize',setIndicator)}
document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
const toast=document.querySelector('[data-toast]');let toastTimer;
window.showToast=(text='Готово')=>{if(!toast)return;toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2400)};
async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true}catch{}
  try{const ta=document.createElement('textarea');ta.value=value;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch{return false}
}
document.addEventListener('click',async e=>{const btn=e.target.closest('[data-copy]');if(!btn)return;const value=btn.dataset.copy||document.querySelector(btn.dataset.copyTarget||'')?.textContent||'';const ok=await copyText(value);const label=btn.querySelector('[data-copy-label]');if(ok){if(label)label.textContent='Скопировано';window.showToast('Скопировано');setTimeout(()=>{if(label)label.textContent='Копировать'},1200)}else window.showToast('Не удалось скопировать')});
document.querySelectorAll('form:not([data-order-form])').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();window.showToast('Функция доступна только в серверной версии')}));
