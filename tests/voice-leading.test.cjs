'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const ctx={assert,console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf('\n// Browser initialization.')),ctx);
vm.runInContext(`
let count=0;const C={tonic:0,mode:'major'};
const has=(list,rule,category)=>list.some(x=>x.rule===rule&&(!category||x.category===category));
const test=(condition,message)=>{assert.ok(condition,message);count++};
const a={B:48,T:55,A:60,S:64},parallel={B:50,T:57,A:62,S:65};
test(has(VoiceLeading.check(a,parallel,C),'parallel-fifths','A'),'parallel fifth');
test(has(VoiceLeading.check(a,parallel,C),'parallel-octaves','A'),'parallel octave');
test(!has(VoiceLeading.check(a,{B:48,T:55,A:62,S:65},C),'parallel-fifths'),'stationary voices not parallel');
test(!has(VoiceLeading.check(a,{B:50,T:53,A:59,S:62},C),'parallel-fifths'),'contrary motion not parallel fifth');
test(has(VoiceLeading.check(null,{B:60,T:55,A:64,S:72},C),'crossing','A'),'crossing');
test(has(VoiceLeading.check(null,{B:36,T:48,A:60,S:72},C),'range','B'),'range is convention');
test(has(VoiceLeading.check(null,{B:48,T:50,A:67,S:72},C),'upper-spacing','A'),'upper spacing');
test(VoiceLeading.check(a,null,C)[0].category==='unavailable','no identities no claims');
const V7={B:43,T:53,A:59,S:62},I={B:48,T:52,A:60,S:64};
test(!has(VoiceLeading.check(V7,I,C),'leading-tone'),'leading tone correctly resolves');
test(!has(VoiceLeading.check(V7,I,C),'seventh-resolution'),'seventh correctly resolves');
test(has(VoiceLeading.check(V7,{...I,T:55},C),'seventh-resolution','A'),'unresolved seventh');
test(has(VoiceLeading.check(V7,{...I,A:55},C),'leading-tone','B'),'frustrated inner leading tone convention');
test(has(VoiceLeading.check(V7,{...I,A:55},C,{strictLeadingTone:true}),'leading-tone','A'),'explicit strict leading tone');
test(!has(VoiceLeading.check(V7,{B:45,T:53,A:60,S:64},C),'seventh-resolution'),'no tonic resolution context no strict claim');
for(let tonic=0;tonic<12;tonic++)for(const mode of ['major','minor']){
 const k={tonic,mode},shift=f=>Object.fromEntries(Object.entries(f).map(([v,n])=>[v,n+tonic]));
 test(!has(VoiceLeading.check(shift(V7),shift({...I,T:mode==='minor'?51:52}),k),'seventh-resolution'),'transposed seventh solution');
 const c=Classical.analyze([48+tonic+7,48+tonic+11,48+tonic+14],k).find(x=>x.id==='diatonic');
 test(c.spelling[pc(tonic+11)]===Spelling.degree(k,7,11),'major V uses raised leading tone spelling in minor');
}
const A={tonic:9,mode:'minor'};const dominant=Classical.analyze([52,56,59],A).find(x=>x.id==='diatonic');test(dominant.spelling[8]==='G♯','A minor E major spells G sharp');
const Csecondary=Classical.analyze([57,61,64,67],C).find(x=>x.id==='V/ii');test(Csecondary.spelling[1]==='C♯','secondary dominant of ii spells C sharp');
console.log('PASS: '+count+' explicit SATB, contextual rule and spelling assertions');
`,ctx);
