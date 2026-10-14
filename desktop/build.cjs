'use strict';
const {build,Platform,Arch}=require('electron-builder'),path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const platform=process.argv[2];
if(!['windows','macos'].includes(platform)){console.error('Use: node desktop/build.cjs windows|macos');process.exit(1)}
process.env.ELECTRON_BUILDER_CACHE=process.env.ELECTRON_BUILDER_CACHE||path.join(os.tmpdir(),'phychord-builder');
const targets=platform==='windows'?Platform.WINDOWS.createTarget(['nsis'],Arch.x64,Arch.arm64):Platform.MAC.createTarget(['zip'],Arch.x64,Arch.arm64);
build({targets,config:{electronDownload:{cache:path.join(os.tmpdir(),'phychord-electron')}}}).then(files=>{
 const version=require('../package.json').version;
 for(const arch of ['x64','arm64']){const name='PhyChord'+version+(platform==='windows'?'-Windows-'+arch+'-Setup.exe':'-macOS-'+arch+'.zip'),file=path.resolve(__dirname,'../dist',name);
  if(!files.some(f=>path.resolve(f)===file)||!fs.existsSync(file)||fs.statSync(file).size<1024*1024)throw new Error('Build did not produce a complete installer: '+name);
 }
}).catch(error=>{console.error(error.message);process.exitCode=1});
