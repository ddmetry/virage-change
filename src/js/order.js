const form=document.querySelector('[data-order-form]');
const basePath=location.pathname.startsWith('/virage-change/')?'/virage-change':'';
form?.addEventListener('submit',e=>{
  e.preventDefault();
  const req=[...form.querySelectorAll('[required]')];
  const bad=req.find(x=>!x.checkValidity());
  if(bad){
    bad.focus();
    bad.setAttribute('aria-invalid','true');
    window.showToast?.('Проверьте обязательные поля');
    return;
  }
  const id='VC-'+Date.now().toString().slice(-8);
  location.href=`${basePath}/pay/?id=${encodeURIComponent(id)}#t=demo-${crypto.randomUUID()}`;
});
