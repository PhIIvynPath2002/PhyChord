'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const source=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const ctx=vm.createContext({assert,console});vm.runInContext(source.slice(0,source.indexOf('\n// Browser initialization.')),ctx);
vm.runInContext(`let checks=0;const examples=[[[0,5,7],'sus4'],[[0,2,7],'sus2'],[[0,4,7,9],'6'],[[0,3,7,9],'m6'],[[0,4,7,9,2],'6/9'],[[0,5,7,10],'7sus4'],[[0,2,7,10],'7sus2'],[[0,4,7,2],'add2'],[[0,3,7,2],'m(add2)'],[[0,4,10],'7'],[[0,3,7,11],'m(maj7)'],[[0,4,7,10,1],'7b9'],[[0,4,7,10,3],'7#9'],[[0,4,7,10,2,6],'9#11'],[[0,4,7,10,2,9],'13'],[[0,4,10,2,9],'13'],[[0,7],'5']];
for(let root=0;root<12;root++)for(const [ints,suffix] of examples){const notes=ints.map(n=>48+root+n),result=PopHarmony.analyze(notes,null);assert.equal(result.text,Spelling.tonics[root]+suffix);assert.equal(result.exact,true);checks++}
assert.ok(PopHarmony.analyze([60,64,67,69],null).candidates.includes('Am7/C'),'sixth/seventh ambiguity retained');
assert.equal(PopHarmony.analyze([53,57,60],null).text,'F');assert.equal(PopHarmony.analyze([57,60,65],null).text,'F/A');
assert.equal(PopHarmony.analyze([55,62,65,69,72],null).text,'G11');assert.equal(PopHarmony.analyze([55,59,62,65,69,72],null).text,'G9(add11)','third-bearing ninth plus C is not silently called G11');
assert.equal(PopHarmony.analyze([61,38],null).text,'','arbitrary dyad retains note-name display');
const accept=Tonality.accept;Tonality.accept=()=>{throw Error('pop mode must not infer a key')};State.mode='play';State.notes=[60,64,67];Analysis.commit();assert.equal(Tonality.current,null);Tonality.accept=accept;
console.log('PASS: '+checks+' transposed popular chords, ambiguous readings and pop mode independence');`,ctx);
