const featureConfig = {
  message: { icon:"💗", eyebrow:"PORUKE", title:"Napiši mi poruku", description:"Ljubavna, poslovna, izvinjenje, čestitka ili odgovor na poruku.", styles:["Nježna","Direktna","Romantična","Smiješna","Formalna"] },
  song: { icon:"🎵", eyebrow:"PJESME", title:"Napravi mi pjesmu", description:"Opiši osobu, priču i emociju. MOJ AI će napraviti tekst pjesme.", styles:["Balkan","Pop","Rap","Tužna","Vesela","Turski stil"] },
  cv: { icon:"📄", eyebrow:"POSAO", title:"CV / Molba za posao", description:"Pretvori svoje iskustvo u profesionalan tekst za CV ili prijavu.", styles:["CV opis","Molba","Email prijava","Kratko","Profesionalno"] },
  translate: { icon:"✉️", eyebrow:"PREVOD", title:"Objasni mi pismo", description:"Zalijepi tekst pisma i dobićeš jednostavno objašnjenje na svom jeziku.", styles:["Jednostavno","Detaljno","Prevedi","Šta trebam uraditi"] },
  social: { icon:"📱", eyebrow:"DRUŠTVENE MREŽE", title:"TikTok / Instagram", description:"Napravi opis, hook, CTA i hashtagove za objavu.", styles:["TikTok","Instagram","YouTube","Viralno","Profesionalno"] },
  love: { icon:"❤️", eyebrow:"LJUBAV", title:"Ljubavni savjet", description:"Opiši situaciju ili poruku koju si dobio i dobićeš prijedlog odgovora.", styles:["Smireno","Flert","Direktno","Pomirljivo","Samouvjereno"] }
};

let currentType = "message";
let selectedStyle = "";
let currentResult = null;

const $ = id => document.getElementById(id);
const views = {
  home: $("homeView"),
  generator: $("generatorView"),
  history: $("historyView"),
  favorites: $("favoritesView"),
  profile: $("profileView")
};

function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function getUsage(){
  const data = JSON.parse(localStorage.getItem("mojai_usage") || "{}");
  return data.date === todayKey() ? data.count : 0;
}
function setUsage(count){
  localStorage.setItem("mojai_usage", JSON.stringify({date:todayKey(), count}));
  renderUsage();
}
function renderUsage(){
  const used = getUsage(), left = Math.max(0, 5-used);
  $("usageLabel").textContent = `${left} besplatnih generisanja danas`;
  $("usageBar").style.width = `${(left/5)*100}%`;
}

function nav(name){
  Object.values(views).forEach(v=>v.classList.remove("active"));
  views[name].classList.add("active");
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active", b.dataset.nav===name));
  if(name==="history") renderHistory();
  if(name==="favorites") renderFavorites();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.nav)));
document.querySelectorAll(".feature").forEach(b=>b.addEventListener("click",()=>openGenerator(b.dataset.type)));
$("backButton").addEventListener("click",()=>nav("home"));

function openGenerator(type){
  currentType=type;
  const c=featureConfig[type];
  $("generatorIcon").textContent=c.icon;
  $("generatorEyebrow").textContent=c.eyebrow;
  $("generatorTitle").textContent=c.title;
  $("generatorDescription").textContent=c.description;
  $("promptInput").value="";
  $("charCount").textContent="0";
  $("resultCard").classList.add("hidden");
  currentResult=null;
  selectedStyle=c.styles[0];
  $("styleChips").innerHTML=c.styles.map((s,i)=>`<button class="chip ${i===0?"active":""}" data-style="${s}">${s}</button>`).join("");
  document.querySelectorAll(".chip").forEach(ch=>ch.addEventListener("click",()=>{
    document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
    ch.classList.add("active"); selectedStyle=ch.dataset.style;
  }));
  nav("generator");
}

$("promptInput").addEventListener("input",e=>$("charCount").textContent=e.target.value.length);

function localGenerate(type, prompt, style){
  const p = prompt.trim();
  if(type==="message"){
    return `${style} verzija:\n\n${style==="Formalna" ? "Poštovani," : "Hej,"}\n\n${p ? `Želim ti reći nešto vezano za ovo: ${p}` : "Želim ti napisati nešto iskreno."}\n\nNeke stvari je teško reći savršeno, ali mi je važno da znaš da govorim iskreno i od srca. Nadam se da ćemo se razumjeti i da ćemo sve riješiti na najbolji način.`;
  }
  if(type==="song"){
    return `[STROFA 1]\n${p || "Noć nosi priču koju srce pamti,"}\nsvaki korak vodi tamo gdje si ti.\nI kada šutim, sve u meni govori,\nono što je pravo nikad ne izgori.\n\n[REFREN]\nJoš te nosim ispod kože,\ni kad kažu da ne može.\nNeka cijeli svijet se sruši,\nti si pjesma u mojoj duši.\n\n[STROFA 2]\nVrijeme prolazi, ali trag ostaje,\nsrce kad zavoli ne pita koliko traje.\n\nStil: ${style}`;
  }
  if(type==="cv"){
    return `Profesionalna verzija (${style}):\n\nMotivisana i odgovorna osoba sa praktičnim iskustvom i snažnom radnom etikom. Brzo učim, pouzdan/a sam u izvršavanju zadataka i dobro funkcionišem samostalno i u timu.\n\nNa osnovu unosa:\n${p || "Dodaj svoje iskustvo, poziciju i glavne vještine."}\n\nSpreman/na sam da svoje iskustvo i energiju doprinesem novom timu i daljem profesionalnom razvoju.`;
  }
  if(type==="translate"){
    return `Jednostavno objašnjenje:\n\n${p || "Zalijepi tekst pisma ovdje."}\n\nOvaj tekst treba prevesti/objasniti običnim jezikom. U pravoj AI verziji aplikacije ovdje ćeš dobiti: 1) šta pismo znači, 2) šta se od tebe traži i 3) do kojeg roka treba reagovati.`;
  }
  if(type==="social"){
    return `🔥 HOOK:\nNemoj preskočiti ovo — možda je baš za tebe.\n\n📱 OPIS:\n${p || "Ovdje ide tvoja tema."}\nNapravili smo nešto posebno. Ako ti se sviđa, sačuvaj, podijeli i napiši mišljenje u komentar.\n\n#balkan #fyp #viral #tiktokbalkan #mojai\n\nStil: ${style}`;
  }
  return `Prijedlog odgovora (${style}):\n\n„Razumijem šta želiš reći. Ne želim praviti dramu, ali želim biti iskren/a. ${p ? "Što se tiče toga što si napisao/la — " + p : ""} hajde da razgovaramo normalno i vidimo gdje stvarno stojimo.“\n\nSavjet: odgovori kratko, bez previše objašnjavanja i nemoj slati više poruka zaredom.`;
}

