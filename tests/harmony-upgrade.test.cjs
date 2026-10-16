'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),http=require('node:http'),{chromium}=require('playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx=vm.createContext({assert,console});vm.runInContext(code.slice(0,code.indexOf('\n// Browser initialization.')),ctx);
vm.runInContext(`
let count=0;const examples=[[[0,2,4,7],'add2'],[[0,4,7,14],'add9'],[[0,3,7,2],'m(add2)'],[[0,3,7,14],'m(add9)'],[[0,4,5,7],'add4'],[[0,4,7,17],'add11'],[[0,3,5,7],'m(add4)'],[[0,3,7,17],'m(add11)'],[[0,4,7,21],'6'],[[0,4,7,10,2],'9'],[[0,4,7,10,9],'13(no9)'],[[0,4,7,11,6],'maj7#11'],[[0,4,7,10,6],'7#11'],[[0,4,8,10,1],'7(b9,#5)'],[[0,4,7,10,1,8],'7(b9,b13)'],[[0,5,7,10,1],'7sus4(b9)'],[[0,2,5,7],'sus2sus4'],[[0,3,6,11],'dim(maj7)']];
for(let r=0;r<12;r++)for(const [ints,suffix]of examples){const p=PopHarmony.analyze(ints.map(i=>48+r+i),null);assert.equal(p.text,Spelling.tonics[r]+suffix);assert.equal(p.exact,true);count++}
assert.equal(PopHarmony.analyze([58,60,62,65],null).text,'Bbadd2');assert.equal(PopHarmony.analyze([58,62,65,72],null).text,'Bbadd9');
assert.equal(PopHarmony.analyze([60,62,64,67,74],null).voicing.ambiguous,true);assert.equal(PopHarmony.analyze([60,62,64,67,74],null).text,'Cadd2');
assert.ok(PopHarmony.analyze([62,64,67,72],null).candidates.includes('Cadd9/D'));assert.equal(PopHarmony.voicing({root:0,type:{id:'add9'}},[62,64,67,72]).ambiguous,true,'added tone below lowest root remains ambiguous');
assert.equal(PopHarmony.analyze([60,64,67,74,76],null).text,'Cadd9','doubling does not change register');
for(let tonic=0;tonic<12;tonic++)for(const mode of ['major','minor']){
 const key={tonic,mode},base=48+tonic,n=[base+2,base+6,base+9],next={notes:[base+7,base+11,base+14,base+17]},cs=Classical.analyze(n,key),dd=cs.find(c=>c.id==='V/V');
 assert.ok(dd&&dd.label.includes('D/D'));assert.ok(PopHarmony.useFunctional(cs,ChordRecognition.recognize(n,key)));assert.equal(dd.confidence,.63);
 const resolved=Classical.analyze(n,key,{next}).find(c=>c.id==='V/V');assert.equal(resolved.confidence,.92);
 for(const [ns,fig]of [[[base+6,base+9,base+14],'6'],[[base+9,base+14,base+18],'64'],[[base+6,base+9,base+12,base+14],'65'],[[base+2,base+6,base+12],'7']]){const c=Classical.analyze(ns,key,{next}).find(c=>c.id==='V/V');assert.ok(c,'applied inversion');assert.ok(c.roman.includes(fig));count++}
 assert.equal(Classical.analyze([base+2,base+6,base+9,base+12,base+16],key).find(c=>c.id==='V/V').roman,'V9/V');count++;
}
const C={tonic:0,mode:'major'};
const conflict=Classical.analyze([62,66,69],C,{spelling:{2:'D',6:'G♭',9:'A'}}).find(c=>c.id==='V/V');assert.ok(conflict.spellingConflict);assert.ok(conflict.confidence<.4);
assert.ok(!Classical.analyze([62,65,69],C).some(c=>c.id==='V/V'),'diatonic ii is not double dominant');
const e=notes=>({notes:notes.map(midi=>Notation.fromMidi(midi,{}))});
assert.ok(ScoreAnalysis.run([[60,64,67],[62,66,69],[55,59,62]].map(e),C).every(r=>r.key.tonic===0),'one DD–D is tonicization, not established modulation');
assert.ok(ScoreAnalysis.run([[60,64,67],[69,73,76,79],[62,65,69]].map(e),C).every(r=>r.key.tonic===0),'secondary dominant vi-II does not establish a new key');
// Screenshot regression: one DD–D followed by home-key IV–V–I is not G major.
for(let tonic=0;tonic<12;tonic++){
 const key={tonic,mode:'major'},patterns=[[0,4,7],[2,6,9],[7,11,14],[9,12,16],[5,9,12],[7,11,14],[0,4,7]];
 const events=patterns.map(ints=>{const notes=ints.map(n=>48+tonic+n),map={...Spelling.auto(key),...(Classical.analyze(notes,key)[0]?.spelling||{})};return {notes:notes.map(n=>Notation.fromMidi(n,map))}});
 for(let size=3;size<=events.length;size++){const rows=ScoreAnalysis.run(events.slice(0,size),key),marks=PivotHarmony.annotations(events.slice(0,size),rows,key);assert.ok(rows.every(r=>r.key.tonic===tonic));assert.equal(marks.transitions.length,0);assert.ok(marks.marks[1].function.includes('D/D'));}
 const revised=events.slice();revised.splice(3,0,events[4]);assert.ok(ScoreAnalysis.run(revised,key).every(r=>r.key.tonic===tonic),'editing rebuilds full context');
 count+=6;
}
console.log('PASS: '+count+' jazz register, altered chord and applied-dominant checks; conservative tonicization and spelling conflict');
`,ctx);
(async()=>{const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html)});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.PHYCHORD_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.testMidi={id:'jazz-midi',state:'connected',type:'input',name:'Jazz test keyboard'};Object.defineProperty(navigator,'requestMIDIAccess',{value:async()=>({inputs:new Map([['jazz-midi',testMidi]])})})});await page.goto('http://127.0.0.1:'+server.address().port);await page.click('#settingsButton');await page.click('#settingsConnect');await page.click('#settingsClose');
const send=async(n,v)=>page.evaluate(([n,v])=>testMidi.onmidimessage({data:[144,n,v],timeStamp:performance.now()}),[n,v]);
for(const n of [62,66,69])await send(n,88);await page.waitForFunction(()=>document.querySelector('#function').textContent.includes('D/D'));assert.ok((await page.locator('#function').innerText()).includes('V/V'));for(const n of [62,66,69])await send(n,0);
await page.click('#captureNotes');for(const n of [60,64,67]){await send(n,80);await send(n,0)}await page.waitForFunction(()=>State.notes.includes(64));await page.locator('#keyboard button[data-note="64"]').click();await page.waitForFunction(()=>!State.notes.includes(64));assert.deepEqual(await page.evaluate(()=>[...State.notes].sort()),[60,67]);assert.equal(await page.evaluate(()=>MIDIPiano.activeVoices),0,'deleting captured MIDI is silent');
await send(64,75);await page.waitForFunction(()=>State.notes.includes(64));await page.locator('#keyboard button[data-note="64"]').click();await page.waitForFunction(()=>!State.notes.includes(64));await send(69,80);await send(69,0);assert.equal(await page.evaluate(()=>State.notes.includes(64)),false,'still-held removed note must not reappear on another event');await send(64,0);await send(64,90);await send(64,0);await page.waitForFunction(()=>State.notes.includes(64));await page.click('#captureNotes');await page.click('#reset');
await page.selectOption('#mode','play');await page.waitForSelector('#reset',{state:'hidden'});for(const n of [58,60,62,65])await send(n,90);await page.waitForFunction(()=>document.querySelector('#function').textContent==='Bbadd2');assert.ok((await page.locator('#popCandidates').innerText()).includes('Bbadd9'));for(const n of [58,60,62,65])await send(n,0);
await page.click('#openScore');assert.equal(await page.locator('#scorePerform').getAttribute('aria-pressed'),'false');
for(const n of [60,64,67])await send(n,75);for(const n of [60,64,67])await send(n,0);assert.equal(await page.evaluate(()=>ScoreEditor.events.length),1);
await page.click('#scorePerform');const before=await page.evaluate(()=>JSON.stringify([ScoreEditor.events,ScoreEditor.selected]));for(const n of [62,65,69])await send(n,64);assert.equal(await page.locator('#scoreKeyboard button.active').count(),3);assert.ok(await page.evaluate(()=>MIDIPiano.activeVoices)>0);assert.equal(await page.evaluate(()=>JSON.stringify([ScoreEditor.events,ScoreEditor.selected])),before);
await page.click('#scorePerform');for(const n of [62,65,69])await send(n,0);assert.equal(await page.evaluate(()=>ScoreEditor.events.length),1,'switching off while holding keys must not capture a partial chord');
for(const n of [55,59,62])await send(n,110);for(const n of [55,59,62])await send(n,0);assert.equal(await page.evaluate(()=>ScoreEditor.events.length),2,'original all-released commit restored');
await send(72,60);await page.click('#scorePerform');await send(72,0);assert.equal(await page.evaluate(()=>ScoreEditor.events.length),2,'pending input discarded on entering performance');assert.equal(await page.locator('#scoreKeyboard button.active').count(),0);assert.equal(await page.evaluate(()=>MIDIPiano.activeVoices),0);
await page.click('#closeScore');await page.click('#settingsButton');await page.selectOption('#languageSelect','en');await page.click('#settingsClose');await page.click('#openScore');assert.equal(await page.locator('#scorePerform').getAttribute('aria-label'),'MIDI performance only (no score entry)');assert.deepEqual(errors,[]);
console.log('PASS: Chromium DD headline, Bbadd2 aliases, default score input, performance-only sound/highlights, safe held-key transitions and English label');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
