'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const code=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const ctx={console,assert};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf('\n// Browser initialization.')),ctx);
vm.runInContext(`
let checks=0;const test=(yes,message)=>{assert.ok(yes,message);checks++};const C={tonic:0,mode:'major'};
const event=(text,voices=true,beats=1)=>({notes:text.split(' ').map(Notation.parse),voices,beats});
test(Notation.parse('Db4').midi===61,'flat spelling parse');test(Notation.parse('Fb4').midi===64,'flat E pitch');test(Notation.parse('B#3').midi===60,'octave boundary enharmonic');test(Notation.fromMidi(59,{11:'C♭'}).octave===4,'C flat octave');
assert.throws(()=>Notation.parse('H4'));assert.throws(()=>Notation.parse('C10'));
test(Notation.position(Notation.parse('E4'),'treble')===76,'treble bottom E4');test(Notation.position(Notation.parse('G2'),'bass')===168,'bass bottom G2');
test(Notation.at(76,'treble',C).midi===64,'staff click maps E4');test(Notation.at(71,'treble',{tonic:7,mode:'major'}).midi===66,'staff uses F sharp in G');
const source=event('C3 G3 C4 E4'),result=Recommendation.generate([source],0,C);
console.log('C tonic recommendation count:',result.candidates.length,result.message);
test(result.candidates.length>=2,'multiple classical continuations');
for(const c of result.candidates){const f=Recommendation.frame(c.event),before=Recommendation.frame(source);test(VoiceLeading.check(before,f,C,{strictLeadingTone:true}).every(x=>x.category==='C'),'recommended voicing passes rules');test(c.reason.length>10&&c.constraints.includes('七音'),'explain reason and limits');test(c.event.notes.length===4,'concrete SATB notes')}
test(Recommendation.generate([event('C3 E4 G4',false)],0,C).candidates.length===0,'no assumed voice identity');
const cadence=Recommendation.generate([source],0,C,{cadence:'half'});test(cadence.candidates.every(c=>c.function?.startsWith('D')),'half cadence only dominant');
const V7=event('G2 F3 B3 D4'),closed=Recommendation.generate([V7],0,C,{cadence:'authentic'});test(closed.candidates.length>=1,'V7 tonic solution');test(closed.candidates.every(c=>c.event.notes[1].midi===52),'seventh F resolves down to E');test(closed.candidates.every(c=>c.event.notes[2].midi===60),'leading B resolves C');
const chronology=[event('C3 G3 C4 E4'),event('A2 G3 C#4 E4'),event('D3 A3 D4 F4')];
const analysis=ScoreAnalysis.run(chronology,C);test(analysis[1].status.includes('临时主音化'),'secondary dominant to ii marked tonicization');test(analysis[2].key.tonic===0,'one tonicization not modulation');
const modulation=ScoreAnalysis.run(['C3 G3 C4 E4','D3 A3 C4 F#4','G2 D3 G3 B3','D3 A3 C4 F#4','G2 D3 G3 B3','G2 D3 G3 B3'].map(t=>event(t)),C);
test(modulation.some(r=>r.status.includes('转调候选')&&r.key.tonic===7),'sustained G cadences update key');
const svg=Notation.svg([event('Db3 F3 Ab3 Db4')],{key:{tonic:0,mode:'minor'}});test(svg.includes('data-midi="61"')&&svg.includes('♭'),'written flats appear in staff');
for(let tonic=0;tonic<12;tonic++)for(const mode of ['major','minor']){
 const k={tonic,mode},base=[48,55,60,mode==='major'?64:63].map(n=>n+tonic),source={notes:base.map(n=>Notation.fromMidi(n,Spelling.auto(k))),voices:true,beats:1};
 const r=Recommendation.generate([source],0,k);test(r.candidates.length>=1,'transposed classical voicing search');for(const c of r.candidates)test(VoiceLeading.check(Recommendation.frame(source),Recommendation.frame(c.event),k,{strictLeadingTone:true}).every(x=>x.category==='C'),'transposed recommendation rules');
}
test(Recommendation.generate([source,event('G3 B3 D4',false)],0,C).candidates.length===0,'unconfirmed subsequent voice identities prevent two-sided claim');
console.log('PASS: '+checks+' score, notation, contextual analysis and recommendation checks');
`,ctx);
