'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),asar=require('@electron/asar');
const root=path.resolve(__dirname,'..');
const packagedFiles=['index.html','desktop/main.cjs','desktop/security.cjs','desktop/preload.cjs','desktop/icon.png','LICENSE-Bravura.txt','LICENSE-PianoSamples.md'];
function verify(directory,platform){const app=platform==='darwin'?path.join(directory,'PhyChord.app/Contents'):directory,resources=path.join(app,platform==='darwin'?'Resources':'resources'),bundle=path.join(resources,'app.asar');
 assert.ok(fs.existsSync(path.join(app,platform==='darwin'?'MacOS/PhyChord':'PhyChord.exe')),'Missing packaged executable in '+directory);
 for(const name of packagedFiles)assert.deepEqual(asar.extractFile(bundle,name),fs.readFileSync(path.join(root,name)),'Stale packaged source: '+name);
 assert.equal(JSON.parse(asar.extractFile(bundle,'package.json')).version,require('../package.json').version,'Packaged version differs');
 console.log('PASS: packaged executable, current source, icon, licenses and version in '+directory);
}
module.exports=context=>verify(context.appOutDir,context.electronPlatformName);
module.exports.verify=verify;
