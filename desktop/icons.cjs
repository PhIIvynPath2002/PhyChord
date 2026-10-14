'use strict';
// Packaging-only raster exports. Uniform resize + centered padding preserve the
// logo proportions. Requires ImageMagick 7 only when regenerating committed PNGs.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'build/icons'),master=path.join(dir,'master.png');
const png=(name,args)=>{const out=path.join(dir,name);execFileSync('magick',[...args,'-depth','8','PNG32:'+out]);return out};
const sizes=[16,24,32,48,64,128,256,512,1024];
for(const size of sizes)png('icon-'+size+'.png',[master,'-resize',size+'x'+size]);
const square=png('square.png',['-size','1024x1024','xc:white',master,'-compose','over','-composite']);
png('rounded-square.png',[master]);
png('circle.png',['-size','1024x1024','xc:none','-fill','white','-draw','circle 512,512 512,12','(',master,'-resize','850x850',')','-gravity','center','-compose','over','-composite']);
png('maskable.png',['-size','1024x1024','xc:white','(',master,'-resize','700x700',')','-gravity','center','-compose','over','-composite']);
fs.copyFileSync(path.join(dir,'icon-512.png'),path.join(root,'desktop/icon.png'));
// Windows ICO: PNG-compressed images, including high-DPI 256px. No stretching.
const icoSizes=sizes.filter(n=>n<=256),header=Buffer.alloc(6+16*icoSizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(icoSizes.length,4);let offset=header.length;const images=[];
icoSizes.forEach((size,i)=>{const data=fs.readFileSync(path.join(dir,'icon-'+size+'.png')),at=6+16*i;header[at]=header[at+1]=size===256?0:size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(data.length,at+8);header.writeUInt32LE(offset,at+12);images.push(data);offset+=data.length});
fs.writeFileSync(path.join(root,'build/icon.ico'),Buffer.concat([header,...images]));
// macOS ICNS: native and Retina slots use lossless PNGs, down to 16px.
const slots=[['icp4',16],['icp5',32],['icp6',64],['ic07',128],['ic08',256],['ic09',512],['ic10',1024],['ic11',32],['ic12',64],['ic13',256],['ic14',512]];
const chunks=slots.map(([type,size])=>{const data=fs.readFileSync(path.join(dir,'icon-'+size+'.png')),h=Buffer.alloc(8);h.write(type);h.writeUInt32BE(data.length+8,4);return Buffer.concat([h,data])});
const h=Buffer.alloc(8);h.write('icns');h.writeUInt32BE(8+chunks.reduce((n,c)=>n+c.length,0),4);fs.writeFileSync(path.join(root,'build/icon.icns'),Buffer.concat([h,...chunks]));
console.log('Generated proportional PNG, circle, square, maskable, ICO and ICNS icons.');
