'use strict';
// Required CI gate after each platform build; fail before uploading any absent,
// empty or stale-version installer. Native install and MIDI still need hardware.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{verify}=require('./verify-pack.cjs');
const [platform,arch]=process.argv.slice(2),root=path.resolve(__dirname,'..'),version=require('../package.json').version;
assert.ok(['win','mac'].includes(platform));assert.ok(['x64','arm64'].includes(arch));
const dir=platform==='win'?(arch==='x64'?'win-unpacked':'win-arm64-unpacked'):(arch==='x64'?'mac':'mac-arm64');verify(path.join(root,'dist',dir),platform==='win'?'win32':'darwin');
for(const ext of platform==='win'?['exe']:['dmg','zip']){const name='PhyChord'+version+'-'+(platform==='win'?'Windows-':'macOS-')+arch+(platform==='win'?'-Setup':'')+'.'+ext;assert.ok(fs.statSync(path.join(root,'dist',name)).size>1024*1024,'Missing/incomplete installer '+name);console.log('PASS: required release installer '+name)}
