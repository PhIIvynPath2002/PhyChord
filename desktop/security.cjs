'use strict';
const APP_ORIGIN='app://phychord';
function trusted(url){try{const u=new URL(url);return u.protocol==='app:'&&u.hostname==='phychord'&&!u.port&&!u.username&&!u.password}catch{return false}}
// Chromium BlockMidiByDefault routes non-SysEx MIDI through midiSysex too.
// The renderer guard still rejects {sysex:true}; never enable it in the app API.
function allow(permission,url,details={}){return trusted(url)&&['midi','midiSysex'].includes(permission)&&details.sysex!==true&&details.isMainFrame!==false&&(!details.requestingUrl||trusted(details.requestingUrl))}
module.exports={APP_ORIGIN,trusted,allow};
