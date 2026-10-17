const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const users = [];
const friends = {};
const requests = {};
const messages = {};
const onlineUsers = new Set();

const HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BIN - Chat</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',sans-serif}
html,body{height:100%;width:100%}
body{background:#e9eef5;overflow:hidden}
.hidden{display:none!important}
.auth{position:fixed;inset:0;z-index:100;background:linear-gradient(135deg,#0052cc,#007bff,#00c6ff);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}
.card{background:#fff;border-radius:24px;padding:40px 34px;max-width:420px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.35);margin:auto}
.brand{text-align:center;font-size:36px;font-weight:800;letter-spacing:8px;background:linear-gradient(90deg,#0052cc,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.sub{text-align:center;color:#888;font-size:13px;margin-bottom:26px}
h2{text-align:center;color:#0052cc;margin-bottom:18px;font-size:22px}
input{width:100%;padding:14px 16px;margin:9px 0;border:2px solid #e4e8ee;border-radius:13px;font-size:15px;outline:0;background:#f7f9fc}
input:focus{border-color:#007bff;background:#fff;box-shadow:0 0 0 4px rgba(0,123,255,.13)}
button{width:100%;padding:15px;background:linear-gradient(90deg,#0052cc,#007bff);color:#fff;border:0;border-radius:13px;font-size:16px;font-weight:700;cursor:pointer;margin-top:16px;box-shadow:0 8px 20px rgba(0,82,204,.3)}
.msg{text-align:center;margin-top:12px;font-size:13.5px;min-height:20px;font-weight:600}
.err{color:#e53935}.ok{color:#43a047}
.main{position:fixed;inset:0;display:flex;flex-direction:column;background:#e9eef5;z-index:10;overflow:hidden}
.hd{background:#fff;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e0e0e0;min-height:66px}
.hu{display:flex;align-items:center;gap:12px;flex:1}
.av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#0052cc,#00c6ff);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px}
.hn{font-weight:700;font-size:15.5px}
.hs{font-size:12px;color:#43a047}
.ha{display:flex;gap:8px}
.ib{width:40px;height:40px;border-radius:50%;border:0;background:#f0f2f5;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#555;margin:0}
.lb{background:#f0f2f5;border:0;color:#555;padding:9px 16px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;width:auto;margin:0}
.ct{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0}
.tb{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0}
.pad{padding:20px;overflow-y:auto;flex:1;min-height:0}
.sec{font-size:13px;font-weight:700;color:#0052cc;text-transform:uppercase;padding:10px 4px;margin-top:8px}
.row{display:flex;gap:10px;margin-bottom:16px}
.row input{flex:1;margin:0}
.row button{padding:13px 26px;width:auto;margin:0}
.card2{background:#fff;padding:22px;border-radius:18px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.06);margin-bottom:12px}
.card2 h3{color:#0052cc;margin-bottom:8px}
.card2 p{color:#777;font-size:13.5px;margin-bottom:16px}
.card2 button{padding:11px 28px;width:auto;margin:0}
.list{display:flex;flex-direction:column;gap:10px}
.item{background:#fff;padding:14px 18px;border-radius:14px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.05);cursor:pointer}
.av2{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#0052cc,#00c6ff);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0}
.inf{flex:1;min-width:0}
.nm{font-weight:700;font-size:15px;color:#222}
.sb{font-size:12.5px;color:#888;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.empty{text-align:center;color:#999;padding:34px 15px;font-size:14px}
.chat{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;background:#e9eef5}
.ch{flex:1;overflow-y:auto;padding:24px 8% 20px;display:flex;flex-direction:column;gap:16px;min-height:0}
.mr{display:flex;align-items:flex-end;gap:10px;max-width:100%}
.mr.me{flex-direction:row-reverse}
.mav{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0}
.mav.o{background:linear-gradient(135deg,#ff9800,#f57c00)}
.mav.m{background:linear-gradient(135deg,#0052cc,#00c6ff)}
.mw{display:flex;flex-direction:column;max-width:60%}
.mr.me .mw{align-items:flex-end}
.ms{font-size:12px;color:#666;margin-bottom:4px;padding:0 6px;font-weight:600}
.mb{padding:11px 16px;border-radius:18px;font-size:15px;line-height:1.45;word-wrap:break-word;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.mr.o .mb{background:#fff;color:#111;border-top-left-radius:4px}
.mr.me .mb{background:linear-gradient(135deg,#d1e7ff,#b8d9ff);color:#001a33;border-top-right-radius:4px}
.mt{font-size:11px;color:#888;margin-top:4px;padding:0 6px}
.mg{display:inline-block;font-size:10.5px;background:rgba(0,123,255,.15);color:#0052cc;padding:2px 8px;border-radius:9px;margin-top:5px;font-weight:600}
.tool{background:#fff;border-top:1px solid #e5e5e5;padding:10px 8% 14px;display:flex;flex-direction:column;gap:8px;flex-shrink:0;position:relative;z-index:2}
.ic{display:flex;gap:14px;font-size:20px;padding-bottom:8px;border-bottom:1px solid #f0f0f0}
.ic span{cursor:pointer;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:8px;user-select:none}
.ic span:hover{color:#007bff;background:#eef6ff}
.tt{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px;flex-wrap:wrap;color:#555}
.tt select{padding:6px 10px;border-radius:8px;border:1px solid #ccc;font-size:13px;outline:0;background:#fafbfc}
.tt label{display:flex;align-items:center;gap:4px;cursor:pointer}
.ir{display:flex;align-items:center;gap:10px;background:#f4f7fb;border-radius:24px;padding:5px 5px 5px 18px;border:2px solid transparent}
.ir:focus-within{border-color:#007bff;background:#fff}
.ir input{flex:1;padding:10px 0;border:0;outline:0;font-size:15.5px;background:transparent;min-width:0;margin:0;box-shadow:none!important;border-radius:0}
.sb2{background:linear-gradient(135deg,#0052cc,#007bff);color:#fff;border:0;width:46px;height:46px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin:0;padding:0}
.nav{display:flex;background:#fff;border-top:1px solid #e5e5e5;padding:8px 0;flex-shrink:0}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;font-size:12px;color:#888;cursor:pointer;padding:8px 0;position:relative;user-select:none}
.ni span{font-size:22px;margin-bottom:2px}
.ni.active{color:#007bff;font-weight:700}
.bd{position:absolute;top:6px;right:26%;background:#e53935;color:#fff;font-size:10.5px;font-weight:700;min-width:18px;height:18px;border-radius:9px;padding:0 5px;display:flex;align-items:center;justify-content:center}
.set{padding:20px;overflow-y:auto;flex:1;min-height:0}
.sg{background:#fff;border-radius:16px;margin-bottom:18px;box-shadow:0 3px 14px rgba(0,0,0,.06);overflow:hidden}
.st{background:linear-gradient(90deg,#f0f4f9,#e6eef8);padding:12px 20px;font-size:13px;font-weight:700;color:#0052cc;text-transform:uppercase}
.si{padding:16px 20px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;font-size:14.5px}
.si:last-child{border-bottom:0}
.si .v{color:#888;font-weight:600}
.lg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px}
.li{padding:12px;background:#f4f7fb;border:2px solid transparent;border-radius:10px;text-align:center;cursor:pointer;font-size:13.5px}
.li.selected{background:linear-gradient(135deg,#0052cc,#007bff);color:#fff;font-weight:700}
.langP{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);overflow-y:auto}
.pc{width:100%;max-width:560px;max-height:90vh;background:#0d1117;color:#fff;padding:30px;border-radius:24px;border:1px solid #1f2937;display:flex;flex-direction:column;margin:auto}
.pc h3{text-align:center;margin-bottom:22px;font-size:20px;color:#4da3ff}
.pg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;overflow-y:auto;padding:4px;margin-bottom:22px;flex:1;max-height:380px}
.pi{padding:14px 12px;background:#161b22;border:2px solid #21262d;border-radius:12px;text-align:center;cursor:pointer;font-size:14px;color:#c9d1d9}
.pi.selected{background:linear-gradient(135deg,#0052cc,#007bff);border-color:#4da3ff;color:#fff;font-weight:700}
.call{position:fixed;inset:0;z-index:5000;background:linear-gradient(135deg,#001a4d,#0052cc,#001a4d);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:20px}
.cav{width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,#4da3ff,#007bff);display:flex;align-items:center;justify-content:center;font-size:54px;font-weight:700}
.cn{font-size:30px;font-weight:700}
.cs{font-size:16px;opacity:.9}
.ct2{font-size:15px;opacity:.75;margin-top:-14px}
.cac{display:flex;gap:28px;margin-top:36px}
.cb{width:74px;height:74px;border-radius:50%;border:0;cursor:pointer;font-size:30px;display:flex;align-items:center;justify-content:center;margin:0}
.cb.hang{background:#e53935;color:#fff}
.cb.acc{background:#43a047;color:#fff}
.cb.mute{background:rgba(255,255,255,.22);color:#fff;width:60px;height:60px;font-size:24px}
.cb.mute.muted{background:#ff9800}
.audio{display:none}
.toast{position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(20,20,20,.92);color:#fff;padding:14px 26px;border-radius:30px;font-size:14px;font-weight:600;z-index:6000;max-width:90%;text-align:center}
@media(min-width:900px){.mw{max-width:45%}.ch{padding:30px 15% 24px}.tool{padding:12px 15% 16px}.pad,.set{padding:24px 15%}}
</style></head><body>

<div id="auth" class="auth"><div class="card">
  <div class="brand">BIN</div>
  <div class="sub">Ứng dụng chat & kết bạn</div>
  <h2>🔐 Đăng Nhập</h2>
  <input id="lu" placeholder="Tên đăng nhập (từ 3 ký tự)" autocomplete="off">
  <input id="lp" type="password" placeholder="Mật khẩu (từ 3 ký tự)">
  <button id="bl" type="button">ĐĂNG NHẬP</button>
  <div id="lm" class="msg"></div>
  <div class="sub" style="margin-top:14px;font-size:12.5px">💡 Nhập tên mới → bấm ĐĂNG NHẬP để tự đăng ký</div>
</div></div>

<div id="langP" class="langP hidden"><div class="pc">
  <h3>🌐 Dịch sang tiếng nào?</h3>
  <div class="pg" id="lg"></div>
  <button id="bcl" type="button">XÁC NHẬN</button>
</div></div>

<div id="app" class="main hidden">
  <div class="hd"><div class="hu" id="hu"></div><div class="ha" id="ha"></div></div>
  <div class="ct">
    <div id="t-fri" class="tb hidden"><div class="pad">
      <div class="sec">🔍 Tìm và kết bạn</div>
      <div class="row"><input id="fs" placeholder="Tên tài khoản..."><button id="bfs" type="button">Tìm</button></div>
      <div id="fr"></div>
      <div class="sec">📨 Lời mời</div><div id="pl" class="list"></div>
      <div class="sec">👥 Bạn bè</div><div id="fl" class="list"></div>
    </div></div>
    <div id="t-chat" class="tb"><div class="pad">
      <div class="sec">💬 Chọn bạn để nhắn tin</div>
      <div id="cfl" class="list"></div>
      <div id="ce" class="empty">Chưa có bạn bè.</div>
    </div></div>
    <div id="t-room" class="tb hidden"><div class="chat"><div class="ch" id="chh"></div></div></div>
    <div id="t-set" class="tb hidden"><div class="set">
      <div class="sg"><div class="st">👤 Tài khoản</div><div class="si"><label>Tên</label><span class="v" id="su"></span></div></div>
      <div class="sg"><div class="st">🌐 Ngôn ngữ mặc định</div><div class="lg" id="slg"></div></div>
      <div class="sg"><div class="st">ℹ️ Thông tin</div><div class="si"><label>Phiên bản</label><span class="v">BIN v10</span></div><div class="si" style="cursor:pointer" id="bca"><label>⚠️ Xóa tất cả</label><span class="v" style="color:#e53935">›</span></div></div>
    </div></div>
  </div>
  <div class="tool hidden" id="tool">
    <div class="ic"><span id="te">😊</span><span id="tq">⚡</span><span id="tc">👤</span><span id="tm">•••</span></div>
    <div class="tt"><label>Dịch:</label><select id="ts"></select><label><input type="radio" name="to" value="y" checked> Dịch</label><label><input type="radio" name="to" value="n"> Không</label></div>
    <div class="ir"><input id="mi" placeholder="Nhập tin nhắn..." autocomplete="off"><button id="bs" class="sb2" type="button">➤</button></div>
  </div>
  <div class="nav">
    <div class="ni" id="nf" data-tab="fri"><span>👥</span>Kết bạn<div class="bd hidden" id="bd">0</div></div>
    <div class="ni active" id="nc" data-tab="chat"><span>💬</span>Nhắn tin</div>
    <div class="ni" id="ns" data-tab="set"><span>⚙️</span>Cài đặt</div>
  </div>
</div>
<audio id="ra" autoplay class="audio"></audio>
<script src="/socket.io/socket.io.js"></script>
<script>
(function(){
'use strict';
var S=io(),me=null,L='Tiếng Anh',F=null,myF=[],myR=[],mgs={},onl=[];
var pc=null,ls=null,cc=null,ccu=null,ct=null,mu=false;
var LANG=[{n:'Tiếng Việt',c:'vi'},{n:'Tiếng Anh',c:'en'},{n:'Tiếng Trung',c:'zh-CN'},{n:'Tiếng Nhật',c:'ja'},{n:'Tiếng Hàn',c:'ko'},{n:'Tiếng Pháp',c:'fr'},{n:'Tiếng Đức',c:'de'},{n:'Tiếng Tây Ban Nha',c:'es'},{n:'Tiếng Nga',c:'ru'},{n:'Tiếng Ả Rập',c:'ar'},{n:'Tiếng Bồ Đào Nha',c:'pt'},{n:'Tiếng Ý',c:'it'},{n:'Tiếng Thái',c:'th'},{n:'Tiếng Lào',c:'lo'},{n:'Tiếng Campuchia',c:'km'},{n:'Tiếng Ấn Độ',c:'hi'},{n:'Tiếng Indonesia',c:'id'},{n:'Tiếng Malaysia',c:'ms'},{n:'Tiếng Thổ Nhĩ Kỳ',c:'tr'},{n:'Tiếng Hà Lan',c:'nl'}];
function $(i){return document.getElementById(i)}
function E(s){return String(s).replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function T(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t)},2000)}
function B(el,fn){if(!el)return;el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();fn(e)})}
function nt(){var d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function ck(a,b){return[a,b].sort().join('::')}

B($('bl'),function(){
  var u=$('lu').value.trim(),p=$('lp').value.trim();
  if(!u||!p){$('lm').textContent='⚠️ Nhập đủ!';$('lm').className='msg err';return}
  if(u.length<3||p.length<3){$('lm').textContent='⚠️ Từ 3 ký tự!';$('lm').className='msg err';return}
  S.emit('login',{username:u,password:p},function(r){
    if(!r||!r.ok){$('lm').textContent='❌ '+(r&&r.error||'Lỗi');$('lm').className='msg err';return}
    me=r.user;myF=r.friends||[];myR=r.requests||[];mgs=r.messages||{};onl=r.onlineUsers||[];
    $('lm').textContent='✅ OK!';$('lm').className='msg ok';
    setTimeout(function(){$('auth').classList.add('hidden');$('langP').classList.remove('hidden');renderL()},400);
  });
});
function renderL(){var g=$('lg');if(!g)return;g.innerHTML='';LANG.forEach(function(l){var d=document.createElement('div');d.className='pi'+(l.n===L?' selected':'');d.textContent=l.n;B(d,function(){L=l.n;renderL()});g.appendChild(d)})}
B($('bcl'),function(){$('langP').classList.add('hidden');$('app').classList.remove('hidden');fillTS();renderSL();setH();refresh();goTab('chat')});
function fillTS(){var s=$('ts');if(!s)return;s.innerHTML='';LANG.forEach(function(l){var o=document.createElement('option');o.value=l.n;o.textContent=l.n;if(l.n===L)o.selected=true;s.appendChild(o)})}
function renderSL(){var g=$('slg');if(!g)return;g.innerHTML='';LANG.forEach(function(l){var d=document.createElement('div');d.className='li'+(l.n===L?' selected':'');d.textContent=l.n;B(d,function(){L=l.n;renderSL();fillTS()});g.appendChild(d)})}
function setH(){$('hu').innerHTML='<div class="av">'+E(me.charAt(0).toUpperCase())+'</div><div><div class="hn">'+E(me)+'</div><div class="hs">● Đang hoạt động</div></div>';var a=$('ha');a.innerHTML='';var b=document.createElement('button');b.className='lb';b.textContent='Thoát';B(b,function(){if(confirm('Đăng xuất?'))location.reload()});a.appendChild(b)}
function setHC(fn){$('hu').innerHTML='<div class="av" style="background:linear-gradient(135deg,#ff9800,#f57c00)">'+E(fn.charAt(0).toUpperCase())+'</div><div><div class="hn">'+E(fn)+'</div><div class="hs">● Đang hoạt động</div></div>';var a=$('ha');a.innerHTML='';var bk=document.createElement('button');bk.className='ib';bk.textContent='←';B(bk,closeChat);var cb=document.createElement('button');cb.className='ib';cb.textContent='📞';B(cb,function(){startCall(fn,'voice')});var vb=document.createElement('button');vb.className='ib';vb.textContent='🎥';B(vb,function(){startCall(fn,'video')});a.appendChild(bk);a.appendChild(cb);a.appendChild(vb)}
function goTab(t){document.querySelectorAll('.tb').forEach(function(c){c.classList.add('hidden')});document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('active')});var el=$('t-'+t);if(el)el.classList.remove('hidden');var nv=$('n'+t);if(nv)nv.classList.add('active');if(t==='room'){$('tool').classList.remove('hidden')}else{$('tool').classList.add('hidden');setH()}if(t==='set'){$('su').textContent=me;renderSL()}if(t==='fri'||t==='chat')refresh()}
document.querySelectorAll('.ni').forEach(function(n){B(n,function(){var t=n.getAttribute('data-tab');goTab(t==='fri'?'fri':t==='chat'?'chat':'set')})});

function refresh(){
  var pl=$('pl');pl.innerHTML='';if(myR.length===0)pl.innerHTML='<div class="empty">Không có.</div>';else myR.forEach(function(n){var it=document.createElement('div');it.className='item';it.innerHTML='<div class="av2">'+E(n.charAt(0).toUpperCase())+'</div><div class="inf"><div class="nm">'+E(n)+'</div><div class="sb">Muốn kết bạn</div></div><div style="display:flex;gap:5px"><button class="acc" style="padding:7px 12px;width:auto;margin:0;border-radius:7px;border:0;background:#43a047;color:#fff;font-weight:700;font-size:12px;cursor:pointer">Nhận</button><button class="dec" style="padding:7px 12px;width:auto;margin:0;border-radius:7px;border:0;background:#e4e6eb;color:#555;font-weight:700;font-size:12px;cursor:pointer">Từ chối</button></div>';B(it.querySelector('.acc'),function(){S.emit('acceptFriend',{from:n},function(r){if(r&&r.ok){myF.push(n);myR=myR.filter(function(x){return x!==n});T('🎉 Đã kết bạn');refresh()}})});B(it.querySelector('.dec'),function(){S.emit('declineFriend',{from:n},function(){myR=myR.filter(function(x){return x!==n});refresh()})});pl.appendChild(it)});
  var fl=$('fl');fl.innerHTML='';if(myF.length===0)fl.innerHTML='<div class="empty">Chưa có.</div>';else myF.forEach(function(n){var it=document.createElement('div');it.className='item';it.innerHTML='<div class="av2">'+E(n.charAt(0).toUpperCase())+'</div><div class="inf"><div class="nm">'+E(n)+'</div><div class="sb">Bạn bè</div></div><div style="color:#007bff;font-size:20px">›</div>';B(it,function(){openChat(n)});fl.appendChild(it)});
  var cf=$('cfl');cf.innerHTML='';if(myF.length===0){$('ce').classList.remove('hidden')}else{$('ce').classList.add('hidden');myF.forEach(function(n){var it=document.createElement('div');it.className='item';var k=ck(me,n),l=(mgs[k]||[]).slice(-1)[0],sb=l?(l.from===me?'Bạn: ':'')+l.text.substring(0,35):'Bấm để chat';it.innerHTML='<div class="av2">'+E(n.charAt(0).toUpperCase())+'</div><div class="inf"><div class="nm">'+E(n)+'</div><div class="sb">'+E(sb)+'</div></div><div style="color:#007bff;font-size:20px">›</div>';B(it,function(){openChat(n)});cf.appendChild(it)})}
  var bd=$('bd');if(myR.length>0){bd.textContent=myR.length;bd.classList.remove('hidden')}else bd.classList.add('hidden');
}

B($('bfs'),function(){
  var v=$('fs').value.trim();if(!v){$('fr').innerHTML='<p style="color:#888;text-align:center;padding:12px">Nhập tên.</p>';return}
  S.emit('searchUser',{query:v},function(r){
    if(!r||!r.ok){$('fr').innerHTML='<div class="card2" style="color:#e53935">❌ Không tìm thấy!</div>';return}
    var n=r.username;if(n===me){$('fr').innerHTML='<div class="card2">👤 Đây là bạn!</div>';return}
    if(myF.indexOf(n)!==-1){$('fr').innerHTML='<div class="card2"><h3>✅ '+E(n)+'</h3><p>Đã là bạn</p><button id="gc" type="button">💬 Nhắn tin</button></div>';B($('gc'),function(){openChat(n)});return}
    $('fr').innerHTML='<div class="card2"><h3>👤 '+E(n)+'</h3><p>Tài khoản BIN</p><button id="sr" type="button">➕ Gửi lời mời</button></div>';
    B($('sr'),function(){S.emit('sendFriendRequest',{to:n},function(r){if(r&&r.ok){T('✅ Đã gửi');$('fr').innerHTML='<div class="card2">⏳ Đã gửi đến '+E(n)+'</div>'}else{T('❌ Lỗi')}})});
  });
});
$('fs').addEventListener('keypress',function(e){if(e.key==='Enter')$('bfs').click()});

function openChat(fn){F=fn;setHC(fn);document.querySelectorAll('.tb').forEach(function(c){c.classList.add('hidden')});$('t-room').classList.remove('hidden');$('tool').classList.remove('hidden');document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('active')});renderChat(fn);setTimeout(function(){if($('mi'))$('mi').focus()},100)}
function closeChat(){F=null;goTab('chat')}
function renderChat(fn){
  var h=$('chh');if(!h)return;var k=ck(me,fn),l=mgs[k]||[];h.innerHTML='';
  if(l.length===0){h.innerHTML='<div style="text-align:center;color:#999;padding:60px 15px;font-size:14.5px">Bắt đầu chat với '+E(fn)+'</div>';return}
  l.forEach(function(m){
    if(h.children.length===1&&h.children[0].textContent.indexOf('Bắt đầu')>-1)h.innerHTML='';
    var s=m.from===me?'me':'o',row=document.createElement('div');row.className='mr '+s;
    var a=document.createElement('div');a.className='mav '+(s==='me'?'m':'o');a.textContent=m.from.charAt(0).toUpperCase();row.appendChild(a);
    var w=document.createElement('div');w.className='mw';
    var nm=document.createElement('div');nm.className='ms';nm.textContent=m.from===me?'Bạn':m.from;w.appendChild(nm);
    var b=document.createElement('div');b.className='mb';b.textContent=m.text;w.appendChild(b);
    if(m.translatedTag){var tg=document.createElement('div');tg.className='mg';tg.textContent='🌐 '+m.translatedTag;w.appendChild(tg)}
    var tm=document.createElement('div');tm.className='mt';tm.textContent=m.time||'';w.appendChild(tm);
    row.appendChild(w);h.appendChild(row);h.scrollTop=h.scrollHeight;
  });
  h.scrollTop=h.scrollHeight;
}

function translate(text,lang){
  return new Promise(function(res){
    var lc=null;LANG.forEach(function(l){if(l.n===lang)lc=l});
    if(!lc||lc.c==='vi')return res(text);
    var url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='+lc.c+'&dt=t&q='+encodeURIComponent(text);
    var ctl=new AbortController();var tm=setTimeout(function(){ctl.abort()},7000);
    fetch(url,{signal:ctl.signal}).then(function(r){return r.json()}).then(function(d){
      clearTimeout(tm);
      if(Array.isArray(d)&&d[0]&&Array.isArray(d[0])){var r=d[0].map(function(x){return x[0]||''}).join('');if(r)return res(r)}
      var p='vi|'+lc.c;
      fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+encodeURIComponent(p)).then(function(r){return r.json()}).then(function(x){if(x&&x.responseData&&x.responseData.translatedText)res(x.responseData.translatedText);else res(text)}).catch(function(){res(text)});
    }).catch(function(){clearTimeout(tm);var p='vi|'+lc.c;fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+encodeURIComponent(p)).then(function(r){return r.json()}).then(function(x){if(x&&x.responseData&&x.responseData.translatedText)res(x.responseData.translatedText);else res(text)}).catch(function(){res(text)})});
  });
}

function send(){
  if(!F){T('Chưa chọn người');return}
  var inp=$('mi'),text=inp.value.trim();if(!text)return;
  var opt=document.querySelector('input[name="to"]:checked'),isT=opt?opt.value==='y':true;
  var tgt=$('ts').value,fn=F;
  inp.value='';inp.focus();
  var id='m_'+Date.now()+'_'+Math.random().toString(36).substr(2,6);
  var msg={id:id,from:me,to:fn,text:text,originalText:text,translatedTag:isT&&tgt!=='Tiếng Việt'?'Đang dịch...':null,time:nt()};
  var k=ck(me,fn);if(!mgs[k])mgs[k]=[];mgs[k].push(msg);renderChat(fn);
  S.emit('sendMessage',{to:fn,text:text,translatedTag:null,id:id});
  if(isT&&tgt!=='Tiếng Việt'){
    translate(text,tgt).then(function(tr){
      mgs[k].forEach(function(m){if(m.id===id){m.text=tr;m.translatedTag='Đã dịch sang '+tgt}});
      S.emit('sendMessage',{to:fn,text:tr,translatedTag:'Đã dịch sang '+tgt,id:id+'_tr'});
      if(F===fn)renderChat(fn);
    });
  }
}
B($('bs'),send);
$('mi').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopPropagation();send();return false}});

B($('te'),function(){
  var ex=document.querySelector('.ep');if(ex){ex.remove();return}
  var p=document.createElement('div');p.className='ep';p.style.cssText='position:absolute;bottom:100%;left:0;right:0;background:#fff;border-radius:16px;padding:14px;box-shadow:0 -8px 30px rgba(0,0,0,.15);display:flex;flex-wrap:wrap;gap:6px;max-height:200px;overflow-y:auto;margin-bottom:10px;border:1px solid #eee;z-index:10';
  ['😊','😂','🥰','😍','😎','🤔','😅','😭','😡','👍','👎','❤️','🔥','✨','🎉','🎁','💯','🙏','👏','🤝','😴','🤯','🥳','😇','🤗','😋','😱','🤩','😌'].forEach(function(e){
    var s=document.createElement('span');s.textContent=e;s.style.cssText='font-size:24px;cursor:pointer;padding:5px;border-radius:8px';B(s,function(){var i=$('mi');if(i){i.value+=e;i.focus()}p.remove()});p.appendChild(s);
  });
  $('tool').appendChild(p);
});
B($('tq'),function(){if(!F)return;var i=$('mi');if(i){i.value='Xin chào 👋';i.focus()}});
B($('tc'),function(){if(!F)return;var h='<div style="max-height:220px;overflow-y:auto;text-align:left">'+myF.map(function(n){return'<div style="padding:10px;background:#f4f7fb;border-radius:9px;margin:6px 0">👤 '+E(n)+'</div>'}).join('')+'</div>';alert('Bạn bè:\n'+myF.join('\n'))});
B($('tm'),function(){if(!F)return;if(confirm('Xóa chat này?')){var k=ck(me,F);mgs[k]=[];renderChat(F);T('Đã xóa')}});

// WEBRTC
function getSig(){try{return JSON.parse(localStorage.getItem('bin_sig')||'{}')}catch(e){return{}}}
function saveSig(v){try{localStorage.setItem('bin_sig',JSON.stringify(v))}catch(e){}}
async function startCall(target,type){
  if(cc){T('Đang trong cuộc gọi');return}
  if(!navigator.mediaDevices){T('Không hỗ trợ micro');return}
  T('Xin quyền micro...',3000);
  try{ls=await navigator.mediaDevices.getUserMedia({audio:true,video:false})}
  catch(e){T('Chưa cho phép micro');return}
  var id='c_'+Date.now();cc={id:id,peer:target,type:type,role:'caller'};
  var sg=getSig();sg[target]={id:id,from:me,type:type,status:'ringing',direction:'incoming',sdp:null,cand:null,time:Date.now()};saveSig(sg);
  makePC(target);
  try{var o=await pc.createOffer();await pc.setLocalDescription(o);var s2=getSig();if(!s2[target])s2[target]={};s2[target].sdp={type:o.type,sdp:o.sdp};saveSig(s2)}
  catch(e){hangup();return}
  showCallScreen(target,type,'outgoing',id);
}
function makePC(peer){
  pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]});
  if(ls)ls.getTracks().forEach(function(t){pc.addTrack(t,ls)});
  pc.ontrack=function(ev){var ra=$('ra');if(ra&&ev.streams[0]){ra.srcObject=ev.streams[0];ra.play().catch(function(){})}};
  pc.onicecandidate=function(ev){if(ev.candidate&&cc){var sg=getSig();if(!sg[cc.peer])sg[cc.peer]={};sg[cc.peer].cand=ev.candidate;sg[cc.peer].id=cc.id;saveSig(sg)}};
}
function showIncomingCall(sig){
  cc={id:sig.id,peer:sig.from,type:sig.type,role:'callee'};
  if(ccu&&ccu.parentNode)ccu.parentNode.removeChild(ccu);
  var o=document.createElement('div');o.className='call';
  o.innerHTML='<div class="cav">'+E(sig.from.charAt(0).toUpperCase())+'</div><div class="cn">'+E(sig.from)+'</div><div class="cs">'+(sig.type==='video'?'Video đến':'Cuộc gọi đến')+'</div>';
  var ac=document.createElement('div');ac.className='cac';
  var a=document.createElement('button');a.className='cb acc';a.textContent='📞';B(a,function(){acceptCall(sig,o)});ac.appendChild(a);
  var h=document.createElement('button');h.className='cb hang';h.textContent='📵';B(h,function(){hangup();if(o.parentNode)o.parentNode.removeChild(o);ccu=null});ac.appendChild(h);
  o.appendChild(ac);document.body.appendChild(o);ccu=o;
}
async function acceptCall(sig,o){
  try{ls=await navigator.mediaDevices.getUserMedia({audio:true,video:false})}
  catch(e){T('Không lấy được micro');hangup();if(o.parentNode)o.parentNode.removeChild(o);ccu=null;return}
  makePC(sig.from);var st=o.querySelector('.cs');if(st)st.textContent='Đang kết nối...';
  var a=o.querySelector('.cb.acc');if(a)a.remove();
  var sg=getSig();if(!sg[sig.from])sg[sig.from]={};sg[sig.from].status='accepted';saveSig(sg);
}
function showCallScreen(target,type,dir,id){
  if(ccu&&ccu.parentNode)ccu.parentNode.removeChild(ccu);
  var o=document.createElement('div');o.className='call';
  o.innerHTML='<div class="cav">'+E(target.charAt(0).toUpperCase())+'</div><div class="cn">'+E(target)+'</div><div class="cs">Đang gọi...</div>';
  var ac=document.createElement('div');ac.className='cac';
  var h=document.createElement('button');h.className='cb hang';h.textContent='📵';B(h,function(){hangup();if(o.parentNode)o.parentNode.removeChild(o);ccu=null});ac.appendChild(h);
  o.appendChild(ac);document.body.appendChild(o);ccu=o;
}
function callConnected(){
  if(!cc||!ccu)return;var st=ccu.querySelector('.cs');if(st)st.textContent='Đang trò chuyện';
  if(!ccu.querySelector('.cb.mute')){var m=document.createElement('button');m.className='cb mute';m.textContent='🎤';B(m,function(){if(!ls)return;mu=!mu;ls.getAudioTracks().forEach(function(t){t.enabled=!mu});m.textContent=mu?'🔇':'🎤';m.className='cb mute'+(mu?' muted':'')});var ac=ccu.querySelector('.cac');if(ac)ac.insertBefore(m,ac.firstChild)}
  if(ct)clearInterval(ct);var sec=0;ct=setInterval(function(){sec++;var mm=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');var t=ccu?ccu.querySelector('.ct2'):null;if(!t&&ccu){t=document.createElement('div');t.className='ct2';var s=ccu.querySelector('.cs');if(s)s.parentNode.insertBefore(t,s.nextSibling)}if(t)t.textContent=mm+':'+ss},1000);
}
function hangup(){
  if(cc){var sg=getSig();sg[cc.peer]={status:'ended',id:cc.id};if(sg[me])delete sg[me];saveSig(sg)}
  if(pc){try{pc.close()}catch(e){}pc=null}
  if(ls){ls.getTracks().forEach(function(t){t.stop()});ls=null}
  if(ct){clearInterval(ct);ct=null}mu=false;cc=null;
}
setInterval(function(){
  if(!me)return;var sg=getSig(),mine=sg[me];
  if(!cc&&mine&&mine.status==='ringing'&&mine.direction==='incoming'){showIncomingCall(mine);return}
  if(!cc)return;
  if(cc.role==='caller'&&pc&&!pc.currentRemoteDescription){var ts=sg[cc.peer];if(ts&&ts.sdp&&ts.sdp.type==='answer')pc.setRemoteDescription(new RTCSessionDescription(ts.sdp)).then(callConnected).catch(function(){})}
  if(cc.role==='callee'&&pc&&!pc.currentRemoteDescription){var cs=sg[cc.peer];if(cs&&cs.sdp&&cs.sdp.type==='offer')pc.setRemoteDescription(new RTCSessionDescription(cs.sdp)).then(function(){return pc.createAnswer()}).then(function(a){return pc.setLocalDescription(a)}).then(function(){var s2=getSig();if(!s2[cc.peer])s2[cc.peer]={};s2[cc.peer].sdp={type:pc.localDescription.type,sdp:pc.localDescription.sdp};s2[cc.peer].status='connected';saveSig(s2);callConnected()}).catch(function(){})}
  if(pc&&pc.remoteDescription&&cc){var ps=sg[cc.peer];if(ps&&ps.cand){try{pc.addIceCandidate(new RTCIceCandidate(ps.cand)).catch(function(){})}catch(e){}}}
  if(cc){var p=sg[cc.peer];if(p&&p.status==='ended'&&p.id===cc.id){hangup();if(ccu&&ccu.parentNode)ccu.parentNode.removeChild(ccu);ccu=null}}
},1500);

B($('bca'),function(){if(confirm('Xóa tất cả dữ liệu máy này?')){['bin_users','bin_friends','bin_requests','bin_messages','bin_sig'].forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});location.reload()}});

S.on('newMessage',function(d){
  var k=d.key;if(!mgs[k])mgs[k]=[];
  var ex=false;mgs[k].forEach(function(m){if(m.id===d.message.id)ex=true});
  if(!ex)mgs[k].push(d.message);
  if(F&&k===ck(me,F))renderChat(F);
  refresh();
});
S.on('friendsUpdate',function(d){if(d.user===me){myF=d.friends;refresh()}});
S.on('requestsUpdate',function(d){if(d.user===me){myR=d.requests||[];refresh()}});
S.on('onlineUsers',function(l){onl=l;refresh()});
})();
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(HTML));

io.on('connection', (socket) => {
  socket.on('login', (data, cb) => {
    const { username, password } = data || {};
    if (!username || !password) return cb({ ok: false, error: 'Thiếu thông tin' });
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) { user = { username, password }; users.push(user); }
    else if (user.password !== password) return cb({ ok: false, error: 'Sai mật khẩu' });
    socket.username = user.username;
    onlineUsers.add(user.username);
    cb({ ok: true, user: user.username, friends: friends[user.username] || [], requests: requests[user.username] || [], messages: messages, onlineUsers: Array.from(onlineUsers) });
    io.emit('onlineUsers', Array.from(onlineUsers));
  });
  socket.on('searchUser', (data, cb) => {
    const { query } = data || {};
    if (!query) return cb({ ok: false });
    const f = users.find(u => u.username.toLowerCase() === query.toLowerCase());
    if (!f) return cb({ ok: false });
    cb({ ok: true, username: f.username });
  });
  socket.on('sendFriendRequest', (data, cb) => {
    const { to } = data || {}; const from = socket.username;
    if (!from || !to) return cb({ ok: false });
    if (!requests[to]) requests[to] = [];
    if (requests[to].indexOf(from) === -1 && from !== to) requests[to].push(from);
    io.emit('requestsUpdate', { user: to, requests: requests[to] });
    cb({ ok: true });
  });
  socket.on('acceptFriend', (data, cb) => {
    const { from } = data || {}; const me = socket.username;
    if (requests[me]) requests[me] = requests[me].filter(n => n !== from);
    if (!friends[me]) friends[me] = []; if (!friends[from]) friends[from] = [];
    if (friends[me].indexOf(from) === -1) friends[me].push(from);
    if (friends[from].indexOf(me) === -1) friends[from].push(me);
    io.emit('friendsUpdate', { user: me, friends: friends[me] });
    io.emit('friendsUpdate', { user: from, friends: friends[from] });
    io.emit('requestsUpdate', { user: me, requests: requests[me] || [] });
    cb({ ok: true });
  });
  socket.on('declineFriend', (data, cb) => {
    const { from } = data || {}; const me = socket.username;
    if (requests[me]) requests[me] = requests[me].filter(n => n !== from);
    io.emit('requestsUpdate', { user: me, requests: requests[me] || [] });
    cb({ ok: true });
  });
  socket.on('sendMessage', (data, cb) => {
    const { to, text, translatedTag, id } = data || {}; const from = socket.username;
    if (!from || !to || !text) return;
    const key = [from, to].sort().join('::');
    if (!messages[key]) messages[key] = [];
    const msg = { id: id, from, to, text, translatedTag: translatedTag || null, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
    messages[key].push(msg);
    io.emit('newMessage', { key, message: msg });
  });
  socket.on('disconnect', () => {
    if (socket.username) { onlineUsers.delete(socket.username); io.emit('onlineUsers', Array.from(onlineUsers)); }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server chạy tại port ' + PORT);
});