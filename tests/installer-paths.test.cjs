'use strict';
// Compile the real installer against a tiny fixture with a space in its path.
// On Windows, additionally reproduce the old mixed-separator failure. Fixture
// payloads test File /r lookup only; full app content is verified by build gates.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),{getMakeNsisPath}=require('app-builder-lib/out/toolsets/windows');
(async()=>{const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'phychord nsis paths-')),script=fs.readFileSync(path.join(root,'desktop/installer.nsi'),'utf8');try{
fs.mkdirSync(path.join(temp,'build'));fs.copyFileSync(path.join(root,'build/icon.ico'),path.join(temp,'build/icon.ico'));
for(const dir of ['win-unpacked','win-arm64-unpacked']){const out=path.join(temp,'dist',dir);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'PhyChord.exe'),'NSIS path fixture');fs.mkdirSync(path.join(out,'resources'));fs.writeFileSync(path.join(out,'resources/app.asar'),'nested path fixture')}
const compiler=await getMakeNsisPath();
function compile(arch,text,suffix=''){const source=path.join(temp,arch+suffix+'.nsi'),exe=path.join(temp,arch+suffix+'.exe');fs.writeFileSync(source,'!define PROJECT_DIR "'+temp+'"\n!define VERSION "2.2.1"\n!define '+(arch==='arm64'?'APP_ARM64':'APP_64')+' "fixture"\nOutFile "'+exe+'"\n'+text);const option=process.platform==='win32'?'/INPUTCHARSET':'-INPUTCHARSET';return spawnSync(compiler.path,[option,'UTF8',source],{env:{...process.env,...compiler.env},encoding:'utf8',timeout:60000})}
for(const arch of ['x64','arm64']){const result=compile(arch,script);assert.equal(result.status,0,result.stderr||result.stdout||String(result.error));assert.ok(fs.statSync(path.join(temp,arch+'.exe')).size>1000);console.log('PASS: '+process.platform+' NSIS '+arch+' full installer script locates nested payloads in a path containing spaces');
if(process.platform==='win32'){const old=script.replaceAll('\\dist\\win-unpacked\\*','/dist/win-unpacked/*').replaceAll('\\dist\\win-arm64-unpacked\\*','/dist/win-arm64-unpacked/*'),failed=compile(arch,old,'-old');assert.notEqual(failed.status,0);assert.match(failed.stderr+failed.stdout,/no files found/i);console.log('PASS: native Windows reproduces old '+arch+' mixed-separator glob failure')}}
}finally{fs.rmSync(temp,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
