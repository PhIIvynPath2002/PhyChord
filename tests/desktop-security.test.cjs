'use strict';
const assert=require('node:assert/strict'),{trusted,allow}=require('../desktop/security.cjs');
assert.ok(trusted('app://phychord/index.html'));assert.ok(allow('midi','app://phychord/index.html'));
for(const url of ['https://phychord.com','app://evil/index.html','file:///tmp/index.html','app://phychord.evil/index.html'])assert.equal(allow('midi',url),false);
assert.equal(allow('midiSysex','app://phychord/index.html'),true);assert.equal(allow('midi','app://phychord/index.html',{sysex:true}),false);assert.equal(allow('camera','app://phychord/index.html'),false);
console.log('PASS: desktop MIDI permission scope and navigation origin policy');

assert.equal(allow('midiSysex','app://phychord/index.html',{sysex:true}),false);assert.equal(allow('midi','app://phychord/index.html',{requestingUrl:'https://evil.invalid'}),false);assert.equal(allow('midi','app://phychord/index.html',{isMainFrame:false}),false);assert.equal(trusted('app://evil@phychord/index.html'),false);
