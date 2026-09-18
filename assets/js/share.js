(function(){
'use strict';
const site='https://klinowskimichal-maker.github.io/michal.project/udostepnij.html?v=56';
const status=document.getElementById('status');
const isEN=window.PSKL_LANG==='en';
const tr=(pl,en)=>isEN?en:pl;
const tell=message=>{status.textContent=message;};
async function copyLink(){
  try{await navigator.clipboard.writeText(site);tell(tr('Link skopiowany.','Link copied.'));}
  catch{tell(tr('Nie udało się skopiować linku.','The link could not be copied.'));}
}
document.getElementById('copyLink').addEventListener('click',copyLink);
document.getElementById('shareLink').addEventListener('click',async()=>{
  if(!navigator.share){await copyLink();return;}
  try{await navigator.share({title:'PSKL',url:site});}
  catch(error){if(error.name!=='AbortError')await copyLink();}
});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
let installPrompt=null;
const installButton=document.getElementById('installApp');
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('appinstalled',()=>{installPrompt=null;tell(tr('PSKL zostało zainstalowane.','PSKL has been installed.'));});
installButton.addEventListener('click',async()=>{
  if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone){
    tell(tr('Usuń poprzednią instalację PSKL. Następnie otwórz ten link w Chrome i zainstaluj ponownie.','Remove the previous PSKL installation. Then open this link in Chrome and install it again.'));
    return;
  }
  if(installPrompt){
    const prompt=installPrompt;installPrompt=null;
    try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='dismissed')tell(tr('Instalacja została anulowana.','Installation cancelled.'));}
    catch{tell(tr('W Chrome wybierz menu i opcję „Dodaj do ekranu głównego”.','In Chrome, open the menu and choose Add to Home screen.'));}
  }else tell(tr('W Chrome wybierz menu i opcję „Dodaj do ekranu głównego”.','In Chrome, open the menu and choose Add to Home screen.'));
});
})();
