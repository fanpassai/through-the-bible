
(()=> {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='ttb_week3_final_v1';
let st={story:false,concepts:[],fills:[],place:[],connect:0,quiz:[],owned:[],tellback:'',deep:{},refs:[],marks:{},notes:{},questions:{},devotionalDone:false};
try{st=Object.assign(st,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const encourage=t=>{const e=$('#encourage');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1600)};
$$('[data-go]').forEach(b=>b.onclick=()=>$(b.dataset.go)?.scrollIntoView({behavior:'smooth'}));

function progress(){
  let p=0;if(st.story)p+=8;p+=Math.min(5,st.refs.length)*1.5;p+=st.concepts.length*3;
  p+=st.fills.filter(Boolean).length*2;if(st.place.length===6)p+=14;p+=Math.min(3,st.connect)*6;
  p+=Math.min(5,st.quiz.length)*3;p+=st.owned.length*2;if((st.tellback||'').trim().split(/\s+/).filter(Boolean).length>=15)p+=7;
  if(st.devotionalDone)p+=5;p=Math.min(100,Math.round(p));$('#progressBar').style.width=p+'%';$('#progressLabel').textContent=p+'% COMPLETE';return p
} progress();

addEventListener('scroll',()=>{const y=scrollY;const hero=$('.hero-media');const copy=$('.parallax-copy');if(hero&&y<innerHeight*1.2){hero.style.transform=`scale(1.035) translateY(${Math.min(22,y*.05)}px)`;copy.style.transform=`translateY(${Math.min(18,y*.03)}px)`}}, {passive:true});

$('#storyCheckpoint').onclick=()=>{st.story=true;save();progress();$('#storyCheckpoint').innerHTML='STORY LOCKED <span>✓</span>';encourage('Good. You have the story.');};

// VISUAL STORY — image-led, no dots
const storyStages=[
 {title:'Humanity gathered at Babel.',body:'One people. One place. One project. “Let us make a name for ourselves.”',mark:'BABEL',img:'https://images.unsplash.com/photo-1473642676276-2d4ab561542e?auto=format&fit=crop&w=1800&q=86'},
 {title:'The nations scattered.',body:'The human project fractures. People spread outward across the earth.',mark:'SCATTERING',img:'https://images.unsplash.com/photo-1680110797102-a12a3596fb7a?auto=format&fit=crop&w=1800&q=86'},
 {title:'Then God called one man.',body:'The story narrows to Abram. One man becomes the next major movement in God’s unfolding plan.',mark:'ABRAM',img:'https://images.unsplash.com/photo-1514364978092-88ff32485504?auto=format&fit=crop&w=1800&q=86'},
 {title:'But the purpose stayed global.',body:'From one man, God promises blessing that reaches all the families of the earth.',mark:'ALL FAMILIES',img:'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1800&q=86'}
];
let bs=0;
function renderStoryStage(){
 const s=storyStages[bs];$('#babelStageCount').textContent=(bs+1)+' / 4';$('#babelTitle').textContent=s.title;$('#babelBody').textContent=s.body;$('#storyStageMark').textContent=s.mark;
 const bg=$('#storySceneBg');bg.style.backgroundImage=`url("${s.img}")`;bg.style.transform='scale(1.06)';setTimeout(()=>bg.style.transform='scale(1.02)',80);
 if(bs===3)$('#babelNext').innerHTML='CONTINUE THE STORY <span>→</span>';
}
renderStoryStage();
$('#babelNext').onclick=()=>{if(bs<3){bs++;renderStoryStage();if(bs===3)encourage('One family. Worldwide purpose.')}else{$('#promiseConcept').scrollIntoView({behavior:'smooth'})}};

// Promise images
const conceptData={
 land:['LAND — A PLACE PROMISED','God promises a real place. The story is not floating in abstraction; covenant, family, inheritance, and history unfold somewhere.'],
 seed:['SEED — A FAMILY MULTIPLIED','The promise moves from one man into a family line. The stars become a visual memory handle: one becomes many.'],
 blessing:['BLESSING — A HORIZON BEYOND THE FAMILY','The promise never terminates on Abraham. God keeps the nations in view from the beginning.']
};
$$('.promise-panel').forEach(p=>p.onclick=()=>{
 const k=p.dataset.concept;$$('.promise-panel').forEach(x=>x.classList.toggle('active',x===p));
 if(!st.concepts.includes(k))st.concepts.push(k);save();progress();
 $('#conceptRevealTitle').textContent=conceptData[k][0];$('#conceptRevealText').textContent=conceptData[k][1];
 encourage(st.concepts.length===3?'Land. Seed. Blessing. Keep those three.':'You just made one part visible.');
});

// Fill
const fills=[
 ['After Babel, God calls a man named…','Abram','Genesis 12 begins with his original name.','Abram becomes the great narrative turn after Babel.'],
 ['God promises Abram Land, Seed, and…','Blessing','Genesis 12 repeats this word.','Blessing keeps the nations in view.'],
 ['All the ____ of the earth will be blessed through Abram.','families','Look at Genesis 12:3.','The horizon is global from the beginning.'],
 ['Genesis 15:6 says Abram ____ the LORD.','believed','Paul later returns to this verse.','Faith becomes a major New Testament connection.'],
 ['Abraham and Sarah’s promised son is…','Isaac','Genesis 21.','The family line continues through Isaac.'],
 ['Jacob is later renamed…','Israel','Genesis 32:28.','Israel is a person before Israel is a people.'],
 ['Jacob has ____ sons connected to the tribes.','twelve','Think of Israel’s tribes.','The family is becoming a people.'],
 ['The royal line later moves through the tribe of…','Judah','David’s tribe.','Judah becomes a thread toward David and Christ.'],
 ['Joseph’s story explains why the family ends Genesis in…','Egypt','Moses will later lead Israel out of this land.','Joseph is the bridge into Exodus.'],
 ['The promise to Abraham comes ____ the Mosaic Law.','before','Think chronology.','Paul uses this sequence in Galatians 3.']
];
let fi=Math.min(st.fills.filter(Boolean).length,9);
function renderFill(){const q=fills[fi];$('#fillCount').textContent=String(fi+1).padStart(2,'0')+' / 10';$('#fillNumber').textContent=String(fi+1).padStart(2,'0');$('#fillQuestion').textContent=q[0];$('#fillInput').value='';$('#fillHint').textContent='';$('#fillFeedback').textContent='';$('#fillProgress').style.width=(fi/10*100)+'%'}
renderFill();$('#hintBtn').onclick=()=>$('#fillHint').textContent='↳ '+fills[fi][2];$('#revealBtn').onclick=()=>{$('#fillInput').value=fills[fi][1];completeFill(true)};$('#fillInput').addEventListener('keydown',e=>{if(e.key==='Enter')completeFill(false)});
function completeFill(reveal){const q=fills[fi],ok=$('#fillInput').value.trim().toLowerCase()===q[1].toLowerCase();if(!ok&&!reveal){$('#fillFeedback').textContent='Almost. Use the nudge, then try again.';return}st.fills[fi]=true;save();progress();$('#fillFeedback').innerHTML='<b>Exactly.</b> '+q[3];$('#fillProgress').style.width=((fi+1)/10*100)+'%';encourage(fi===2?'You are seeing the promise.':'Keep this one.');setTimeout(()=>{if(fi<9){fi++;renderFill()}else $('#fillFeedback').innerHTML='<b>10 / 10 complete.</b> Your guided notes are locked in.'},900)}

// Place
const order=['Abraham','Isaac','Jacob / Israel','Twelve Sons','Joseph','Egypt'];let selected=null;
function renderPlace(){const placed=st.place;$$('.place-slot').forEach((s,i)=>{s.textContent=placed[i]||i+1;s.classList.toggle('filled',!!placed[i]);if(i===3&&placed[i]){const d=document.createElement('div');d.style.cssText='position:absolute;bottom:-16px;display:flex;gap:3px';d.innerHTML='<i style="width:4px;height:4px;border-radius:50%;background:#e1b34c"></i>'.repeat(12);s.appendChild(d)}});$$('.place-lines path').forEach((p,i)=>p.classList.toggle('on',placed.length>i));$$('#placeBank button').forEach(b=>b.style.display=placed.includes(b.dataset.piece)?'none':'block')}
renderPlace();$$('#placeBank button').forEach(b=>b.onclick=()=>{selected=b.dataset.piece;$$('#placeBank button').forEach(x=>x.classList.toggle('selected',x===b))});$$('.place-slot').forEach((s,i)=>s.onclick=()=>{if(!selected){encourage('Choose a scrambled card first.');return}if(i!==st.place.length){encourage('Use the next empty stop.');return}if(selected!==order[i]){encourage(['Start with the man God called.','Who was the promised son?','Whose name became Israel?','What grew out of Jacob’s family?','Who was sold into Egypt?','Where did Genesis end?'][i]);return}st.place.push(selected);selected=null;save();renderPlace();progress();if(st.place.length===6)setTimeout(()=>{$('#placeReward').classList.add('show');encourage('Now Exodus has an address.')},350)});$('#shufflePlace').onclick=()=>{st.place=[];save();renderPlace()};$('#closePlaceReward').onclick=()=>{$('#placeReward').classList.remove('show');$('#connectScene').scrollIntoView({behavior:'smooth'})};

// Connect — keep map on-screen and animate while answering
const bridges=[
 {q:'What survives Babel’s scattering?',opts:['God forgets the nations','God’s purpose for the nations continues through Abraham','The story becomes only about Abraham'],ans:1,aha:'Babel scatters the nations, but Genesis 12 immediately keeps the nations in view through Abraham.',paths:['thread1']},
 {q:'How does the blessing widen?',opts:['It reaches all nations','It stays only with one household','It ends before Israel'],ans:0,aha:'The promise is personal, familial, and global at the same time.',paths:['thread2','thread3']},
 {q:'Where does Paul ultimately focus the promised “seed”?',opts:['Egypt','Babylon','Christ'],ans:2,aha:'You found the thread: Abraham’s promise reaches forward into Christ.',paths:['thread4']}
];
function restoreConnect(){for(let i=0;i<st.connect;i++)bridges[i].paths.forEach(id=>$('#'+id)?.classList.add('live'));if(st.connect>=3){$('#threadCenter').textContent='✦';$('#threadCenter').classList.add('found')}}
restoreConnect();
function renderBridge(){const i=Math.min(st.connect,2),b=bridges[i];$('#connectProgress').textContent=`BRIDGE ${i+1} / 3`;$('#connectQuestion').textContent=b.q;$('#connectChoices').innerHTML=b.opts.map((o,j)=>`<button data-i="${j}">${o}</button>`).join('');$('#connectAha').textContent=st.connect>=3?'<b>Aha.</b> You found the thread: Abraham’s promise reaches forward into Christ.':'';$$('#connectChoices button').forEach(x=>x.onclick=()=>{if(+x.dataset.i!==b.ans){encourage('Read the nodes again. The relationship is visible on the map.');return}
  b.paths.forEach((id,idx)=>setTimeout(()=>$('#'+id).classList.add('live'),idx*220));
  $('#bridgeCard').classList.remove('animate-pulse');void $('#bridgeCard').offsetWidth;$('#bridgeCard').classList.add('animate-pulse');
  if(i===2){setTimeout(()=>{$('#threadCenter').textContent='✦';$('#threadCenter').classList.add('found')},650)}
  $('#connectAha').innerHTML='<b>Aha.</b> '+b.aha;if(st.connect<3)st.connect++;save();progress();encourage(i===2?'You found the thread.':'Watch the line form.');if(i<2)setTimeout(renderBridge,1550)
})}
renderBridge();

// Quiz
const quiz=[
 ['What immediately precedes Abram’s call?',['The Exodus','Babel and scattering','David’s kingdom'],1,'Babel is the immediate narrative background.'],
 ['What are the three promise handles?',['Land, Seed, Blessing','Temple, King, Prophet','Peace, Wealth, Power'],0,'Land · Seed · Blessing.'],
 ['Why does “Israel” first matter?',['It is Jacob’s new name','It is Egypt’s name','It is Moses’ title'],0,'Israel is a person before Israel is a people.'],
 ['What does Joseph explain?',['How David becomes king','Why the family is in Egypt','Why the Temple falls'],1,'Joseph is the bridge into Exodus.'],
 ['Why does Promise-before-Law matter?',['The Law created the promise','Paul says later Law does not nullify earlier promise','Abraham lived after Moses'],1,'Chronology helps explain Galatians 3.']
];
let qi=Math.min(st.quiz.length,4);
function renderQuiz(){const q=quiz[qi];$('#quizCount').textContent=String(qi+1).padStart(2,'0')+' / 05';$('#quizProgress').style.width=(qi/5*100)+'%';$('#quizQuestion').textContent=q[0];$('#quizOptions').innerHTML=q[1].map((o,j)=>`<button data-i="${j}">${o}</button>`).join('');$('#quizFeedback').textContent='';$$('#quizOptions button').forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===q[2];$('#quizFeedback').innerHTML=(ok?'<b>Correct.</b> ':'<b>Not quite.</b> ')+q[3];st.quiz[qi]=ok;save();progress();$('#quizProgress').style.width=((qi+1)/5*100)+'%';setTimeout(()=>{if(qi<4){qi++;renderQuiz()}else $('#quizResult').innerHTML=`<b>${st.quiz.filter(Boolean).length}/5</b><br>Knowledge check complete.`},900)})}
renderQuiz();

// Unlock
$$('.unlock-list button').forEach((b,i)=>{if(st.owned.includes(i)){b.classList.add('on');b.querySelector('i').textContent='✓'}b.onclick=()=>{if(!st.owned.includes(i))st.owned.push(i);b.classList.add('on');b.querySelector('i').textContent='✓';save();progress()}});
$('#tellback').value=st.tellback||'';$('#tellback').oninput=e=>{st.tellback=e.target.value;save();progress()};$('#claimWeek').onclick=()=>{if(st.owned.length<3||(st.tellback||'').trim().split(/\s+/).filter(Boolean).length<15){encourage('Own all three truths and tell the story in your own words first.');return}$('#unlockReveal').classList.add('show');encourage('Understanding unlocked.');setTimeout(()=>$('#deepScene').scrollIntoView({behavior:'smooth'}),1200)};

// Deep plan + reader
const deepDays=['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];let di=0;$('#deepDays').innerHTML=deepDays.map((d,i)=>`<button data-d="${i}"><b>${i+1}</b><br><small>${d}</small></button>`).join('');function setDay(i){di=i;$('#deepDayLabel').textContent=`DAY ${i+1} / 7`;$$('#deepDays button').forEach((b,j)=>b.classList.toggle('active',i===j))}setDay(0);$$('#deepDays button').forEach(b=>b.onclick=()=>setDay(+b.dataset.d));
if(st.devotionalDone){$('#devotionalCheck').textContent='✓';$('#devotionalCheck').style.background='#e3f4eb'}
const devotionalHTML=`
<div class="reader-kicker">WEEK 03 · DEVOTIONAL</div>
<h1>God’s Promise for the Whole World</h1>
<p class="reader-lede">Abraham’s story is not the story of God forgetting the nations. It is the story of God choosing one family through whom His blessing will move outward.</p>
<p>Genesis 12 comes immediately after Babel. Humanity has been scattered, but God’s purpose has not scattered with them. He calls <button class="hotspot" data-insight="abram">Abram</button> and gives him a <button class="hotspot" data-insight="promise">promise</button> with three memorable handles: land, seed, and blessing.</p>
<p>The striking part is the horizon of that promise: “all the families of the earth” remain in view. God’s plan narrows to one man without becoming a small plan. The family that grows from Abraham eventually becomes Israel, and Scripture keeps tracing the promise forward.</p>
<p>When Paul returns to Abraham in Galatians 3, he uses <button class="hotspot" data-insight="chronology">chronology</button> as part of his argument. The Law comes later. The earlier promise is not erased by what comes after it. Paul then focuses the promised <button class="hotspot" data-insight="seed">seed</button> ultimately in Christ.</p>
<p>That means the Abraham story is not a detached Old Testament episode. It is one of the great structural threads of Scripture: promise, family, nation, Messiah, blessing to the nations.</p>
<div class="reader-scriptures"><b>Scriptures to study</b>
<button data-ref="Genesis 12:1-3">Genesis 12:1–3</button>
<button data-ref="Genesis 15:1-6">Genesis 15:1–6</button>
<button data-ref="Genesis 22:18">Genesis 22:18</button>
<button data-ref="Galatians 3:8">Galatians 3:8</button>
<button data-ref="Galatians 3:16">Galatians 3:16</button>
</div>`;
function openReader(){const r=$('#readerOverlay');$('#readerBody').innerHTML=devotionalHTML;r.classList.add('open');r.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';bindReaderHotspots();r.scrollTop=0}
function closeReader(){const r=$('#readerOverlay');r.classList.remove('open');r.setAttribute('aria-hidden','true');document.body.style.overflow='';st.devotionalDone=true;save();progress();$('#devotionalCheck').textContent='✓';$('#devotionalCheck').style.background='#e3f4eb'}
$('#openDevotional').onclick=openReader;$('#startReading').onclick=openReader;$('#closeReader').onclick=closeReader;
$('#readerTextSize').onclick=()=>$('#readerBody').classList.toggle('large-type');
$('#readerOverlay').addEventListener('scroll',()=>{const r=$('#readerOverlay');const max=r.scrollHeight-r.clientHeight;$('#readerProgress').style.width=(max?Math.min(100,(r.scrollTop/max)*100):0)+'%'},{passive:true});
const insights={
 abram:['HISTORICAL CONTEXT','Abram','Abram is the name used when Genesis 12 begins. God later renames him Abraham in Genesis 17 as the covenant promises are expanded.','Genesis 12; 17'],
 promise:['DEFINITION','Promise','A committed word that creates expectation because of the character of the one who speaks. In this lesson, the emphasis is on what God says He will do.','Genesis 12:1–3'],
 chronology:['WHY THIS MATTERS','Chronology','Paul argues from sequence in Galatians 3: the Law comes later and does not cancel the earlier promise given to Abraham. Order helps interpretation.','Galatians 3:15–18'],
 seed:['CONNECTION','Seed','“Seed” can describe descendants collectively, yet Paul also draws the line ultimately to Christ in Galatians 3:16.','Genesis 22:18; Galatians 3:16']
};
function bindReaderHotspots(){
 $$('.hotspot',$('#readerBody')).forEach(b=>b.onclick=()=>openInsight(b.dataset.insight));
 $$('[data-ref]',$('#readerBody')).forEach(b=>b.onclick=()=>openSheet(b.dataset.ref))
}
function openInsight(k){const d=insights[k];$('#insightType').textContent=d[0];$('#insightTitle').textContent=d[1];$('#insightText').textContent=d[2];$('#insightRef').textContent=d[3];$('#insightBackdrop').classList.add('open');$('#insightSheet').classList.add('open')}
function closeInsight(){$('#insightBackdrop').classList.remove('open');$('#insightSheet').classList.remove('open')}$('#closeInsight').onclick=closeInsight;$('#insightBackdrop').onclick=closeInsight;

// Scripture reader
const staticTexts={
 'Genesis 11:9':['That is why it is called Babel, for there the LORD confused the language of the whole world, and from that place the LORD scattered them over the face of all the earth.'],
 'Genesis 12:1-3':['The LORD said to Abram, “Go from your country, your people and your father’s household to the land I will show you.”','“I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.”','“I will bless those who bless you, and whoever curses you I will curse; and all peoples on earth will be blessed through you.”'],
 'Genesis 12:3':['“I will bless those who bless you … and all peoples on earth will be blessed through you.”'],
 'Genesis 15:1-6':['The word of the LORD came to Abram in a vision: “Do not be afraid, Abram. I am your shield, your very great reward.”','Abram brought his childlessness before God.','God promised that one from Abram’s own body would be his heir.','God brought Abram outside and directed him to the stars.','“So shall your offspring be.”','Abram believed the LORD, and it was credited to him as righteousness.'],
 'Genesis 17:1-8':['God appeared to Abram and reaffirmed His covenant promises, including descendants, nations, kings, and the land.'],
 'Genesis 21:1-3':['The LORD was gracious to Sarah as He had said, and did for Sarah what He had promised.','Sarah conceived and bore a son to Abraham in his old age.','Abraham named the son Isaac.'],
 'Genesis 32:28':['“Your name will no longer be Jacob, but Israel…”'],
 'Genesis 45:4-8':['Joseph said to his brothers, “I am Joseph.”','He explained that God had sent him ahead to preserve life.'],
 'Genesis 50:19-26':['Joseph told his brothers that what they intended for evil, God intended for good to preserve many lives.','Joseph ended his life looking ahead to God’s promised visitation and the family’s future departure from Egypt.'],
 'Genesis 22:18':['“Through your offspring all nations on earth will be blessed…”'],
 'Galatians 3:8':['Scripture foresaw that God would justify the Gentiles by faith and announced the gospel in advance to Abraham: “All nations will be blessed through you.”'],
 'Galatians 3:16':['The promises were spoken to Abraham and to his seed. Paul points ultimately to Christ.']
};
let currentRef='',selectedVerse=null;
function openSheet(ref){currentRef=ref;if(!st.refs.includes(ref))st.refs.push(ref);save();progress();$('#sheetTitle').textContent=ref;$('#scriptureSheet').classList.add('open');$('#sheetBackdrop').classList.add('open');renderSheet('passage')}
function closeSheet(){$('#scriptureSheet').classList.remove('open');$('#sheetBackdrop').classList.remove('open')}
$('#closeSheet').onclick=closeSheet;$('#sheetBackdrop').onclick=closeSheet;
$$('.scripture-link').forEach(b=>b.onclick=()=>openSheet(b.dataset.ref));
$$('[data-sheet-tab]').forEach(b=>b.onclick=()=>{$$('[data-sheet-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSheet(b.dataset.sheetTab)});
function verseKey(i){return currentRef+'::'+i}
function renderSheet(tab){const box=$('#sheetContent');if(tab==='passage'){const vv=staticTexts[currentRef]||['This reference is part of the lesson. Add the full public-domain text in the production Bible data layer.'];box.innerHTML=`<div class="sheet-passage">${vv.map((v,i)=>`<span data-v="${i}"><sup>${i+1}</sup> ${v}</span>`).join('')}</div><div class="verse-actions"><button data-action="highlight">Highlight</button><button data-action="underline">Underline</button><button data-action="note">+ Note</button><button data-action="question">? Question</button><button data-action="connect">↗ Connect</button></div><div id="studyEditor"></div>`;$$('.sheet-passage span').forEach(s=>{const k=verseKey(+s.dataset.v),m=st.marks[k]||[];m.forEach(x=>s.classList.add('mark-'+x));s.onclick=()=>{$$('.sheet-passage span').forEach(x=>x.classList.remove('selected'));s.classList.add('selected');selectedVerse=+s.dataset.v;encourage('Verse selected. Choose a study action.')}});$$('[data-action]').forEach(b=>b.onclick=()=>handleStudyAction(b.dataset.action))}
 else if(tab==='where')box.innerHTML='<div class="margin-note"><b>Where am I?</b><br>Week 03 sits in Genesis after Babel and before Exodus. Abraham → Isaac → Jacob / Israel → Twelve Sons → Joseph → Egypt.</div>';
 else box.innerHTML='<div class="margin-note"><b>Study lenses</b><br><b>Observe:</b> What does the text say?<br><b>Notice:</b> What repeats or contrasts?<br><b>Ask:</b> What is unclear?<br><b>Place:</b> Where is this on the timeline?<br><b>Connect:</b> Where does this idea appear elsewhere?</div>'}
function handleStudyAction(action){if(action==='connect'){closeSheet();$('#connectScene').scrollIntoView({behavior:'smooth'});return}if(selectedVerse===null){encourage('Tap a verse first.');return}const k=verseKey(selectedVerse),verseEl=$(`.sheet-passage span[data-v="${selectedVerse}"]`);if(action==='highlight'||action==='underline'){const arr=st.marks[k]||[],idx=arr.indexOf(action);idx>=0?arr.splice(idx,1):arr.push(action);st.marks[k]=arr;save();verseEl.classList.toggle('mark-'+action);encourage(action==='highlight'?'Highlight saved.':'Underline saved.');return}const editor=$('#studyEditor'),field=action==='note'?'notes':'questions',label=action==='note'?'Note':'Question';editor.innerHTML=`<textarea class="study-note-input" id="sheetInput" placeholder="${label} on verse ${selectedVerse+1}…">${st[field][k]||''}</textarea><button class="cta dark" id="saveStudy">${label==='Note'?'SAVE NOTE':'SAVE QUESTION'}</button>`;$('#saveStudy').onclick=()=>{st[field][k]=$('#sheetInput').value;save();encourage(label+' saved.')}}
})();
