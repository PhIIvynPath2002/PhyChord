'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const ctx={assert,console};vm.createContext(ctx);vm.runInContext(source.slice(0,source.indexOf('\nNAMES.forEach')),ctx);vm.runInContext(`
let count=0;const check=(b,m)=>{assert.ok(b,m);count++},C={tonic:0,mode:'major'},G={tonic:7,mode:'major'},F={tonic:5,mode:'major'},a={tonic:9,mode:'minor'};
const event=text=>({notes:text.split(' ').map(Notation.parse),beats:4});
check(PivotHarmony.keyLabel({tonic:10,mode:'major'})==='bB','flat B major box');check(PivotHarmony.keyLabel({tonic:6,mode:'minor'})==='#f','sharp f minor box');check(PivotHarmony.keyLabel({tonic:9,mode:'major'})==='A','A major box');
const sequence=['C3 E4 G4','A2 C4 E4','D3 F#3 A3 C4','G2 B3 D4','D3 F#3 A3 C4','G2 B3 D4','G2 B3 D4'].map(event),rows=ScoreAnalysis.run(sequence,C),analysis=PivotHarmony.annotations(sequence,rows,C);
check(analysis.transitions.length===1,'one sustained key transition');const pivot=analysis.transitions[0].pivot;check(pivot?.index===1,'Am chosen as pivot before D7');check(pivot.old.function==='TSVI'&&pivot.fresh.function==='SII','vi in C becomes ii in G');check(analysis.marks[2].function==='D7'&&analysis.marks[3].function==='T','new-key functions retrospectively applied');
const svg=Notation.svg(sequence,{width:1000,key:C,cursor:1,annotations:analysis.marks});check(svg.includes('class="pivot-bracket"'),'bracket printed');check(svg.includes('class="roman-label"')&&svg.includes('class="pop-label"'),'three-layer annotation');check(svg.includes('data-key="G"'),'new G box');check(svg.includes('data-key="C"'),'initial C box');
const direct=['C3 E4 G4','D3 F#3 A3 C4','G2 B3 D4','D3 F#3 A3 C4','G2 B3 D4','G2 B3 D4'].map(event);const directTransition=PivotHarmony.detect(direct,C,G,5);check(directTransition&&!directTransition.pivot,'old applied dominant is not common pivot');
const remote={tonic:1,mode:'major'},remoteSequence=['C3 E4 G4','Ab2 C4 Eb4 Gb4','Db3 F4 Ab4','Ab2 C4 Eb4 Gb4','Db3 F4 Ab4'].map(event);const distant=PivotHarmony.detect(remoteSequence,C,remote,4);check(distant&&!distant.pivot,'distant key uses box only');
const transient=['C3 E4 G4','A2 C#4 E4 G4','D3 F4 A4'].map(event);check(PivotHarmony.annotations(transient,ScoreAnalysis.run(transient,C),C).transitions.length===0,'one tonicization no modulation box');
const Fsequence=['C3 E4 G4','F3 A3 C4','C3 E4 G4 Bb4','F3 A3 C4'].map(event);const toF=PivotHarmony.detect(Fsequence,C,F,3);check(toF.pivot.old.function==='S'&&toF.pivot.fresh.function==='T','IV to I common chord');
const relative=['C3 E4 G4','F3 A3 C4','E3 G#3 B3 D4','A2 C4 E4'].map(event);const toMinor=PivotHarmony.detect(relative,C,a,3);check(toMinor.pivot.old.function==='S'&&toMinor.pivot.fresh.function==='TSVI','relative minor common VI');
const dminor={tonic:2,mode:'minor'},bookExample=['D3 F3 A3','C3 E3 G3','F2 A3 C4'].map(event),bookPivot=PivotHarmony.detect(bookExample,dminor,F,2);
check(bookPivot?.pivot?.index===1&&bookPivot.pivot.old.roman==='VII'&&bookPivot.pivot.fresh.roman==='V','OMT textbook natural VII in d minor becomes V in F major');
for(let tonic=0;tonic<12;tonic++){
 const old={tonic,mode:'major'},fresh={tonic:pc(tonic+7),mode:'major',spelling:Spelling.degree(old,5,7)};
 const offsets=[[0,4,7],[9,12,16],[2,6,9,12],[7,11,14]],events=offsets.map((ints,index)=>{const k=index>=2?fresh:old,ns=ints.map(i=>48+tonic+i),c=Classical.analyze(ns,k)[0],map={...Spelling.auto(k),...(c?.spelling||{})};return {notes:ns.map(n=>Notation.fromMidi(n,map)),beats:4}});
 const transition=PivotHarmony.detect(events,old,fresh,3);check(!!transition?.pivot,'transposed vi-to-ii pivot '+tonic);
}
for(let tonic=0;tonic<12;tonic++){
 const old={tonic,mode:'minor'},fresh={tonic:pc(tonic+7),mode:'minor',spelling:Spelling.degree(old,5,7)};
 const offsets=[[0,3,7],[0,3,7],[2,6,9,12],[7,10,14]],events=offsets.map((ints,index)=>{const k=index>=2?fresh:old,ns=ints.map(i=>48+tonic+i),c=Classical.analyze(ns,k)[0],map={...Spelling.auto(k),...(c?.spelling||{})};return {notes:ns.map(n=>Notation.fromMidi(n,map)),beats:4}});
 const transition=PivotHarmony.detect(events,old,fresh,3);check(transition?.pivot?.old.function==='T'&&transition?.pivot?.fresh.function==='S','transposed minor i-to-iv pivot '+tonic);
}
const cursor=Notation.svg([event('C3 E4 G4')],{width:500,key:C,cursor:0});check(cursor.includes('x1="140" x2="140"'),'selected cursor right of chord');
const tail=Notation.svg([event('C3 E4 G4')],{width:500,key:C,cursor:1});check(tail.includes('x1="140" x2="140"'),'tail cursor follows last completed chord');
console.log('PASS: '+count+' pivot, key-box, three-row annotation and cursor checks');
`,ctx);
