import type {DemoAccount} from '../content/demo-access';
let cleanup:(()=>void)|undefined;

function setup(){
  cleanup?.();
  const controller=new AbortController();
  const {signal}=controller;
  const roots=[...document.querySelectorAll<HTMLElement>('[data-demo-access]')];
  const disposers:(()=>void)[]=[];
  for(const root of roots){
    let accounts:DemoAccount[];
    try{accounts=JSON.parse(root.dataset.accounts??'[]') as DemoAccount[];}catch{continue;}
    const select=root.querySelector<HTMLSelectElement>('[data-demo-role]');
    const email=root.querySelector<HTMLInputElement>('[data-demo-value="email"]');
    const password=root.querySelector<HTMLInputElement>('[data-demo-value="password"]');
    const status=root.querySelector<HTMLElement>('[data-demo-copy-status]');
    const buttons=[...root.querySelectorAll<HTMLButtonElement>('[data-demo-copy]')];
    if(!accounts.length||!select||!email||!password||!status)continue;
    let revision=0;
    const render=()=>{
      const account=accounts[Number(select.value)];
      if(!account)return;
      revision++;
      email.value=account.email;password.value=account.password;
      status.textContent='';delete status.dataset.copyState;
    };
    select.addEventListener('change',render,{signal});
    for(const button of buttons){
      button.hidden=false;
      button.addEventListener('click',async()=>{
        const field=button.dataset.demoCopy==='email'?email:password;
        const value=field.value,startedAt=revision;
        button.disabled=true;status.textContent=root.dataset.copying??'';delete status.dataset.copyState;
        try{
          if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
          await navigator.clipboard.writeText(value);
          if(signal.aborted||!root.isConnected||revision!==startedAt)return;
          status.textContent=root.dataset.copied??'';status.dataset.copyState='success';
        }catch{
          if(signal.aborted||!root.isConnected||revision!==startedAt)return;
          field.focus();field.select();
          status.textContent=root.dataset.copyFailed??'';status.dataset.copyState='manual';
        }finally{if(!signal.aborted&&root.isConnected)button.disabled=false;}
      },{signal});
    }
    root.dataset.accessReady='true';
    render();
    disposers.push(()=>{revision++;delete root.dataset.accessReady;select.value='0';email.value=accounts[0].email;password.value=accounts[0].password;status.textContent='';delete status.dataset.copyState;for(const button of buttons){button.hidden=true;button.disabled=false;}});
  }
  cleanup=()=>{controller.abort();disposers.forEach(dispose=>dispose());};
}
function dispose(){cleanup?.();cleanup=undefined;}
setup();
document.addEventListener('astro:page-load',setup);
document.addEventListener('astro:before-swap',dispose);
window.addEventListener('pagehide',dispose);
window.addEventListener('pageshow',event=>{if(event.persisted)setup();});
