'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map(),queue=[];let clock=0;
const make=()=>({parentElement:{hidden:false},value:'',checked:false,dataset:{},style:{},children:[],classList:{toggle(){}},append(x){this.children.push(x)},replaceChildren(){this.children=[]},setAttribute(){},click(){}});
function el(id){if(!elements.has(id))elements.set(id,make());return elements.get(id)}
const sandbox={console,assert,performance:{now:()=>clock},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:f=>queue.push(f),Blob,URL,navigator:{},document:{getElementById:el,querySelector:s=>el(s.slice(1)),createElement:make,querySelectorAll:()=>el('keyboard').children}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);const run=s=>vm.runInContext(s,sandbox);const flush=()=>{while(queue.length)queue.shift()()};flush();
run(`
let checks=0;const check=(condition,message)=>{assert.ok(condition,message);checks++};
const notes=(tonic,ints)=>ints.map(i=>48+tonic+i);
const frame=(key,ints)=>({key,notes:notes(key.tonic,ints)});
for(let tonic=0;tonic<12;tonic++)for(const mode of ['major','minor']){
 const key={tonic,mode};
 for(const spec of Classical.specs){
  for(let i=0;i<spec.ints.length;i++){
   const bass=spec.ints[i],ordered=[bass,...spec.ints.filter((_,j)=>j!==i).map(n=>n<=bass?n+12:n)];
   const result=Classical.analyze(notes(tonic,ordered),key);
   const c=result.find(c=>c.id===spec.id);check(!!c,spec.id+' transpose/inversion '+tonic+mode+i);
   check(c.tones.length===spec.ints.length&&c.tones.every(p=>ordered.map(n=>pc(tonic+n)).includes(p)),'tone identity');
  }
 }
 for(const [ints,id] of [[[2,6,9,12],'V/V'],[[6,9,12,15],'vii°/V']])for(let inversion=0;inversion<ints.length;inversion++){
  const bass=ints[inversion],voicing=[bass,...ints.filter((_,i)=>i!==inversion).map(n=>n<=bass?n+12:n)];
  const c=Classical.analyze(notes(tonic,voicing),key).find(c=>c.id===id);check(!!c,'applied inversion');
  const resolution=frame(key,[7,11,14]);check(Classical.analyze(notes(tonic,voicing),key,{next:resolution}).find(c=>c.id===id).confidence>c.confidence,'applied resolution');
 }
 const nBefore=Classical.analyze(notes(tonic,[5,8,13]),key).find(c=>c.id==='N');
 check(Classical.analyze(notes(tonic,[5,8,13]),key,{next:frame(key,[7,11,14])}).find(c=>c.id==='N').confidence>nBefore.confidence,'Neapolitan resolution');
 let n=Classical.analyze(notes(tonic,[5,8,13]),key).find(c=>c.id==='N');check(n.label==='N6'&&n.roman==='♭II6'&&n.en==='Neapolitan Sixth','N6 presentation');
 check(Classical.analyze(notes(tonic,[2,6,9,12]),key).some(c=>c.id==='V/V'&&c.label.startsWith('DD')),'double dominant');
 check(Classical.analyze(notes(tonic,[6,9,12,15]),key).some(c=>c.id==='vii°/V'),'secondary leading seventh');
 check(Classical.analyze(notes(tonic,[9,13,16,19]),key).some(c=>c.id==='V/ii' || c.id==='V/II')||mode==='minor','secondary dominant ii');
 check(Classical.analyze(notes(tonic,[7,11,13,17]),key).some(c=>c.id==='altered'),'altered dominant b5');
 const target=frame(key,mode==='major'?[0,4,7]:[0,3,7]);
 check(Classical.analyze(notes(tonic,[0,3,6,9]),key,{next:target}).some(c=>c.id==='CT°7'&&c.confidence>=.85),'CT diminished resolution');
 const ct=Classical.analyze(notes(tonic,[0,3,6,8]),key,{next:target});check(ct.some(c=>c.id==='CT+6'&&c.confidence>=.85),'CT augmented-sixth resolution');
 for(const id of ['It+6','Fr+6','Ger+6','Sw+6']){
  const s=Classical.specs.find(s=>s.id===id),next=frame(key,[7,11,14]);
  const before=Classical.analyze(notes(tonic,s.ints),key).find(c=>c.id===id),after=Classical.analyze(notes(tonic,s.ints),key,{next}).find(c=>c.id===id);
  check(after.confidence>before.confidence,'augmented-sixth resolution evidence');
 }
 const tonicThird=mode==='major'?4:3;
 const cadence=ContextHarmony.inspect([frame(key,[7,11,14]),frame(key,[0,tonicThird,7])]);check(cadence.some(c=>c.name==='正格终止候选'),'authentic cadence');
 check(ContextHarmony.inspect([frame(key,[0,tonicThird,7]),frame(key,[7,11,14])]).some(c=>c.name==='半终止候选'),'half cadence');
 check(ContextHarmony.inspect([frame(key,[7,11,14]),frame(key,mode==='major'?[9,12,16]:[8,12,15])]).some(c=>c.name==='欺骗终止候选'),'deceptive cadence');
 check(ContextHarmony.inspect([frame(key,[7,12,tonicThird+12]),frame(key,[7,11,14])]).some(c=>c.name.startsWith('终止四六')),'cadential 64');
 const borrowed=mode==='major'?[5,8,12]:[5,9,12];check(Classical.analyze(notes(tonic,borrowed),key).some(c=>c.id==='borrowed'),'modal mixture');
 if(mode==='minor'){
  check(ContextHarmony.inspect([frame(key,[7,11,14]),frame(key,[0,4,7])]).some(c=>c.name==='皮卡第终止候选'),'Picardy');
  check(ContextHarmony.inspect([frame(key,[8,12,17]),frame(key,[7,11,14])]).some(c=>c.name==='弗里几亚半终止候选'),'Phrygian');
 }
}
const C={tonic:0,mode:'major'},Cm={tonic:0,mode:'minor'};
const swissNotes=[56,60,63,66];
const manual=Spelling.overrides('Ab C D# F#',swissNotes);check(!manual.error,'manual spelling accepted');
const swiss=Classical.analyze(swissNotes,C,{spelling:manual.map});check(swiss.find(c=>c.id==='Sw+6').confidence>swiss.find(c=>c.id==='Ger+6').confidence,'Swiss spelling disambiguates');
check(!!Spelling.overrides('Ab C E F#',swissNotes).error,'invalid manual correction rejected');
check(Classical.analyze([60,64],C).length===0,'two tones no invented harmony');
check(!Classical.analyze([60,64,67],C).some(c=>c.id==='CT°7'),'negative special detection');
const moving=ContextHarmony.inspect([{key:{tonic:0,mode:'minor'},notes:[59,62,65,68]},{key:{tonic:3,mode:'major'},notes:[58,63,67]}]);check(moving.some(c=>c.name==='等音减七转调候选'),'enharmonic diminished modulation');
const augMod=ContextHarmony.inspect([{key:Cm,notes:[56,60,63,66]},{key:{tonic:1,mode:'major'},notes:[49,53,56]}]);check(augMod.some(c=>c.name==='等音增六转调候选'),'enharmonic augmented-sixth modulation');
const voice=Classical.voiceMotion([55,60,64],[55,59,62]);check(voice[1].delta===-1&&voice[2].delta===-2,'voice resolutions');
check(ContextHarmony.inspect([frame(C,[7,12,16]),frame(C,[7,11,14])]).some(c=>c.name.startsWith('终止四六')&&c.confidence>.9),'64 voice evidence');
const g=ChordRecognition.recognize([55,59,62,65],null,null),t=ChordRecognition.recognize([60,64,67],null,null);Tonality.accept(g);Tonality.accept(t);check(Tonality.current?.tonic===0&&Tonality.current.mode==='major','key inference regression');
check(Harmony.label(ChordRecognition.recognize([59,62,65,67],C,null),C)==='D65','inversion regression');
check(ChordRecognition.recognize([60,62,64,67],C,null).outside.includes(2),'nonchord regression');
check(PopHarmony.analyze([57,60,65],C).text==='F/A','popular inversion F/A');
check(PopHarmony.analyze([58,61,64,67,71,74],C).text==='G/Bbdim','polychord G over Bb diminished');
check(PopHarmony.analyze([60,64,67,71],C).text==='Cmaj7','major seventh symbol');
check(PopHarmony.analyze([59,62,65,67],C).text==='G7/B','dominant inversion');
check(!PopHarmony.useFunctional(Classical.analyze([58,61,64,67,71,74],C),ChordRecognition.recognize([58,61,64,67,71,74],C,null)),'unrelated sonority cannot force tonal headline');
console.log('PASS: '+checks+' harmonic assertions');
`);
run("Analysis.reset();State.mode='chord';State.selected={tonic:0,mode:'minor'};MIDIInput.event('noteon',53,90);MIDIInput.event('noteon',56,90);MIDIInput.event('noteon',61,90)");flush();assert.equal(el('chord').textContent,'那不勒斯六和弦');assert.ok(el('function').textContent.includes('N6 / ♭II6'));assert.ok(el('classicalDetails').children.some(x=>x.textContent==='构成音：F–A♭–D♭'));
run("Analysis.commit();State.mode='play';MIDIInput.event('noteoff',53);assert.ok(!State.notes.includes(53));Analysis.reset()");flush();assert.equal(el('keyboard').children.length,88);assert.equal(el('chord').textContent,'');assert.equal(el('classicalDetails').children.length,0);
console.log('PASS: UI N6 presentation, MIDI events, reset and virtual keyboard regression');
