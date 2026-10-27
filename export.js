(() => {
'use strict';
if (document.getElementById('lspe-root')) { document.getElementById('lspe-root').scrollIntoView(); return; }
const posts = new Map();
let maxPosts=250;
const targetReached=()=>posts.size>=maxPosts;
let running=false, cancel=false;
let scannedRounds=0;
const isShortened = t => /(?:…|\.\.\.)\s*(?:meer weergeven|see more|more)\s*$/i.test((t||'').trim());
const norm = s => (s||'').replace(/\s+/g,' ').trim();
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const isPostURL = href => /^https:\/\/(?:[a-z0-9-]+\.)*linkedin\.com\/(?:feed\/update\/|posts\/|pulse\/|article\/)/i.test(href||'');
const isLinkedInHost = h => h==='linkedin.com' || h.endsWith('.linkedin.com');
const absolute = href => {try {const u=new URL(href,location.origin); return isLinkedInHost(u.hostname) && u.protocol==='https:' ? u.href.split('?')[0] : ''; } catch {return '';} };
const visible = el => !!(el.getClientRects().length);
const PROFILE=/\/(?:in|company|school)\//i;
const noise=/^(?:\d+\s*(?:d|w|mnd|j|h|min|mo|yr|dagen?|weken?|maanden?|jaar)|zichtbaar voor iedereen|visible to anyone|status is (?:online|bereikbaar)|meer weergeven|see more|…more|\.\.\.more|opnieuw geplaatst)$/i;
function linesOf(el){return (el?.innerText||'').split(/\n+/).map(norm).filter(Boolean);}
function meaningful(el){
 const lines=linesOf(el).filter(x=>!noise.test(x)&&!/^\d+\s*(?:d|w|mnd|j|h)\s*[·•]?/i.test(x));
 return lines.filter(x=>x.length>=25).length;
}
function authorAnchors(){
 const scope=document.querySelector('main,[role="main"]')||document.body;
 return [...scope.querySelectorAll('a[href]')].filter(a=>visible(a)&&PROFILE.test(absolute(a.getAttribute('href'))));
}
function cards(){
 // Never stop at the first profile-link wrapper. We need the entire saved-post
 // row, which contains both the author/header and the separate commentary body.
 const anchors=authorAnchors(), found=[];
 for(const a of anchors){
   let candidates=[], e=a;
   for(let depth=0;depth<13 && e && e!==document.body;depth++,e=e.parentElement){
     if(!visible(e))continue;
     const t=norm(e.innerText);
     if(t.length>12000)break;
     const profileCount=[...e.querySelectorAll('a[href]')].filter(x=>PROFILE.test(absolute(x.getAttribute('href')))).length;
     if(profileCount>5)break;
     const quality=meaningful(e);
     const hasExpand=/meer weergeven|see more|…more/i.test(t);
     if(quality>=1 && t.length>=65){
       let score=quality*20 + (hasExpand?15:0) + (e.matches('li,article,[role="article"],[data-urn],[data-view-name]')?12:0);
       if(profileCount>=3)score-=25;
       if(t.length>2800)score-=30;
       // A sibling-based boundary is strongest signal for repeated saved post cards.
       const parent=e.parentElement;
       if(parent && [...parent.children].filter(x=>meaningful(x)>=1 && x.querySelector('a[href*="/in/"],a[href*="/company/"],a[href*="/school/"]')).length>=2)score+=45;
       candidates.push({e,score,depth});
     }
   }
   candidates.sort((x,y)=>y.score-x.score || y.depth-x.depth);
   if(candidates.length)found.push(candidates[0].e);
 }
 // Keep deepest meaningful candidates, not header-only candidates and not the whole list.
 const uniq=[...new Set(found)];
 return uniq.filter(e=>!uniq.some(other=>other!==e && e.contains(other)))
    .filter(e=>meaningful(e)>=1);
}
function diagnostics(){
 const all=cards();
 const profiles=document.querySelectorAll('a[href*="/in/"],a[href*="/company/"]').length;
 const main=document.querySelector('main,[role="main"]');
 const txt=norm(main?.innerText || document.body.innerText);
 return `Diagnostics: ${all.length} complete cards; ${profiles} profile links; main text ${txt.length} characters; URL ${location.pathname}. Card sample: ${norm(all[0]?.innerText).slice(0,240) || 'none'}`;
}
function parseCard(card){
 const links=[...card.querySelectorAll('a[href]')].filter(visible);
 const authorLink=links.find(a=>PROFILE.test(absolute(a.getAttribute('href'))));
 const profile=absolute(authorLink?.getAttribute('href')||'');
 let author=norm(authorLink?.innerText || authorLink?.getAttribute('aria-label') || '');
 // LinkedIn puts the accessibility label and relationship next to the name.
 // Keep only the displayed name before these extra labels.
 const companyMatch=author.match(/^(.+?)\s+Bedrijf weergeven:/i);
 const profileMatch=author.match(/^(.+?)\s+Profiel van\s+.+?\s+weergeven(?:\s*[•·]\s*.*)?$/i);
 author=norm(companyMatch?.[1] || profileMatch?.[1] || author)
   .replace(/\s+[•·]\s*(?:[123]e\+?|[123](?:st|nd|rd)\+?)$/i,'')
   .replace(/\s+Profiel van\s+.*$/i,'')
   .replace(/\s+Bedrijf weergeven:.*$/i,'');
 if(!author || /status is|^\d+ (?:d|w|mnd|j)/i.test(author)){
   const label=[...card.querySelectorAll('strong,span,a')].filter(visible)
     .map(x=>norm(x.innerText)).find(x=>x.length>=4 && x.length<90 && !noise.test(x) && !/status is|zichtbaar voor/i.test(x));
   author=norm((label||'').split(/\s+Profiel van\s+|\s+Bedrijf weergeven:/i)[0]);
 }
 const texts=[...card.querySelectorAll('[class*="commentary"],[class*="break-words"],[class*="attributed-text"],[class*="update-components-text"],p,[data-test-id*="commentary"],[dir="ltr"]')]
  .filter(visible).map(el=>norm(el.innerText)).filter(t=>t.length>=25&&!noise.test(t));
 const rawLines=linesOf(card);
 const cleanLines=rawLines.filter(t=>t.length>=25&&!noise.test(t)&&t!==author&&!/^(?:opnieuw geplaatst van|reposted by)\s/i.test(t));
 // Text element may be buried in a generic div; fall back to substantial lines
 // below the author/header, never to timestamps or presence labels.
 let content=texts.sort((x,y)=>y.length-x.length)[0]||'';
 if(!content || /^(?:\d+\s*(?:d|w|mnd|j)|zichtbaar voor iedereen)/i.test(content))content=cleanLines.slice(0,12).join('\n');
 // The longest paragraph can be a nested header or all-card text: prefer
 // actual lines after the author when they are clearly different.
 if(content && author && content.startsWith(author) && cleanLines.length)content=cleanLines.join('\n');
 const rawUrn=card.getAttribute('data-urn')||card.querySelector('[data-urn]')?.getAttribute('data-urn')||'';
 const hrefs=links.map(a=>absolute(a.getAttribute('href')));
 let postLink=hrefs.find(isPostURL)||'';
 const activityFromData=(rawUrn+' '+[...card.attributes].map(a=>a.value).join(' ')).match(/urn:li:(?:activity|share):\d+/);
 if(!postLink && activityFromData)postLink='https://www.linkedin.com/feed/update/'+activityFromData[0];
 const urn=(postLink.match(/urn:li:(?:activity|share):\d+/)||[])[0]||activityFromData?.[0]||rawUrn;
 const image=[...card.querySelectorAll('img[src]')].find(i=>{const r=i.getBoundingClientRect();return r.width>=55 && r.height>=55 && !/profile|avatar/i.test(i.alt||'');});
 const timeNode=card.querySelector('time,[datetime]');
 const timeText=norm(timeNode?.getAttribute('datetime')||timeNode?.innerText||'');
 const candidateLines=linesOf(card);
 const when=timeText || candidateLines.map(x => x.match(/(?:^|[•·]\s*)(\d+\s*(?:s|min|h|d|w|mnd|j|mo|yr|sec|hour|day|week|month|year)s?)\b/i)?.[1] || '').find(Boolean) || ''; 
 if(!content || content.length<25 || !/[a-zA-ZÀ-ÿ]{3,}/.test(content))return null;
 return {author:author,profile_url:profile,text:content,post_url:postLink,image_url:image?.src||'',date_display:when,urn,text_possibly_truncated:isShortened(content),exported_at:new Date().toISOString()};
}
function collect(){let added=0;for(const card of cards()){
 const p=parseCard(card);if(!p)continue;
 const key=p.post_url || p.urn || [p.profile_url,p.text.slice(0,300)].join('|');
 const prev=posts.get(key);
 if(!prev && targetReached())break;
 if(!prev)added++;
 if(!prev || p.text.length>prev.text.length || (!prev.post_url && !!p.post_url))posts.set(key,p);
 }update();return added;}
function update(msg=''){start.textContent=posts.size ? 'Continue collecting' : 'Start collecting';count.textContent=`${posts.size} / ${maxPosts} posts collected`;progress.style.width=Math.min(100,posts.size/maxPosts*100)+'%'; const vals=[...posts.values()]; const missing=vals.filter(x=>!x.post_url).length; const shortened=vals.filter(x=>x.text_possibly_truncated).length; quality.textContent=`${vals.length-missing} with post link · ${shortened} possibly truncated · ${scannedRounds} scroll rounds`; if(msg) info.textContent=msg;}
function download(format){if(!posts.size){update('No posts found. Try scrolling manually first.');return;}
 const rows=[...posts.values()];let data,mime,ext;
 if(format==='json'){data=JSON.stringify(rows,null,2);mime='application/json';ext='json';}
 else {const cols=['author','profile_url','text','post_url','image_url','date_display','urn','text_possibly_truncated','exported_at'];const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,'\u0027$&').replace(/"/g,'""')+'"';data='\ufeff'+cols.join(';')+'\r\n'+rows.map(r=>cols.map(c=>cell(r[c])).join(';')).join('\r\n');mime='text/csv;charset=utf-8';ext='csv';}
 const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`linkedin-saved-posts-${new Date().toISOString().slice(0,10)}.${ext}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function scrollContainers(){return [...document.querySelectorAll('main,main *,[role="main"],body,html')].filter(el=>{const s=getComputedStyle(el);return el.scrollHeight>el.clientHeight+120 && ((/auto|scroll/.test(s.overflowY))||el===document.body||el===document.documentElement);}).sort((a,b)=>b.clientHeight-a.clientHeight);}
async function expandVisible(){
 const root=document.querySelector('main,[role=main]')||document.body;
 const candidates=[...root.querySelectorAll('button,a,[role=button]')].filter(e=>visible(e)&&/^(?:…|\.\.)?\s*(?:meer weergeven|see more|more)\s*$/i.test(norm(e.innerText||e.getAttribute('aria-label'))));
 for(const button of candidates.slice(0,20)){if(cancel)break;try{button.click();await sleep(130);}catch{}}
}
async function scan(){if(running)return;running=true;cancel=false;start.disabled=true;stop.disabled=false;
 const limit=Number(limitSelect.value);maxPosts=readMax();if(expand.checked)await expandVisible();collect();let stalled=0;let last=-1;let i=0;
 while(!cancel && i<limit && !targetReached()){collect();if(targetReached())break;if(expand.checked){const more=[...document.querySelectorAll('main button,main a')].filter(e=>visible(e)&&/^(…|\.\.\.)?\s*(meer weergeven|see more|more)\s*$/i.test(norm(e.innerText)));for(const b of more.slice(0,12)){if(cancel)break;b.click();await sleep(100);}collect();}
 if(targetReached())break;const before=posts.size;const targets=scrollContainers();const firstCard=cards()[0];const container=targets.find(x=>firstCard && x.contains(firstCard) && x!==document.body && x!==document.documentElement) || document.scrollingElement;
 if(container)container.scrollTop+=Math.max(450,Math.floor(container.clientHeight*0.82));window.scrollBy(0,Math.max(450,window.innerHeight*0.8));await sleep(1200);collect();
 const newCount=posts.size;stalled=(newCount===before && newCount===last)?stalled+1:0;last=newCount;i++;scannedRounds++;update(`Scroll round ${i}/${limit} · no new posts: ${stalled}/8`);
 if(stalled>=8)break;
 }
 running=false;start.disabled=false;stop.disabled=true;update(cancel?'Stopped. You can export now.':targetReached()?`Limit of ${maxPosts} reached. This does NOT mean all saved posts were found. Raise 'Maximum number of posts' and click 'Continue collecting'.`:`Scan finished (${i} rounds). ${posts.size===0 ? diagnostics() : 'Please check the results.'}`);
}
const host=document.createElement('div');host.id='lspe-root';host.style.cssText='position:fixed;z-index:2147483647;right:20px;top:74px;width:365px;max-width:calc(100vw - 24px)';const shadow=host.attachShadow({mode:'open'});
shadow.innerHTML=`<style>
*{box-sizing:border-box}section{background:#101b2a;color:#f7fbff;padding:0;border:1px solid #30455d;border-radius:18px;font:13px/1.5 system-ui,Arial;box-shadow:0 18px 60px #0009;overflow:hidden}header{display:flex;align-items:center;gap:12px;background:linear-gradient(115deg,#173956,#102436);padding:18px 18px 15px}header .logo{width:42px;height:42px;border-radius:12px;background:#2ad4ae;display:grid;place-items:center;color:#092f31;font-weight:900;font-size:21px}h3{font-size:17px;margin:0}header p{margin:2px 0 0;color:#bad3e2;font-size:11px}.main{padding:18px}.stat{font-size:21px;font-weight:800;letter-spacing:-.5px}.muted{color:#aec1d1;font-size:12px}.meter{height:8px;margin:11px 0 16px;background:#293b4e;border-radius:12px;overflow:hidden}.meter span{display:block;background:#2ad4ae;width:0;height:100%;transition:width .2s}.field{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0}.field label{font-weight:650}input[type=number],select{background:#172b3e;color:white;border:1px solid #425c72;border-radius:9px;padding:8px 10px;font:inherit;width:120px}input[type=checkbox]{accent-color:#2ad4ae;width:16px;height:16px}.check{display:flex;gap:8px;align-items:center;color:#cfdfec;margin:12px 0 16px}.actions{display:flex;gap:8px;margin:8px 0}.actions button{flex:1}button{border:1px solid transparent;border-radius:10px;padding:11px 10px;cursor:pointer;background:#2ad4ae;color:#052f32;font:700 12px system-ui}button.secondary{background:#22374b;color:#f1f7fa;border-color:#37536a}button:disabled{opacity:.4;cursor:not-allowed}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #fff;outline-offset:2px}#x{margin-left:auto;background:transparent;color:#fff;font-size:19px;border:0;padding:1px 7px;align-self:flex-start}#info{padding:11px 12px;background:#192d3c;border-radius:10px;color:#c6dce9;font-size:12px;min-height:40px;overflow-wrap:anywhere}footer{border-top:1px solid #2b4357;padding:11px 18px;color:#94b3c8;font-size:11px}small{font-size:11px;color:#a7bac9}button:hover:not(:disabled){filter:brightness(1.11)}
</style><section><header><div class="logo">S↓</div><div><h3>Saved Posts Exporter</h3><p>LinkedIn · local export · v1.5.0</p></div><button id="x" aria-label="Close">×</button></header><div class="main"><div class="stat" id="count">0 / 250 posts collected</div><div class="muted">Unique saved posts</div><div class="muted" id="quality" aria-live="polite">0 with post link · 0 possibly truncated · 0 scroll rounds</div><div class="meter"><span id="progress"></span></div><div class="field"><label for="max">Maximum number of posts</label><input id="max" type="number" min="1" max="10000" step="1" value="250" aria-label="Maximum number of posts"></div><div class="field"><label for="limit">Max. scroll rounds</label><select id="limit"><option value="40">40</option><option value="100" selected>100</option><option value="250">250</option><option value="500">500</option></select></div><label class="check"><input id="expand" type="checkbox" checked> Expand long posts</label><div class="actions"><button id="start">Start collecting</button><button class="secondary" id="stop" disabled>Stop</button></div><div class="actions"><button class="secondary" id="once">Scan current page</button><button class="secondary" id="diagnose">Diagnostics</button></div><div class="actions"><button id="csv">Export CSV</button><button id="json">Export JSON</button></div><div class="actions"><button class="secondary" id="reset">New collection</button></div><p id="info" role="status">Ready to collect. Click Start collecting.</p><small>The limit is only a stopping point, not a count of all your saved posts. Raise the maximum and click Continue collecting. Collected posts are kept as long as this panel stays open.</small></div><footer>No uploads, external servers or account passwords.</footer></section>`;
document.documentElement.append(host);
const $=id=>shadow.getElementById(id);const count=$('count'),progress=$('progress'),quality=$('quality'),info=$('info'),start=$('start'),stop=$('stop'),expand=$('expand'),limitSelect=$('limit');
function readMax(){const n=Number($('max').value);return Math.min(10000,Math.max(1,Number.isFinite(n)?Math.floor(n):250));}
$('max').addEventListener('input',()=>{maxPosts=readMax();update(posts.size>=maxPosts ? 'Limit reached. Raise the maximum to continue.' : 'Maximum updated. Click Continue collecting to proceed.');});
$('reset').onclick=()=>{if(running){update('Stop the active scan first.');return;}if(!confirm('Clear all collected posts from this panel? Export first if you want to keep them.'))return;posts.clear();scannedRounds=0;update('New collection started.');};
$('diagnose').onclick=()=>update(diagnostics());$('x').onclick=()=>{cancel=true;host.remove()};$('once').onclick=async()=>{maxPosts=readMax();if(expand.checked)await expandVisible();collect();if(!posts.size)update(diagnostics());else update('Current page processed.');};$('csv').onclick=()=>{download('csv')};$('json').onclick=()=>{download('json')};start.onclick=()=>{scan().catch(e=>{running=false;start.disabled=false;stop.disabled=true;update('Error: '+e.message)})};stop.onclick=()=>{cancel=true;update('Stopping scan...')};collect();
})();
