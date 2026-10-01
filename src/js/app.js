const root=document.documentElement;
const stored=localStorage.getItem('virage-theme');
if(stored) root.dataset.theme=stored;
const themeBtn=document.querySelector('[data-theme-toggle]');
themeBtn?.addEventListener('click',()=>{const next=root.dataset.theme==='light'?'dark':'light';root.dataset.theme=next;localStorage.setItem('virage-theme',next)});
const header=document.querySelector('[data-header]');
const updateHeader=()=>header?.classList.toggle('is-scrolled',scrollY>24);updateHeader();addEventListener('scroll',updateHeader,{passive:true});
const menuBtn=document.querySelector('[data-menu-toggle]'), sheet=document.querySelector('[data-mobile-sheet]');
menuBtn?.addEventListener('click',()=>{const open=sheet.hasAttribute('hidden');sheet.toggleAttribute('hidden',!open);menuBtn.setAttribute('aria-expanded',String(open))});
const current=document.body.dataset.nav;const nav=document.querySelector('.main-nav');const active=nav?.querySelector(`[data-nav="${current}"]`);if(active){active.classList.add('is-active');const setIndicator=()=>{nav.style.setProperty('--nav-x',`${active.offsetLeft-4}px`);nav.querySelector('.nav-indicator')?.style.setProperty('width',`${active.offsetWidth}px`)};setIndicator();addEventListener('resize',setIndicator)}
const reveals=[...document.querySelectorAll('.reveal')];if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(el=>io.observe(el))}else reveals.forEach(el=>el.classList.add('is-visible'));
const toast=document.querySelector('[data-toast]');let toastTimer;window.showToast=(text='Готово')=>{if(!toast)return;toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2400)};
document.addEventListener('click',async e=>{const btn=e.target.closest('[data-copy]');if(!btn)return;const value=btn.dataset.copy||document.querySelector(btn.dataset.copyTarget||'')?.textContent||'';try{await navigator.clipboard.writeText(value);const label=btn.querySelector('[data-copy-label]');btn.classList.add('is-copied');if(label)label.textContent='Скопировано';showToast('Скопировано');setTimeout(()=>{btn.classList.remove('is-copied');if(label)label.textContent='Копировать'},1200)}catch{showToast('Не удалось скопировать')}});