$("generateButton").addEventListener("click", async ()=>{
  const prompt=$("promptInput").value.trim();
  if(!prompt){ $("promptInput").focus(); return; }
  if(getUsage()>=5){ openPro(); return; }

  const btn=$("generateButton");
  btn.disabled=true; btn.textContent="Generišem...";
  try{
    // Kada dodamo backend, frontend će prvo pokušati pravi AI endpoint.
    let text="";
    try{
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:currentType,prompt,style:selectedStyle})});
      if(res.ok){
        const data=await res.json();
        text=data.text || "";
      }
    }catch(e){}
    if(!text) text=localGenerate(currentType,prompt,selectedStyle);

    currentResult={id:Date.now(),type:currentType,style:selectedStyle,prompt,text,createdAt:new Date().toISOString(),favorite:false};
    $("resultText").textContent=text;
    $("resultCard").classList.remove("hidden");
    saveHistory(currentResult);
    setUsage(getUsage()+1);
    $("favoriteButton").classList.remove("active");
    $("favoriteButton").textContent="♡";
    setTimeout(()=>$("resultCard").scrollIntoView({behavior:"smooth",block:"start"}),50);
  }finally{
    btn.disabled=false; btn.textContent="✨ GENERIŠI";
  }
});

function getHistory(){ return JSON.parse(localStorage.getItem("mojai_history")||"[]"); }
function saveHistory(item){
  const all=getHistory();
  all.unshift(item);
  localStorage.setItem("mojai_history",JSON.stringify(all.slice(0,30)));
}
function updateItem(id, patch){
  const all=getHistory().map(x=>x.id===id?{...x,...patch}:x);
  localStorage.setItem("mojai_history",JSON.stringify(all));
}
function renderHistory(){
  const all=getHistory();
  $("historyList").innerHTML=all.length?all.map(renderItem).join(""):`<div class="empty">Još nema generisanih tekstova.</div>`;
}
function renderFavorites(){
  const all=getHistory().filter(x=>x.favorite);
  $("favoritesList").innerHTML=all.length?all.map(renderItem).join(""):`<div class="empty">Još ništa nisi sačuvao/la.</div>`;
}
function renderItem(x){
  const date=new Date(x.createdAt).toLocaleString("bs-BA",{dateStyle:"short",timeStyle:"short"});
  return `<article class="history-item"><div class="history-meta"><span>${featureConfig[x.type]?.icon||"✨"} ${featureConfig[x.type]?.title||x.type}</span><span>${date}</span></div><b>${escapeHtml(x.prompt)}</b><p>${escapeHtml(x.text)}</p></article>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

$("copyButton").addEventListener("click",async()=>{
  if(!currentResult)return;
  await navigator.clipboard.writeText(currentResult.text);
  $("copyButton").textContent="✓ Kopirano";
  setTimeout(()=>$("copyButton").textContent="📋 Kopiraj",1400);
});
$("shareButton").addEventListener("click",async()=>{
  if(!currentResult)return;
  if(navigator.share) await navigator.share({title:"MOJ AI",text:currentResult.text});
  else await navigator.clipboard.writeText(currentResult.text);
});
$("favoriteButton").addEventListener("click",()=>{
  if(!currentResult)return;
  currentResult.favorite=!currentResult.favorite;
  updateItem(currentResult.id,{favorite:currentResult.favorite});
  $("favoriteButton").classList.toggle("active",currentResult.favorite);
  $("favoriteButton").textContent=currentResult.favorite?"♥":"♡";
});

function openPro(){ $("proModal").classList.remove("hidden"); }
function closePro(){ $("proModal").classList.add("hidden"); }
$("proButton").addEventListener("click",openPro);
$("profileProButton").addEventListener("click",openPro);
$("closeModal").addEventListener("click",closePro);
$("proModal").addEventListener("click",e=>{if(e.target.id==="proModal")closePro()});
$("fakeCheckout").addEventListener("click",()=>alert("Stripe checkout dodajemo u narednom koraku."));

renderUsage();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
