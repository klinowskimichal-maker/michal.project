(function(){
'use strict';
const site='https://klinowskimichal-maker.github.io/michal.project/udostepnij.html';
const status=document.getElementById('status');
const tell=message=>{status.textContent=message;};
async function copyLink(){
  try{await navigator.clipboard.writeText(site);tell('Link skopiowany.');}
  catch{tell('Nie udało się skopiować linku.');}
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
window.addEventListener('appinstalled',()=>{installPrompt=null;tell('PSKL zostało zainstalowane.');});
installButton.addEventListener('click',async()=>{
  if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone){
    tell('Usuń poprzednią instalację PSKL. Następnie otwórz ten link w Chrome i zainstaluj ponownie.');
    return;
  }
  if(installPrompt){
    const prompt=installPrompt;installPrompt=null;
    try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='dismissed')tell('Instalacja została anulowana.');}
    catch{tell('W Chrome wybierz menu i opcję „Dodaj do ekranu głównego”.');}
  }else tell('W Chrome wybierz menu i opcję „Dodaj do ekranu głównego”.');
});
})();
