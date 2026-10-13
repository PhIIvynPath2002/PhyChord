'use strict';
const APP_ORIGIN='app://phychord';
function trusted(url){try{const u=new URL(url);return u.protocol==='app:'&&u.hostname==='phychord'&&!u.port}catch{return false}}
function allow(permission,url,details={}){return trusted(url)&&permission==='midi'&&!details.sysex}
module.exports={APP_ORIGIN,trusted,allow};
