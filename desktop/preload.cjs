'use strict';
const {contextBridge,ipcRenderer}=require('electron');
// Keep the existing Web MIDI adapter. This guards both navigator and its prototype
// before page scripts run, while Chromium handles CoreMIDI internally on macOS.
contextBridge.executeInMainWorld({func:()=>{
 if(location.protocol!=='app:'||location.hostname!=='phychord')return;
 const native=navigator.requestMIDIAccess;if(typeof native!=='function')return;
 const request=function(options={}){if(options?.sysex)return Promise.reject(new DOMException('PhyChord supports non-SysEx MIDI only.','NotSupportedError'));return native.call(navigator,{sysex:false})};
 Object.defineProperty(Navigator.prototype,'requestMIDIAccess',{value:request,writable:false,configurable:false});
 Object.defineProperty(navigator,'requestMIDIAccess',{value:request,writable:false,configurable:false});
}});
contextBridge.exposeInMainWorld('PhyChordDesktop',Object.freeze({diagnostics:()=>ipcRenderer.invoke('phychord:midi-diagnostics')}));
