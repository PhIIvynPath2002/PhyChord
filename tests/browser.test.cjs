'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),http=require('node:http'),fs=require('node:fs');
(async()=>{const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.resolve(__dirname,'../index.html')))});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.PHYCHORD_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
const page=await browser.newPage(),errors=[],requests=[];page.on('pageerror',e=>(errors.push(e.message),console.error('Browser error:',e.message)));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:'))requests.push(r.url())});
await page.addInitScript(()=>{window.mockInput={id:'keyboard-1',state:'connected',type:'input'};window.mockAccess={inputs:new Map([['keyboard-1',window.mockInput]])};Object.defineProperty(navigator,'requestMIDIAccess',{value:async()=>window.mockAccess,configurable:true})});
await page.goto('http://127.0.0.1:'+server.address().port);
const pianoCode=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').split('const PianoAudio=')[1].split('const MIDIInput=')[0];
const rendered=await page.evaluate(async code=>{const Original=window.AudioContext;async function sample(velocity){const offline=new OfflineAudioContext(1,48000,48000);window.AudioContext=function(){return offline};const piano=new Function('const PianoAudio='+code+';return PianoAudio')();piano.configure(true,.6);piano.noteOn('test:0:60',60,velocity,'test:0');const buffer=await offline.startRendering(),data=buffer.getChannelData(0);let sum=0,peak=0;for(const n of data){sum+=n*n;peak=Math.max(peak,Math.abs(n))}return {rms:Math.sqrt(sum/data.length),peak}}try{return {soft:await sample(30),loud:await sample(110)}}finally{window.AudioContext=Original}},pianoCode);assert.ok(rendered.soft.rms>.0001);assert.ok(rendered.loud.rms>rendered.soft.rms*2);assert.ok(rendered.loud.peak<1,'piano output remains bounded');
assert.equal(await page.locator('header h1').first().innerText(),'PhyChord');assert.equal(await page.locator('#status').innerText(),'');
await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(0, 0, 0)');assert.equal(await page.locator('#liveStaff svg').evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
const box=await page.locator('#liveStaff').boundingBox();assert.ok(Math.abs(box.width/box.height-1.25)<.01);
await page.click('#settingsButton');await page.selectOption('#themeSelect','light');assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
await page.selectOption('#themeSelect','system');await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');await page.click('#settingsClose');
assert.equal(await page.locator('#chord').innerText(),'');
await page.click('#connect');await page.evaluate(()=>{mockInput.onmidimessage({data:[144,49,90],timeStamp:performance.now()});mockInput.onmidimessage({data:[144,38,90],timeStamp:performance.now()})});await page.waitForFunction(()=>document.querySelector('#chord').textContent==='C#3，D2');
await page.evaluate(()=>mockInput.onmidimessage({data:[128,38,0],timeStamp:performance.now()}));await page.waitForFunction(()=>document.querySelector('#chord').textContent==='C#3');await page.click('#reset');
await page.click('#settingsButton');await page.click('#keybindingsButton');assert.ok((await page.locator('#keybindings').innerText()).includes('删除键：删除当前和声'));await page.click('#settingsClose');
await page.click('#analysisDetails > summary');await page.selectOption('#quality','minor');await page.click('#connect');assert.ok((await page.locator('#status').innerText()).includes('本地 MIDI'));
await page.evaluate(()=>{for(const n of [53,56,61])mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()})});
await page.waitForFunction(()=>document.querySelector('#function').textContent.includes('N6 / ♭II6'));assert.equal(await page.locator('#chord').innerText(),'那不勒斯六和弦');assert.ok((await page.locator('#classicalDetails').innerText()).includes('构成音：F–A♭–D♭'));
await page.click('#reset');for(const n of [56,60,63,66])await page.click('#keyboard [data-note="'+n+'"]');await page.fill('#spelling','Ab C D# F#');await page.waitForFunction(()=>document.querySelector('#chord').textContent==='瑞士增六和弦');
await page.fill('#spelling','');await page.selectOption('#mode','play');assert.equal(await page.locator('#recordControls,#record,#save,#clearRecording').count(),0);
await page.evaluate(()=>mockInput.onmidimessage({data:[144,60,100],timeStamp:performance.now()}));await page.waitForFunction(()=>document.querySelector('[data-note="60"]').classList.contains('active'));
await page.click('#reset');
// Performance chord display changes with exactly the currently held notes.
await page.evaluate(()=>[60,64,67,71].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()})));await page.waitForFunction(()=>document.querySelector('#function').textContent.includes('Cmaj7'));
await page.evaluate(()=>mockInput.onmidimessage({data:[128,71,0],timeStamp:performance.now()}));await page.waitForFunction(()=>document.querySelector('#liveStaff [data-midi="71"]')===null&&document.querySelector('#function').textContent==='C');assert.equal(await page.locator('#liveStaff [data-midi]').count(),3);
await page.evaluate(()=>mockInput.onmidimessage({data:[144,70,90],timeStamp:performance.now()}));await page.waitForFunction(()=>document.querySelector('#liveStaff [data-midi="70"]')!==null&&document.querySelector('#function').textContent==='C7');assert.equal(await page.locator('#liveStaff [data-midi]').count(),4);await page.click('#reset');
// Performance is MIDI-only; virtual keys remain inert.
await page.waitForFunction(()=>document.querySelectorAll('#keyboard .active').length===0);
await page.locator('[data-note="60"]').first().click({force:true});assert.equal(await page.locator('#keyboard .active').count(),0);
await page.evaluate(()=>[55,59,62,65].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()})));
await page.waitForFunction(()=>document.querySelector('#function').textContent==='G7');assert.equal(await page.locator('#history').innerText(),'');
await page.evaluate(()=>{[55,59,62,65].forEach(n=>mockInput.onmidimessage({data:[128,n,0],timeStamp:performance.now()}));[60,64,67].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()}))});
await page.waitForFunction(()=>document.querySelector('#function').textContent==='C');assert.equal(await page.locator('#currentKey').isVisible(),false);assert.equal(await page.evaluate(()=>Tonality.current),null);
await page.selectOption('#mode','chord');assert.equal(await page.locator('#keyboard button').count(),88);
assert.equal(await page.locator('#satbPanel').count(),0);
await page.selectOption('#mode','play');assert.equal(await page.locator('header #openScore').isVisible(),true);await page.click('#openScore');assert.equal(await page.locator('#scoreWorkspace').isVisible(),true);await page.evaluate(()=>{[48,55,60,64].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()}));[48,55,60,64].forEach(n=>mockInput.onmidimessage({data:[128,n,0],timeStamp:performance.now()}))});assert.equal(await page.evaluate(()=>ScoreEditor.events.length),1);await page.locator('#scoreStaff').focus();await page.keyboard.press('Delete');await page.click('#closeScore');assert.equal(await page.locator('#classicalDetails').isVisible(),false);
await page.selectOption('#mode','chord');await page.selectOption('#quality','major');await page.click('#reset');
await page.evaluate(()=>{for(const n of [57,60,65])mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()})});
await page.waitForFunction(()=>document.querySelector('#function').textContent==='S6'&&document.querySelector('#popSymbol').textContent==='F/A');
await page.click('#reset');await page.evaluate(()=>{for(const n of [58,61,64,67,71,74])mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()})});
await page.waitForFunction(()=>document.querySelector('#function').textContent==='G/Bbdim');assert.equal(await page.locator('#popSymbol').isVisible(),false);assert.equal(await page.locator('footer').count(),0);
await page.click('#reset');
await page.click('#openScore');assert.ok(await page.locator('#scoreWorkspace').isVisible());assert.equal(await page.locator('#scoreNotes,#scoreVoices,#scoreDuration').count(),0);
// Enter one harmony in MIDI; partial release must not advance the cursor.
await page.evaluate(()=>[48,55,60,64].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()})));
await page.evaluate(()=>[48,55,60].forEach(n=>mockInput.onmidimessage({data:[128,n,0],timeStamp:performance.now()})));
assert.equal(await page.evaluate(()=>ScoreEditor.events.length),0);
await page.evaluate(()=>mockInput.onmidimessage({data:[128,64,0],timeStamp:performance.now()}));assert.equal(await page.evaluate(()=>ScoreEditor.events.length),1);assert.equal(await page.evaluate(()=>ScoreEditor.selected),1);
assert.equal(await page.locator('#scoreStaff [data-midi]').count(),4);assert.equal(await page.locator('#scoreStaff .function-label').textContent(),'T');assert.equal(await page.locator('#scoreStaff .roman-label').textContent(),'I');assert.equal(await page.locator('#scoreStaff .pop-label').textContent(),'C');
assert.equal(await page.locator('#scoreStaff .initial-key').getAttribute('data-key'),'C');assert.equal(await page.locator('#scoreCursor').getAttribute('x1'),'140');assert.equal(await page.locator('#scoreKeyboard .active').count(),4);
await page.click('#listenEvent');await page.waitForFunction(()=>document.getElementById('listenEvent').getAttribute('aria-label')==='暂停播放');await page.click('#listenEvent');await page.waitForFunction(()=>AudioPreview.state==='paused');await page.click('#listenEvent');await page.waitForFunction(()=>AudioPreview.state==='playing');await page.locator('#scoreStaff').focus();await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>AudioPreview.state==='stopped');
assert.equal(await page.locator('#scoreStaff .accidental').count(),0);
// Click the first column at a staff pitch; it snaps into that same harmony.
await page.evaluate(()=>{const svg=document.querySelector('#scoreStaff svg'),p=svg.createSVGPoint();p.x=110;p.y=66;const q=p.matrixTransform(svg.getScreenCTM());document.querySelector('#scoreStaff').dispatchEvent(new MouseEvent('click',{clientX:q.x,clientY:q.y,bubbles:true}))});assert.equal(await page.evaluate(()=>ScoreEditor.events.length),1);assert.equal(await page.evaluate(()=>ScoreEditor.events[0].notes.length),5);
await page.locator('#scoreStaff [data-midi="67"]').click({button:'right'});assert.equal(await page.evaluate(()=>ScoreEditor.events[0].notes.length),4);
await page.click('#predictNext');assert.ok(await page.locator('.prediction').count()>=2);
await page.locator('.prediction button').filter({hasText:'插入'}).first().click();assert.equal(await page.evaluate(()=>ScoreEditor.events.length),2);
await page.keyboard.press('ArrowLeft');await page.keyboard.press('Delete');assert.equal(await page.evaluate(()=>ScoreEditor.events.length),1);assert.equal(await page.evaluate(()=>ScoreEditor.selected),0);await page.keyboard.press('ArrowRight');
const pagesBefore=page.context().pages().length;await page.locator('#scoreStaff').dblclick({position:{x:300,y:100}});assert.equal(page.context().pages().length,pagesBefore);assert.equal(await page.evaluate(()=>typeof ScoreEditor.portrait),'undefined');
await page.evaluate(()=>{[50,57,62,65].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()}));[50,57,62,65].forEach(n=>mockInput.onmidimessage({data:[128,n,0],timeStamp:performance.now()}))});assert.equal(await page.locator('#scoreStaff [data-midi]').count(),8);
assert.equal(await page.locator('#nextHarmony,#deleteEvent').count(),0);
await page.locator('#scoreStaff').focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>ScoreEditor.events.length),3);assert.equal(await page.evaluate(()=>ScoreEditor.selected),1);assert.equal(await page.evaluate(()=>ScoreEditor.events[1].notes.length),0);
await page.keyboard.press('Delete');assert.equal(await page.evaluate(()=>ScoreEditor.events.length),2);assert.equal(await page.evaluate(()=>ScoreEditor.selected),0);await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>ScoreEditor.selected),2);await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>ScoreEditor.events.length),3);assert.equal(await page.evaluate(()=>ScoreEditor.events[2].notes.length),0);
await page.evaluate(()=>{const r=document.getElementById('scoreZoom');r.value='1.5';r.dispatchEvent(new Event('input'))});assert.ok(await page.locator('#scoreStaff').evaluate(e=>e.scrollWidth>e.clientWidth));
await page.click('#closeScore');assert.equal(await page.locator('#scoreWorkspace').isVisible(),false);
await page.reload();await page.click('#openScore');assert.equal(await page.evaluate(()=>ScoreEditor.events.length),3);assert.equal(await page.evaluate(()=>ScoreEditor.events[2].notes.length),0);// Repeated keydown (native held-key repeats) deletes backwards, then remaining harmonies at index zero.
await page.locator('#scoreStaff').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Delete');assert.equal(await page.evaluate(()=>ScoreEditor.selected),1);assert.equal(await page.evaluate(()=>ScoreEditor.events.length),2);
await page.evaluate(()=>{for(let i=0;i<4;i++)document.getElementById('scoreStaff').dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',repeat:true,bubbles:true,cancelable:true}))});assert.equal(await page.evaluate(()=>ScoreEditor.events.length),0);assert.equal(await page.evaluate(()=>ScoreEditor.selected),0);assert.equal(await page.locator('#scoreKeyboard .active').count(),0);
// Deletion selects the preceding harmony; new MIDI must insert, preserving both neighbours.
await page.evaluate(()=>MIDIInput.connect());
await page.evaluate(()=>{for(const notes of [[48,55,60,64],[53,57,60,65],[55,59,62,65]]){notes.forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()}));notes.forEach(n=>mockInput.onmidimessage({data:[128,n,0],timeStamp:performance.now()}))}});const savedChords=await page.evaluate(()=>ScoreEditor.events.map(e=>e.notes.map(n=>n.midi)));
await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Delete');assert.equal(await page.evaluate(()=>ScoreEditor.selected),0);
await page.evaluate(()=>{[50,57,62,65].forEach(n=>mockInput.onmidimessage({data:[144,n,90],timeStamp:performance.now()}))});assert.equal(await page.evaluate(()=>ScoreEditor.events.length),2,'preview does not overwrite or prematurely commit');
await page.evaluate(()=>{[50,57,62,65].forEach(n=>mockInput.onmidimessage({data:[128,n,0],timeStamp:performance.now()}))});assert.equal(await page.evaluate(()=>ScoreEditor.events.length),3);assert.deepEqual(await page.evaluate(()=>ScoreEditor.events[0].notes.map(n=>n.midi)),savedChords[0]);assert.deepEqual(await page.evaluate(()=>ScoreEditor.events[2].notes.map(n=>n.midi)),savedChords[2]);assert.deepEqual(await page.evaluate(()=>ScoreEditor.events[1].notes.map(n=>n.midi)),[50,57,62,65]);
await page.keyboard.press('ArrowLeft');await page.keyboard.press('Delete');assert.equal(await page.evaluate(()=>ScoreEditor.selected),0);
await page.evaluate(()=>{const svg=document.querySelector('#scoreStaff svg'),p=svg.createSVGPoint();p.x=110;p.y=66;const q=p.matrixTransform(svg.getScreenCTM());document.querySelector('#scoreStaff').dispatchEvent(new MouseEvent('click',{clientX:q.x,clientY:q.y,bubbles:true}))});assert.equal(await page.evaluate(()=>ScoreEditor.events.length),3);assert.deepEqual(await page.evaluate(()=>ScoreEditor.events[0].notes.map(n=>n.midi)),savedChords[0]);assert.deepEqual(await page.evaluate(()=>ScoreEditor.events[2].notes.map(n=>n.midi)),savedChords[2]);assert.equal(await page.evaluate(()=>ScoreEditor.events[1].notes.length),1);
await page.evaluate(()=>{for(let i=0;i<5;i++)ScoreEditor.removeCurrent()});await page.click('#closeScore');
await page.click('#settingsButton');await page.click('#settingsConnect');await page.evaluate(()=>{window.secondInput={id:'keyboard-2',name:'Second keyboard',state:'connected',type:'input'};mockAccess.inputs.set('keyboard-2',secondInput);mockAccess.onstatechange({port:secondInput})});await page.selectOption('#midiDevice','keyboard-2');await page.click('#settingsClose');
await page.evaluate(()=>{mockInput.onmidimessage({data:[144,60,90],timeStamp:performance.now()});secondInput.onmidimessage({data:[144,62,90],timeStamp:performance.now()})});await page.waitForFunction(()=>document.querySelector('#keyboard [data-note="62"]').classList.contains('active'));assert.equal(await page.locator('#keyboard [data-note="60"]').evaluate(e=>e.classList.contains('active')),false);await page.click('#reset');
for(const width of [390,960]){await page.setViewportSize({width,height:844});
assert.ok(await page.locator('#connect').isVisible());
assert.ok(await page.locator('#keyboard').evaluate(k=>k.scrollWidth<=k.clientWidth));
assert.ok(await page.locator('#keyboard button').evaluateAll(bs=>bs.every(b=>!b.textContent.trim())));
assert.equal(await page.locator('#keyboard .black').count(),36);
await page.click('#keyboard [data-note="21"]');await page.click('#keyboard [data-note="108"]');
await page.waitForFunction(()=>document.querySelector('[data-note="108"]').classList.contains('active'));
await page.click('#reset');}

await page.click('#settingsButton');await page.selectOption('#themeSelect','dark');await page.click('#settingsClose');await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
await page.evaluate(()=>Object.defineProperty(navigator,'requestMIDIAccess',{value:async()=>{throw Error('Denied')},configurable:true}));await page.click('#connect');assert.equal(await page.locator('#status').innerText(),'');
assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);console.log('PASS: actual Chromium offline load, mock Web MIDI, N6, Swiss correction, virtual keyboard and key inference');
}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
