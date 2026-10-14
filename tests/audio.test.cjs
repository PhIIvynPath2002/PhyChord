'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
let context,frame;const positions=[];
class AudioContext {
 constructor(){context=this;this.currentTime=10;this.destination={};this.oscillators=[];this.suspended=false}
 async resume(){this.suspended=false} async suspend(){this.suspended=true}
 createBuffer(){return {duration:1/44100}}
 async decodeAudioData(){return {duration:.1}}
 createBufferSource(){const o={playbackRate:{},connect(){},disconnect(){},start(t){this.startTime=t},stop(t){this.stopTime=t}};this.oscillators.push(o);return o}
 createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
}
const ctx=vm.createContext({atob:text=>Buffer.from(text,'base64').toString('binary'),window:{AudioContext,requestAnimationFrame(fn){frame=fn;return 1},cancelAnimationFrame(){frame=null}},console});vm.runInContext(source.slice(0,source.indexOf('\nNAMES.forEach')),ctx);const audio=vm.runInContext('AudioPreview',ctx);
audio.subscribePosition(index=>positions.push(index));
const first={notes:[{midi:60},{midi:64},{midi:67}],beats:4},second={notes:[{midi:55},{midi:59}],beats:99};
(async()=>{
 await audio.toggleSequence([first,{notes:[]},second]);assert.equal(audio.kind,'score');assert.equal(context.oscillators.length,6);
 const sound=vm.runInContext('SoundControl',ctx),gate=sound.output(context);sound.set(false);assert.equal(gate.gain.value,0);assert.equal(audio.state,'playing','mute keeps score playback running');assert.ok(frame,'mute keeps cursor tracking');sound.set(true);assert.equal(gate.gain.value,1);
 const beat=60/52;assert.deepEqual(positions,[0]);context.currentTime=10+beat+.001;frame();assert.deepEqual(positions,[0,2],'cursor follows original indices across empty slots');context.currentTime=10;for(const o of context.oscillators.slice(0,3)){assert.equal(o.startTime,10);assert.equal(o.stopTime,10+beat)}
 for(const o of context.oscillators.slice(3,5)){assert.equal(o.startTime,10+beat);assert.equal(o.stopTime,10+2*beat)}
 await audio.toggleSequence([second]);assert.equal(audio.state,'paused');assert.equal(context.suspended,true);assert.equal(frame,null,'paused cursor stops tracking');
 await audio.toggleSequence([second]);assert.equal(audio.state,'playing');assert.equal(context.oscillators.length,6,'resume does not restart');
 for(const o of context.oscillators.slice(0,3))o.onended();assert.equal(audio.state,'playing','continues through later harmony');
 for(const o of context.oscillators.slice(3,5))o.onended();assert.equal(audio.state,'playing','short samples cannot shorten beat');context.oscillators[5].onended();assert.equal(audio.state,'stopped');
 await audio.toggleSequence([first,second]);assert.equal(context.oscillators[6].buffer.duration,.1,'replay starts first harmony');
 const stale=context.oscillators.slice(6);audio.stop();await audio.play(second);for(const o of stale)o.onended();assert.equal(audio.kind,'preview','stale callbacks cannot stop new playback');
 await audio.toggleSequence([first]);assert.equal(audio.kind,'score','toolbar starts score instead of resuming candidate');audio.stop();
 await audio.toggleSequence([{notes:[]}]);assert.equal(audio.state,'stopped');
 console.log('PASS: audio sequence, 52 BPM timing, pause/resume, restart and cancellation');
})().catch(error=>{console.error(error);process.exitCode=1});
