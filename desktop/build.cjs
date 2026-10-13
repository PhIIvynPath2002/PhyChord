'use strict';
const {build,Platform,Arch}=require('electron-builder'),path=require('node:path'),os=require('node:os');
const platform=process.argv[2];
if(!['windows','macos'].includes(platform)){console.error('Use: node desktop/build.cjs windows|macos');process.exit(1)}
process.env.ELECTRON_BUILDER_CACHE=process.env.ELECTRON_BUILDER_CACHE||path.join(os.tmpdir(),'phychord-builder');
const targets=platform==='windows'?Platform.WINDOWS.createTarget(['nsis'],Arch.x64,Arch.arm64):Platform.MAC.createTarget(['zip'],Arch.x64,Arch.arm64);
build({targets,config:{electronDownload:{cache:path.join(os.tmpdir(),'phychord-electron')}}}).catch(error=>{console.error(error.message);process.exitCode=1});
