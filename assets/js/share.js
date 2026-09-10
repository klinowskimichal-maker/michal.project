(function(){
'use strict';
const address=document.getElementById('siteAddress');
const site=address.value;
const status=document.getElementById('status');
const tell=message=>{status.textContent=message;};
const selectAddress=()=>{address.focus();address.select();};
async function copyLink(){
  try{await navigator.clipboard.writeText(site);tell('Link skopiowany. Wklej go do wiadomości lub posta.');}
  catch{selectAddress();tell('Zaznaczono adres — skopiuj go ręcznie.');}
}
document.getElementById('copyLink').addEventListener('click',copyLink);
document.getElementById('shareLink').addEventListener('click',async()=>{
  if(!navigator.share){await copyLink();return;}
  try{await navigator.share({title:'PSKŁ — Klasyczne łodzie',url:site});}
  catch(error){if(error.name!=='AbortError')await copyLink();}
});
document.getElementById('copyLogo').addEventListener('click',async()=>{
  const html='<a href="'+site+'"><img src="'+site+'assets/branding/logo-pskl.png" width="360" alt="PSKŁ — otwórz stronę stowarzyszenia" style="max-width:100%;height:auto;border:0"></a>';
  try{
    if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined')throw new Error('unsupported');
    await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([site],{type:'text/plain'})})]);
    tell('Skopiowano logo z linkiem. Wklej do edytora obsługującego formatowanie, np. podpisu e-mail.');
  }catch{tell('Ta przeglądarka nie pozwala skopiować formatowanego logo. Pobierz klikalne logo HTML albo użyj przycisku „Kopiuj link”.');}
});
let installPrompt=null;
const installButton=document.getElementById('installApp');
const installed=()=>{
  installButton.textContent='PSKŁ jest dodane';installButton.disabled=true;
  document.getElementById('installState').textContent='PSKŁ jest otwarte jako aplikacja. Ikonę można odnaleźć na ekranie lub w menu aplikacji urządzenia.';
};
if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone)installed();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('appinstalled',()=>{installPrompt=null;installed();tell('PSKŁ zostało dodane do urządzenia.');});
installButton.addEventListener('click',async()=>{
  if(installPrompt){
    const prompt=installPrompt;installPrompt=null;
    try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='dismissed')tell('Możesz dodać ikonę później z menu przeglądarki.');}
    catch{showHelp();}
  }else showHelp();
});
function showHelp(){
  document.getElementById('install-title').focus({preventScroll:true});
  document.getElementById('installHelp').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  tell('Wybierz poniżej instrukcję dla swojego telefonu lub komputera.');
}
})();
