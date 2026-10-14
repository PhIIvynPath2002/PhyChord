'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const ctx={assert,console};vm.createContext(ctx);vm.runInContext(source.slice(0,source.indexOf('\nNAMES.forEach')),ctx);vm.runInContext(`
let count=0;const check=(b,m)=>{assert.ok(b,m);count++};const C={tonic:0,mode:'major'},event=t=>({notes:t.split(' ').map(Notation.parse),beats:4});
const lowerC=Notation.at(118,'bass',C);check(lowerC.midi===60&&lowerC.clef==='bass','bass upper ledger maps middle C');check(Notation.position(lowerC,Notation.staff(lowerC))===118,'manual middle C remains on bass ledger');const midiC=Notation.fromMidi(60);check(Notation.staff(midiC)==='treble'&&Notation.position(midiC,'treble')===86,'MIDI middle C defaults to treble lower ledger');check(Notation.svg([{notes:[lowerC,midiC],beats:4}],{key:C}).includes('data-clef="bass"'),'render preserves manual staff selection');
const cluster=['F#3','G3','Ab3','A3','Bb3'].map(Notation.parse),packed=Notation.placements([{notes:cluster}],C)[0];for(let i=0;i<cluster.length;i++)for(let j=i+1;j<cluster.length;j++){const dx=Math.abs(packed.heads.get(i)-packed.heads.get(j))*22,dy=Math.abs(Notation.position(cluster[i],'bass')-Notation.position(cluster[j],'bass'));check(dx>=22||dy>=10,'neighbouring heads have distinct collision-free positions')}check(packed.accColumns>=2,'dense accidentals occupy separate columns');
const white=Notation.svg([event('C3 G3 C4 E4')],{key:C,cursor:1});check(!white.includes('class="accidental"'),'first white notes have no natural');check(!white.includes('4/4'),'no time signature');check(!white.includes('harmony-label'),'no unnecessary labels');check(white.includes('scoreCursor'),'cursor present');
const chromatic=Notation.svg([event('F#4'),event('F#4'),event('F4')],{key:C});check((chromatic.match(/class="accidental"/g)||[]).length===2,'sharp then natural cancellation, no repeated sharp');check(chromatic.includes('♮'),'natural cancels sharp');
const G={tonic:7,mode:'major'};check(!Notation.svg([event('F#4')],{key:G}).includes('class="accidental"'),'key signature accounts for F sharp');check(Notation.svg([event('F4')],{key:G}).includes('class="accidental"'),'F natural cancels key signature');
for(let t=0;t<12;t++){
 check(PopHarmony.analyze([0,7,10,2,5].map(n=>48+t+n),null).text.endsWith('11'),'dominant 11 omits third');
 check(PopHarmony.analyze([0,4,7,10,2,5].map(n=>48+t+n),null).text.endsWith('9(add11)'),'ninth plus 11 retains third');
 check(PopHarmony.analyze([0,4,7,10,2,9].map(n=>48+t+n),null).text.endsWith('13'),'dominant 13');
 check(PopHarmony.analyze([0,4,10,9].map(n=>48+t+n),null).text.endsWith('13'),'13 omitted fifth ninth');
}
check(PopHarmony.analyze([43,50,53,57,60],C).text==='G11','G11 common voicing');
check(PopHarmony.analyze([43,47,50,53,57,60],C).text==='G9(add11)','G9 with C not silently called standard G11');
const portrait=Notation.svg([event('A0 C8')],{columns:6,width:794,key:C,cursor:1});check(portrait.includes('1123')||portrait.includes('viewBox'),'portrait A4 layout');check(!portrait.includes('harmony-label'),'portrait pure notation');
const layout=Notation.grandStaffLayout(),bounds=MusicGlyphs.brace.bounds;
check(layout.right<layout.staffLeft-layout.lineWidth/2,'brace stays clear of connector stroke');
check(Math.abs(layout.braceY-bounds[3]*layout.scaleY-layout.top)<1e-9,'brace top aligns top staff line');
check(Math.abs(layout.braceY-bounds[1]*layout.scaleY-layout.bottom)<1e-9,'brace bottom aligns bottom staff line');
check(layout.staffLeft<38+MusicGlyphs.treble.bounds[0]*.04,'treble has its own space right of connector');
check(layout.staffLeft<39+MusicGlyphs.bass.bounds[0]*.04,'bass has its own space right of connector');
console.log('PASS: '+count+' whole-note, accidental, cursor and extended chord checks');
`,ctx);
