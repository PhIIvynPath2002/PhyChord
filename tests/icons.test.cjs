'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n)),pkg=JSON.parse(read('package.json'));
function png(data,size){assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);assert.equal(data[24],8);assert.equal(data[25],6,'RGBA preserves icon transparency')}
for(const size of [16,24,32,48,64,128,256,512,1024])png(read('build/icons/icon-'+size+'.png'),size);
for(const variant of ['square','rounded-square','circle','maskable'])png(read('build/icons/'+variant+'.png'),1024);
const ico=read(pkg.build.win.icon);assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),7);
for(let i=0;i<7;i++){const at=6+16*i,size=ico[at]||256;assert.equal(ico[at+1]||256,size);const length=ico.readUInt32LE(at+8),offset=ico.readUInt32LE(at+12);assert.ok(offset+length<=ico.length);png(ico.subarray(offset,offset+length),size)}
const icns=read(pkg.build.mac.icon);assert.equal(icns.toString('ascii',0,4),'icns');assert.equal(icns.readUInt32BE(4),icns.length);const sizes={icp4:16,icp5:32,icp6:64,ic07:128,ic08:256,ic09:512,ic10:1024,ic11:32,ic12:64,ic13:256,ic14:512},seen=[];
for(let offset=8;offset<icns.length;){const type=icns.toString('ascii',offset,offset+4),length=icns.readUInt32BE(offset+4);assert.ok(length>8&&offset+length<=icns.length);assert.ok(sizes[type]);png(icns.subarray(offset+8,offset+length),sizes[type]);seen.push(type);offset+=length}
assert.deepEqual(seen,Object.keys(sizes));assert.deepEqual(read('desktop/icon.png'),read('build/icons/icon-512.png'));assert.ok(pkg.build.files.includes('desktop/icon.png'));assert.ok(read('desktop/main.cjs').toString().includes("icon:path.join(__dirname,'icon.png')"));
console.log('PASS: 9 raster sizes, 4 layouts, 7 Windows ICO entries, 11 macOS ICNS normal/Retina entries, packaged window icon.');
