'use strict';
const {app,BrowserWindow,protocol,session,dialog,ipcMain}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const {APP_ORIGIN,trusted,allow}=require('./security.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
const partition='default',records=[];let window,appSession,midiGranted=false;
function record(kind,data){records.push({time:new Date().toISOString(),kind,...data});if(records.length>60)records.shift()}
function createWindow(){
 window=new BrowserWindow({width:1180,height:850,minWidth:380,minHeight:500,title:'PhyChord',icon:path.join(__dirname,'icon.png'),autoHideMenuBar:true,webPreferences:{session:appSession,preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 window.webContents.on('will-navigate',(event,url)=>{if(!trusted(url))event.preventDefault()});
 window.webContents.on('did-fail-load',(_,code,description,url)=>record('load-error',{code,description,url}));
 window.webContents.on('render-process-gone',(_,details)=>record('renderer-error',details));
 window.loadURL(APP_ORIGIN+'/index.html');window.on('closed',()=>{window=null});
}
app.whenReady().then(()=>{
 appSession=session.defaultSession;
 appSession.protocol.handle('app',request=>{
 const u=new URL(request.url);if(!trusted(request.url)||u.pathname!=='/index.html')return new Response('Not found',{status:404});
 return new Response(fs.readFileSync(path.join(__dirname,'../index.html')),{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-src 'none'",'Permissions-Policy':'midi=(self)'}});
 });
 appSession.setPermissionCheckHandler((contents,permission,origin,details)=>{
 const granted=midiGranted&&allow(permission,origin,details)&&!!contents&&trusted(contents.getURL());
 record('permission-check',{permission,origin,granted});return granted;
 });
 appSession.setPermissionRequestHandler(async(contents,permission,callback,details)=>{
 const url=contents.getURL();record('permission-request',{permission,url,details});if(!allow(permission,url,details))return callback(false);
 if(midiGranted)return callback(true);
 try{const result=await dialog.showMessageBox(window,{type:'question',title:'本地 MIDI 权限 / Local MIDI',message:'允许 PhyChord 使用本机 MIDI 键盘？ / Allow local MIDI keyboard access?',detail:'仅非 SysEx 音符与控制器消息，在本机处理。 / Non-SysEx notes and controllers; local processing only.',buttons:['允许 / Allow','取消 / Cancel'],defaultId:0,cancelId:1});midiGranted=result.response===0;record('permission-result',{permission,granted:midiGranted});callback(midiGranted)}catch(error){record('permission-error',{message:error.message});callback(false)}
 });
 ipcMain.handle('phychord:midi-diagnostics',event=>{
 if(!trusted(event.senderFrame?.url)||event.senderFrame!==event.sender.mainFrame)throw new Error('Untrusted diagnostics request');
 return {framework:'Electron',electron:process.versions.electron,chromium:process.versions.chrome,platform:process.platform,arch:process.arch,partition,midiGranted,appVersion:app.getVersion(),permissions:[...records]};
 });
 createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()});
});
app.on('window-all-closed',()=>app.quit());
