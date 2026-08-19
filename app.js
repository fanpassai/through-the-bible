
(()=> {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='ttb_week3_elite_v1';
let st={story:false,concepts:[],fills:[],place:[],connect:0,quiz:[],owned:[],tellback:'',deep:{},refs:[],marks:{},notes:{},questions:{}};
try{st=Object.assign(st,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const encourage=t=>{const e=$('#encourage');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1600)};
$$('[data-go]').forEach(b=>b.onclick=()=>$(b.dataset.go)?.scrollIntoView({behavior:'smooth'}));

function progress(){
  let p=0;if(st.story)p+=8;p+=Math.min(5,st.refs.length)*1.5;p+=st.concepts.length*3;
  p+=st.fills.filter(Boolean).length*2;if(st.place.length===6)p+=14;p+=Math.min(3,st.connect)*6;
  p+=Math.min(5,st.quiz.length)*3;p+=st.owned.length*2;if((st.tellback||'').trim().split(/\s+/).filter(Boolean).length>=15)p+=7;
  p=Math.min(100,Math.round(p));$('#progressBar').style.width=p+'%';$('#progressLabel').textContent=p+'% COMPLETE';return p
} progress();

addEventListener('scroll',()=>{const y=scrollY;const hero=$('.hero-media');const copy=$('.parallax-copy');if(hero&&y<innerHeight*1.2){hero.style.transform=`scale(1.035) translateY(${Math.min(22,y*.05)}px)`;copy.style.transform=`translateY(${Math.min(18,y*.03)}px)`}}, {passive:true});

$('#storyCheckpoint').onclick=()=>{st.story=true;save();progress();$('#storyCheckpoint').innerHTML='STORY LOCKED <span>✓</span>';encourage('Good. You have the story.');};

// BABEL
const stages=[
 ['Humanity gathered at Babel.','One people. One place. One project. “Let us make a name for ourselves.”'],
 ['The nations scattered.','The human project fractures. Language and people spread outward across the earth.'],
 ['Then God called one man.','The field collapses to one point: Abram. The story narrows.'],
 ['But the purpose stayed global.','From one man, God promises blessing that reaches all the families of the earth.']
];
let bs=0,c=$('#babelCanvas'),ctx=c.getContext('2d'),pts=[];
function makePts(){pts=Array.from({length:110},()=>({a:Math.random()*Math.PI*2,r:18+Math.random()*155,z:.6+Math.random()*.8}))}
function resize(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);draw()}
function draw(){
 ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle='#02141b';ctx.fillRect(0,0,innerWidth,innerHeight);
 const cx=innerWidth/2,cy=innerHeight*.44;
 pts.forEach((p,i)=>{let x,y;
  if(bs===0){const tower=(i/pts.length);x=cx+(Math.random()-.5)*(110*(1-tower*.5));y=cy+150-(tower*290)}
  else if(bs===1){x=cx+Math.cos(p.a)*p.r*1.8;y=cy+Math.sin(p.a)*p.r*1.35}
  else if(bs===2){x=cx+(Math.random()-.5)*5;y=cy+(Math.random()-.5)*5}
  else{x=cx+Math.cos(p.a)*p.r*2.1;y=cy+Math.sin(p.a)*p.r*1.45}
  ctx.beginPath();ctx.arc(x,y,bs===2?3:1.6*p.z,0,Math.PI*2);ctx.fillStyle=bs>=2?'#e1b34c':'#92d7d1';ctx.globalAlpha=.82;ctx.fill()
 });ctx.globalAlpha=1
}
makePts();resize();addEventListener('resize',resize);
$('#babelNext').onclick=()=>{bs=Math.min(3,bs+1);$('#babelStageCount').textContent=(bs+1)+' / 4';$('#babelTitle').textContent=stages[bs][0];$('#babelBody').textContent=stages[bs][1];draw();if(bs===3){$('#babelNext').innerHTML='CONTINUE THE STORY <span>→</span>';encourage('One family. Worldwide purpose.')}};

// CONCEPT
const conceptData={
 land:['LAND — A PLACE PROMISED','God promises a real place. The story is not floating in abstraction; covenant, family, inheritance, and history unfold somewhere.'],
 seed:['SEED — A FAMILY MULTIPLIED','The promise moves from one man into a family line. The stars become a visual memory handle: one becomes many.'],
 blessing:['BLESSING — A HORIZON BEYOND THE FAMILY','The promise never terminates on Abraham. God keeps the nations in view from the beginning.']
};
$$('.promise-panel').forEach(p=>p.onclick=()=>{
 const k=p.dataset.concept;$$('.promise-panel').forEach(x=>x.classList.toggle('active',x===p));
 if(!st.concepts.includes(k))st.concepts.push(k);save();progress();
 $('#conceptRevealTitle').textContent=conceptData[k][0];$('#conceptRevealText').textContent=conceptData[k][1];
 const art=$('#conceptRevealArt');art.className='concept-reveal-art '+k;
 encourage(st.concepts.length===3?'Land. Seed. Blessing. Keep those three.':'You just made one part visible.');
});

// FILL
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
renderFill();
$('#hintBtn').onclick=()=>$('#fillHint').textContent='↳ '+fills[fi][2];
$('#revealBtn').onclick=()=>{$('#fillInput').value=fills[fi][1];completeFill(true)};
$('#fillInput').addEventListener('keydown',e=>{if(e.key==='Enter')completeFill(false)});
function completeFill(reveal){const q=fills[fi],ok=$('#fillInput').value.trim().toLowerCase()===q[1].toLowerCase();if(!ok&&!reveal){$('#fillFeedback').textContent='Almost. Use the nudge, then try again.';return}st.fills[fi]=true;save();progress();$('#fillFeedback').innerHTML='<b>Exactly.</b> '+q[3];$('#fillProgress').style.width=((fi+1)/10*100)+'%';encourage(fi===2?'You are seeing the promise.':'Keep this one.');setTimeout(()=>{if(fi<9){fi++;renderFill()}else $('#fillFeedback').innerHTML='<b>10 / 10 complete.</b> Your guided notes are locked in.'},900)}

// PLACE
const order=['Abraham','Isaac','Jacob / Israel','Twelve Sons','Joseph','Egypt'];let selected=null;
function renderPlace(){const placed=st.place;$$('.place-slot').forEach((s,i)=>{s.textContent=placed[i]||i+1;s.classList.toggle('filled',!!placed[i]);if(i===3&&placed[i]){const d=document.createElement('div');d.style.cssText='position:absolute;bottom:-16px;display:flex;gap:3px';d.innerHTML='<i style="width:4px;height:4px;border-radius:50%;background:#e1b34c"></i>'.repeat(12);s.appendChild(d)}});$$('.place-lines path').forEach((p,i)=>p.classList.toggle('on',placed.length>i));$$('#placeBank button').forEach(b=>b.style.display=placed.includes(b.dataset.piece)?'none':'block')}
renderPlace();
$$('#placeBank button').forEach(b=>b.onclick=()=>{selected=b.dataset.piece;$$('#placeBank button').forEach(x=>x.classList.toggle('selected',x===b))});
$$('.place-slot').forEach((s,i)=>s.onclick=()=>{if(!selected){encourage('Choose a scrambled card first.');return}if(i!==st.place.length){encourage('Use the next empty stop.');return}if(selected!==order[i]){encourage(['Start with the man God called.','Who was the promised son?','Whose name became Israel?','What grew out of Jacob’s family?','Who was sold into Egypt?','Where did Genesis end?'][i]);return}st.place.push(selected);selected=null;save();renderPlace();progress();if(st.place.length===6)setTimeout(()=>{$('#placeReward').classList.add('show');encourage('Now Exodus has an address.')},350)});
$('#shufflePlace').onclick=()=>{st.place=[];save();renderPlace()};$('#closePlaceReward').onclick=()=>{$('#placeReward').classList.remove('show');$('#connectScene').scrollIntoView({behavior:'smooth'})};

// CONNECT
const bridges=[
 {q:'What survives Babel’s scattering?',opts:['God forgets the nations','God’s purpose for the nations continues through Abraham','The story becomes only about Abraham'],ans:1,aha:'Babel scatters the nations, but Genesis 12 immediately keeps the nations in view through Abraham.',paths:['thread1']},
 {q:'How does the blessing widen?',opts:['It reaches all nations','It stays only with one household','It ends before Israel'],ans:0,aha:'The promise is personal, familial, and global at the same time.',paths:['thread2','thread3']},
 {q:'Where does Paul ultimately focus the promised “seed”?',opts:['Egypt','Babylon','Christ'],ans:2,aha:'You found the thread: Abraham’s promise reaches forward into Christ.',paths:['thread4']}
];
function renderBridge(){const i=Math.min(st.connect,2),b=bridges[i];$('#connectProgress').textContent=`BRIDGE ${i+1} / 3`;$('#connectQuestion').textContent=b.q;$('#connectChoices').innerHTML=b.opts.map((o,j)=>`<button data-i="${j}">${o}</button>`).join('');$('#connectAha').textContent='';$$('#connectChoices button').forEach(x=>x.onclick=()=>{if(+x.dataset.i!==b.ans){encourage('Read the nodes again. The relationship is visible on the canvas.');return}b.paths.forEach(id=>$('#'+id).classList.add('live'));$('#threadCenter').textContent=i===2?'✦':String(i+1);if(i===2)$('#threadCenter').classList.add('found');$('#connectAha').innerHTML='<b>Aha.</b> '+b.aha;if(st.connect<3)st.connect++;save();progress();encourage(i===2?'You found the thread.':'Another connection built.');if(i<2)setTimeout(renderBridge,1500)})}
renderBridge();
// Restore completed connection lines after reload.
if(st.connect>=1) $('#thread1').classList.add('live');
if(st.connect>=2){ $('#thread2').classList.add('live'); $('#thread3').classList.add('live'); }
if(st.connect>=3){ $('#thread4').classList.add('live'); $('#threadCenter').textContent='✦'; $('#threadCenter').classList.add('found'); }

// QUIZ
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

// UNLOCK
$$('.unlock-list button').forEach((b,i)=>{if(st.owned.includes(i)){b.classList.add('on');b.querySelector('i').textContent='✓'}b.onclick=()=>{if(!st.owned.includes(i))st.owned.push(i);b.classList.add('on');b.querySelector('i').textContent='✓';save();progress()}});
$('#tellback').value=st.tellback||'';$('#tellback').oninput=e=>{st.tellback=e.target.value;save();progress()};
$('#claimWeek').onclick=()=>{if(st.owned.length<3||(st.tellback||'').trim().split(/\s+/).filter(Boolean).length<15){encourage('Own all three truths and tell the story in your own words first.');return}$('#unlockReveal').classList.add('show');encourage('Understanding unlocked.');setTimeout(()=>$('#deepScene').scrollIntoView({behavior:'smooth'}),1200)};

// DEEP DEVOTIONAL
const deepDays=[
 {ref:'Genesis 12:1-3',title:'The Promise Path',intro:'Trace what God starts with Abraham and watch how Scripture carries the promise forward.',word:['Promise','A committed word from God that creates expectation because of the character of the One who speaks.'],look:'Notice how often God says “I will.” The passage is driven by divine initiative.',dev:['God starts with a promise.','Abraham is asked to move before he can see the whole map. Scripture places trust before sight. The call is not vague optimism; it rests on God’s spoken word and God’s faithfulness.'],life:'Where are you tempted to demand the whole map before obeying what God has already made clear?',pray:'Lord, teach me to trust Your character when I cannot yet see the whole path. Help me respond faithfully to what You have made clear. Amen.'},
 {ref:'Genesis 15:1-6',title:'Faith Under the Stars',intro:'Bring Abraham’s fear and God’s promise into the same frame.',word:['Believe','To entrust oneself to what God has said, treating His word as reliable.'],look:'Abraham names the obstacle honestly. God does not rebuke the question; He redirects Abraham to the promise.',dev:['Faith can ask real questions.','Genesis 15 does not present faith as pretending the problem is small. Abraham sees his childlessness clearly, and God meets him there. Faith is not denial; it is confidence in God while the obstacle remains visible.'],life:'What honest question do you need to bring before God without abandoning trust?',pray:'God, help me bring You my real questions and still anchor myself in what You have spoken. Amen.'},
 {ref:'Genesis 21:1-3',title:'As He Had Said',intro:'Slow down over the language of fulfillment.',word:['Faithful','Consistently true to one’s word and character.'],look:'The text repeats that God did what He had said and promised. The repetition is the point.',dev:['Fulfillment has a memory.','Isaac’s birth is more than a family celebration. It is evidence that God’s promise survives waiting, age, uncertainty, and human limitation.'],life:'Where can you look back and identify God’s faithfulness rather than only looking forward at what is unresolved?',pray:'Lord, make me a person who remembers Your faithfulness while I wait. Amen.'},
 {ref:'Genesis 32:28',title:'A New Name',intro:'See why Jacob becoming Israel matters to the whole Bible.',word:['Israel','The new covenantal name given to Jacob; later the name of the people descended from him.'],look:'The Bible’s national story grows out of a personal story. Israel is first a man, then a family, then a people.',dev:['Identity becomes history.','One renamed man eventually becomes the name of a people. That is why chronology matters: Scripture often grows large realities from small beginnings.'],life:'What part of your present life might be a beginning rather than the finished picture?',pray:'God, help me respect small beginnings and trust what You can grow from them. Amen.'},
 {ref:'Genesis 45:4-8',title:'Providence in the Pit',intro:'Listen to Joseph interpret his own suffering.',word:['Providence','God’s wise governance of events toward His purposes without making evil good.'],look:'Joseph distinguishes human intent from God’s preserving purpose.',dev:['God can work through what He does not call good.','Joseph does not pretend betrayal was righteous. Yet he can look backward and see preservation woven through a story his brothers meant for harm.'],life:'Where do you need wisdom to separate what people meant from what God may still redeem?',pray:'Lord, give me eyes to recognize Your preserving hand without excusing what was wrong. Amen.'},
 {ref:'Galatians 3:15-18',title:'Promise Before Law',intro:'Let chronology do interpretive work.',word:['Covenant','A binding relational commitment that structures promises, obligations, and identity.'],look:'Paul argues from sequence: the Law comes later and does not erase the earlier promise.',dev:['Order matters.','Paul’s argument assumes that where something sits on the biblical timeline changes how we understand it. The promise to Abraham is not an afterthought created by Sinai.'],life:'Do you usually read Bible passages as isolated sayings, or do you ask where they sit in the story?',pray:'God, teach me to read Your Word in context and to see the order of Your unfolding plan. Amen.'},
 {ref:'Genesis 50:19-26',title:'Ending in Egypt, Looking Ahead',intro:'Finish Genesis with your eyes already on Exodus.',word:['Remember','To hold God’s word and past acts in view so they shape present trust.'],look:'Joseph dies in Egypt, but his final words look toward God’s future visitation and promise.',dev:['Genesis ends unfinished on purpose.','The family is alive, but not yet home. Joseph’s bones become a quiet witness that Egypt is not the destination. The story is asking you to keep reading.'],life:'What unfinished part of your story requires hope rather than premature closure?',pray:'Lord, help me live faithfully in unfinished chapters and trust that Your story continues. Amen.'}
];
let di=0;$('#deepDays').innerHTML=deepDays.map((d,i)=>`<button data-d="${i}">Day ${i+1}</button>`).join('');
function renderDay(){const d=deepDays[di];$('#deepDayLabel').textContent=`DAY ${di+1} / 7`;$('#deepRef').textContent=d.ref;$('#deepText').textContent=d.intro;$('#devTitle').textContent=d.title;$('#devIntro').textContent=d.intro;$('#wordTitle').textContent=d.word[0];$('#wordMeaning').textContent=d.word[1];$('#lookText').textContent=d.look;$('#devotionalTitle').textContent=d.dev[0];$('#devotionalText').textContent=d.dev[1];$('#lifeText').textContent=d.life;$('#prayerText').textContent=d.pray;$('#deepJournal').value=st.deep[di]||'';$$('#deepDays button').forEach((b,i)=>b.classList.toggle('active',i===di))}
renderDay();$$('#deepDays button').forEach(b=>b.onclick=()=>{di=+b.dataset.d;renderDay()});$('#deepJournal').oninput=e=>{st.deep[di]=e.target.value;save()};$('#openDeepScripture').onclick=()=>openSheet(deepDays[di].ref);

// SCRIPTURE READER
const staticTexts={
 'Genesis 11:9':['That is why it is called Babel, for there the LORD confused the language of the whole world, and from that place the LORD scattered them over the face of all the earth.'],
 'Genesis 12:1-3':['The LORD said to Abram, “Go from your country, your people and your father’s household to the land I will show you.”','“I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.”','“I will bless those who bless you, and whoever curses you I will curse; and all peoples on earth will be blessed through you.”'],
 'Genesis 15:1-6':['The word of the LORD came to Abram in a vision: “Do not be afraid, Abram. I am your shield, your very great reward.”','Abram brought his childlessness before God.','God promised that one from Abram’s own body would be his heir.','God brought Abram outside and directed him to the stars.','“So shall your offspring be.”','Abram believed the LORD, and it was credited to him as righteousness.'],
 'Genesis 17:1-8':['God appeared to Abram and reaffirmed His covenant promises, including descendants, nations, kings, and the land.'],
 'Genesis 21:1-3':['The LORD was gracious to Sarah as He had said, and did for Sarah what He had promised.','Sarah conceived and bore a son to Abraham in his old age.','Abraham named the son Isaac.'],
 'Genesis 32:28':['“Your name will no longer be Jacob, but Israel…”'],
 'Genesis 45:4-8':['Joseph said to his brothers, “I am Joseph.”','He explained that God had sent him ahead to preserve life.'],
 'Genesis 50:19-26':['Joseph told his brothers that what they intended for evil, God intended for good to preserve many lives.','Joseph ended his life looking ahead to God’s promised visitation and the family’s future departure from Egypt.'],
 'Genesis 22:18':['“Through your offspring all nations on earth will be blessed…”'],
 'Galatians 3:8':['Scripture foresaw that God would justify the Gentiles by faith and announced the gospel in advance to Abraham: “All nations will be blessed through you.”'],
 'Galatians 3:16':['The promises were spoken to Abraham and to his seed. Paul points ultimately to Christ.'],
 'Galatians 3:15-18':['Paul argues that the later Law does not cancel the promise God had already established with Abraham.']
};
let currentRef='',selectedVerse=null,actionMode=null;
function openSheet(ref){currentRef=ref;if(!st.refs.includes(ref))st.refs.push(ref);save();progress();$('#sheetTitle').textContent=ref;$('#scriptureSheet').classList.add('open');$('#sheetBackdrop').classList.add('open');renderSheet('passage')}
function closeSheet(){$('#scriptureSheet').classList.remove('open');$('#sheetBackdrop').classList.remove('open')}
$('#closeSheet').onclick=closeSheet;$('#sheetBackdrop').onclick=closeSheet;
$$('.scripture-link').forEach(b=>{if(b.id!=='openDeepScripture')b.onclick=()=>openSheet(b.dataset.ref)});
$$('[data-sheet-tab]').forEach(b=>b.onclick=()=>{$$('[data-sheet-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSheet(b.dataset.sheetTab)});
function verseKey(i){return currentRef+'::'+i}
function renderSheet(tab){
 const box=$('#sheetContent');
 if(tab==='passage'){
  const vv=staticTexts[currentRef]||['This reference is part of the lesson. Add the full public-domain text in the production Bible data layer.'];
  box.innerHTML=`<div class="sheet-passage">${vv.map((v,i)=>`<span data-v="${i}"><sup>${i+1}</sup> ${v}</span>`).join('')}</div><div class="verse-actions"><button data-action="highlight">Highlight</button><button data-action="underline">Underline</button><button data-action="note">+ Note</button><button data-action="question">? Question</button><button data-action="connect">↗ Connect</button></div><div id="studyEditor"></div>`;
  $$('.sheet-passage span').forEach(s=>{const k=verseKey(+s.dataset.v),m=st.marks[k]||[];m.forEach(x=>s.classList.add('mark-'+x));s.onclick=()=>{$$('.sheet-passage span').forEach(x=>x.classList.remove('selected'));s.classList.add('selected');selectedVerse=+s.dataset.v;encourage('Verse selected. Choose a study action.')}});
  $$('[data-action]').forEach(b=>b.onclick=()=>handleStudyAction(b.dataset.action));
 } else if(tab==='where'){
  box.innerHTML='<div class="margin-note"><b>Where am I?</b><br>Week 03 sits in Genesis after Babel and before Exodus. Abraham → Isaac → Jacob / Israel → Twelve Sons → Joseph → Egypt.</div>';
 } else {
  box.innerHTML='<div class="margin-note"><b>Study lenses</b><br><b>Observe:</b> What does the text say?<br><b>Notice:</b> What repeats or contrasts?<br><b>Ask:</b> What is unclear?<br><b>Place:</b> Where is this on the timeline?<br><b>Connect:</b> Where does this idea appear elsewhere?</div>';
 }
}
function handleStudyAction(action){
 if(action==='connect'){closeSheet();$('#connectScene').scrollIntoView({behavior:'smooth'});return}
 if(selectedVerse===null){encourage('Tap a verse first.');return}
 const k=verseKey(selectedVerse),verseEl=$(`.sheet-passage span[data-v="${selectedVerse}"]`);
 if(action==='highlight'||action==='underline'){
  const arr=st.marks[k]||[];const idx=arr.indexOf(action);idx>=0?arr.splice(idx,1):arr.push(action);st.marks[k]=arr;save();verseEl.classList.toggle('mark-'+action);encourage(action==='highlight'?'Highlight saved.':'Underline saved.');return
 }
 const editor=$('#studyEditor'),field=action==='note'?'notes':'questions',label=action==='note'?'Note':'Question';
 editor.innerHTML=`<textarea class="study-note-input" id="sheetInput" placeholder="${label} on verse ${selectedVerse+1}…">${st[field][k]||''}</textarea><button class="cta dark" id="saveStudy">${label==='Note'?'SAVE NOTE':'SAVE QUESTION'}</button>`;
 $('#saveStudy').onclick=()=>{st[field][k]=$('#sheetInput').value;save();encourage(label+' saved.')}
}
})();
