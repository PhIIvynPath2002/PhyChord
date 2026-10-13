'use strict';
const {app,BrowserWindow,protocol,session,dialog}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const {APP_ORIGIN,trusted,allow}=require('./security.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
let window;
function createWindow(){
 window=new BrowserWindow({width:1180,height:850,minWidth:380,minHeight:500,title:'PhyChord',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 window.webContents.on('will-navigate',(event,url)=>{if(!trusted(url))event.preventDefault()});
 window.loadURL(APP_ORIGIN+'/index.html');
 window.on('closed',()=>{window=null});
}
app.whenReady().then(()=>{
 protocol.handle('app',request=>{
 const u=new URL(request.url);if(!trusted(request.url)||u.pathname!=='/index.html')return new Response('Not found',{status:404});
 const bytes=fs.readFileSync(path.join(__dirname,'../index.html'));
 return new Response(bytes,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'",'Permissions-Policy':'midi=(self)'}});
 });
 session.defaultSession.setPermissionCheckHandler((webContents,permission,requestingOrigin,details)=>allow(permission,requestingOrigin,details));
 session.defaultSession.setPermissionRequestHandler(async(webContents,permission,callback,details)=>{
 const url=webContents.getURL();if(!allow(permission,url,details))return callback(false);
 const result=await dialog.showMessageBox(window,{type:'question',title:'本地 MIDI 权限',message:'允许 PhyChord 读取本机 MIDI 键盘？',detail:'音符只在本机分析，不上传。',buttons:['允许','取消'],defaultId:0,cancelId:1});callback(result.response===0);
 });
 createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()});
});
app.on('window-all-closed',()=>app.quit());
